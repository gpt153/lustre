import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { deleteFromR2, getPostMediaKey } from '../lib/r2.js'

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
})
