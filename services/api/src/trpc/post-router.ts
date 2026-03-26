import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { deleteFromR2, getPostMediaKey } from '../lib/r2.js'
import { selectAd } from '../lib/ad-engine.js'

export const postRouter = router({
  create: protectedProcedure
    .input(z.object({
      text: z.string().max(2000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.create({
        data: {
          authorId: ctx.userId,
          text: input.text,
        },
        include: {
          media: true,
          author: { select: { id: true, displayName: true } },
        },
      })
      return post
    }),

  get: protectedProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
        include: {
          media: { orderBy: { position: 'asc' } },
          author: { select: { id: true, displayName: true } },
        },
      })
      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' })
      }
      return post
    }),

  list: protectedProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input

      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        ...(cursor ? {
          cursor: { id: cursor },
          skip: 1,
        } : {}),
        orderBy: { createdAt: 'desc' },
        include: {
          media: { orderBy: { position: 'asc' } },
          author: { select: { id: true, displayName: true } },
        },
      })

      let nextCursor: string | undefined
      if (posts.length > limit) {
        const nextItem = posts.pop()
        nextCursor = nextItem?.id
      }

      return { posts, nextCursor }
    }),

  delete: protectedProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
        include: { media: true },
      })
      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' })
      }
      if (post.authorId !== ctx.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot delete another user\'s post' })
      }

      for (const media of post.media) {
        const sizes = ['original', 'small', 'medium', 'large']
        await Promise.all(sizes.map(size =>
          deleteFromR2(getPostMediaKey(post.id, media.id, size)).catch(() => {})
        ))
      }

      await ctx.prisma.post.delete({ where: { id: input.postId } })
      return { success: true }
    }),

  feed: protectedProcedure
    .input(z.object({
      cursor: z.string().uuid().optional(),
      limit: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input
      const userId = ctx.userId

      const callerProfile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
        select: { spicyModeEnabled: true },
      })
      const isVanilla = !callerProfile?.spicyModeEnabled

      const filter = await ctx.prisma.userContentFilter.findUnique({
        where: { userId },
      })
      const allowedNudity = filter?.nudityLevel ?? ['NONE']
      const allowedBodyPart = filter?.bodyPart ?? ['FACE', 'CHEST', 'BACK', 'BUTT', 'LEGS', 'FEET', 'FULL_BODY']
      const allowedActivity = filter?.activity ?? ['SELFIE', 'MIRROR', 'OUTDOOR', 'GYM', 'BEDROOM', 'ARTISTIC', 'COUPLE', 'GROUP']
      const allowedVibe = filter?.vibe ?? ['CASUAL', 'PLAYFUL', 'ROMANTIC', 'ARTISTIC']
      const allowedGender = filter?.genderPresentation ?? ['MASCULINE', 'FEMININE', 'ANDROGYNOUS', 'MIXED']

      let cursorDate: Date | null = null
      if (cursor) {
        const cursorPost = await ctx.prisma.post.findUnique({
          where: { id: cursor },
          select: { createdAt: true },
        })
        cursorDate = cursorPost?.createdAt ?? null
      }

      type FeedRow = {
        id: string
        author_id: string
        text: string | null
        created_at: Date
        updated_at: Date
        display_name: string | null
        like_count: bigint
        is_liked: boolean
        relevance_score: number
      }

      const baseSelect = Prisma.sql`
        SELECT
          p.id,
          p.author_id,
          p.text,
          p.created_at,
          p.updated_at,
          u.display_name,
          COALESCE(lc.like_count, 0) AS like_count,
          CASE WHEN ul.id IS NOT NULL THEN true ELSE false END AS is_liked,
          (
            EXP(-0.693 * EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 86400)
            * CASE WHEN sl.id IS NOT NULL THEN 0.5 ELSE 1.0 END
          ) AS relevance_score
        FROM posts p
        JOIN users u ON u.id = p.author_id
        LEFT JOIN (
          SELECT post_id, COUNT(*) AS like_count
          FROM feed_interactions
          WHERE type = 'LIKE'
          GROUP BY post_id
        ) lc ON lc.post_id = p.id
        LEFT JOIN feed_interactions ul
          ON ul.post_id = p.id AND ul.user_id = ${userId}::uuid AND ul.type = 'LIKE'
        LEFT JOIN feed_interactions sl
          ON sl.post_id = p.id AND sl.user_id = ${userId}::uuid AND sl.type = 'SHOW_LESS'
      `

      const filterClause = Prisma.sql`
        AND NOT EXISTS (
          SELECT 1 FROM content_tags ct
          JOIN post_media pm ON pm.id = ct.post_media_id
          WHERE pm.post_id = p.id
          AND (
            (ct.dimension = 'NUDITY' AND ct.value NOT IN (${Prisma.join(allowedNudity)}))
            OR (ct.dimension = 'BODY_PART' AND ct.value NOT IN (${Prisma.join(allowedBodyPart)}))
            OR (ct.dimension = 'ACTIVITY' AND ct.value NOT IN (${Prisma.join(allowedActivity)}))
            OR (ct.dimension = 'VIBE' AND ct.value NOT IN (${Prisma.join(allowedVibe)}))
            OR (ct.dimension = 'GENDER_PRESENTATION' AND ct.value NOT IN (${Prisma.join(allowedGender)}))
          )
        )
        ${isVanilla ? Prisma.sql`AND NOT EXISTS (
          SELECT 1 FROM post_media pm
          WHERE pm.post_id = p.id
          AND pm.nudity_level IN ('MEDIUM', 'HIGH')
        )` : Prisma.empty}
      `

      const posts = cursorDate
        ? await ctx.prisma.$queryRaw<FeedRow[]>`
            ${baseSelect}
            WHERE p.author_id != ${userId}::uuid
              AND (
                p.created_at < ${cursorDate}
                OR (p.created_at = ${cursorDate} AND p.id != ${cursor}::uuid)
              )
            ${filterClause}
            ORDER BY relevance_score DESC, p.created_at DESC
            LIMIT ${limit + 1}
          `
        : await ctx.prisma.$queryRaw<FeedRow[]>`
            ${baseSelect}
            WHERE p.author_id != ${userId}::uuid
            ${filterClause}
            ORDER BY relevance_score DESC, p.created_at DESC
            LIMIT ${limit + 1}
          `

      let nextCursor: string | undefined
      if (posts.length > limit) {
        const nextItem = posts.pop()
        nextCursor = nextItem?.id
      }

      const postIds = posts.map(p => p.id)
      const media = postIds.length > 0
        ? await ctx.prisma.postMedia.findMany({
            where: { postId: { in: postIds } },
            include: { tags: true },
            orderBy: { position: 'asc' },
          })
        : []

      const mediaByPost = new Map<string, typeof media>()
      for (const m of media) {
        const existing = mediaByPost.get(m.postId) ?? []
        existing.push(m)
        mediaByPost.set(m.postId, existing)
      }

      const authorIds = [...new Set(posts.map(p => p.author_id))]
      const profiles = authorIds.length > 0
        ? await ctx.prisma.profile.findMany({
            where: { userId: { in: authorIds } },
            include: {
              photos: {
                orderBy: { position: 'asc' },
                take: 1,
                select: { thumbnailSmall: true },
              },
            },
          })
        : []

      const profileByUser = new Map(profiles.map(p => [p.userId, p]))

      type PostFeedItem = {
        type: 'post'
        id: string
        authorId: string
        text: string | null
        createdAt: Date
        updatedAt: Date
        author: { id: string; displayName: string | null; avatarUrl: string | null }
        media: typeof media
        likeCount: number
        isLiked: boolean
        relevanceScore: number
      }

      type AdFeedItem = {
        type: 'ad'
        campaignId: string
        creativeId: string
        headline: string
        body: string | null
        imageUrl: string | null
        ctaUrl: string
        sponsor: string | null
      }

      type FeedItem = PostFeedItem | AdFeedItem

      const feedPosts: FeedItem[] = posts.map(p => ({
        type: 'post' as const,
        id: p.id,
        authorId: p.author_id,
        text: p.text,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        author: {
          id: p.author_id,
          displayName: p.display_name,
          avatarUrl: profileByUser.get(p.author_id)?.photos[0]?.thumbnailSmall ?? null,
        },
        media: mediaByPost.get(p.id) ?? [],
        likeCount: Number(p.like_count),
        isLiked: p.is_liked,
        relevanceScore: p.relevance_score,
      }))

      const ad = await selectAd(ctx.prisma, userId)

      if (ad) {
        const adItem: AdFeedItem = { type: 'ad' as const, ...ad }
        const insertIndex = Math.min(4, feedPosts.length)
        feedPosts.splice(insertIndex, 0, adItem)
      }

      return { posts: feedPosts, nextCursor }
    }),

  like: protectedProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.feedInteraction.upsert({
        where: {
          userId_postId_type: {
            userId: ctx.userId,
            postId: input.postId,
            type: 'LIKE',
          },
        },
        create: {
          userId: ctx.userId,
          postId: input.postId,
          type: 'LIKE',
        },
        update: {},
      })
      return { success: true }
    }),

  unlike: protectedProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.feedInteraction.deleteMany({
        where: {
          userId: ctx.userId,
          postId: input.postId,
          type: 'LIKE',
        },
      })
      return { success: true }
    }),

  showLess: protectedProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.feedInteraction.upsert({
        where: {
          userId_postId_type: {
            userId: ctx.userId,
            postId: input.postId,
            type: 'SHOW_LESS',
          },
        },
        create: {
          userId: ctx.userId,
          postId: input.postId,
          type: 'SHOW_LESS',
        },
        update: {},
      })
      return { success: true }
    }),
})
