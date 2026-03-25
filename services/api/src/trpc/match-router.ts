import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { addToSeenList, getSeenList, warmSeenListFromDb } from '../lib/seen-list.js'

// Reusable enums for match router
const GenderEnum = z.enum([
  'MAN', 'WOMAN', 'NON_BINARY', 'TRANS_MAN', 'TRANS_WOMAN',
  'GENDERQUEER', 'GENDERFLUID', 'AGENDER', 'BIGENDER', 'TWO_SPIRIT', 'OTHER'
])

const OrientationEnum = z.enum([
  'STRAIGHT', 'GAY', 'LESBIAN', 'BISEXUAL', 'PANSEXUAL',
  'QUEER', 'ASEXUAL', 'DEMISEXUAL', 'OTHER'
])

const SeekingEnum = z.enum([
  'FRIENDSHIP', 'DATING', 'CASUAL', 'RELATIONSHIP', 'PLAY_PARTNER', 'NETWORKING', 'OTHER'
])

const SwipeActionEnum = z.enum(['LIKE', 'PASS'])

// Input validation schemas
const getDiscoveryStackSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
})

const swipeSchema = z.object({
  targetId: z.string().uuid(),
  action: SwipeActionEnum,
})

const getMatchesSchema = z.object({}).strict()

const searchSchema = z.object({
  gender: z.array(GenderEnum).optional(),
  orientation: z.array(OrientationEnum).optional(),
  ageMin: z.number().int().min(18).max(99).optional(),
  ageMax: z.number().int().min(18).max(99).optional(),
  seeking: z.array(SeekingEnum).optional(),
  radiusKm: z.number().positive().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
})

export const matchRouter = router({
  getDiscoveryStack: protectedProcedure
    .input(getDiscoveryStackSchema)
    .query(async ({ ctx, input }) => {
      const profiles = await ctx.prisma.profile.findMany({
        where: {
          userId: {
            not: ctx.userId,
          },
          user: {
            status: 'ACTIVE',
          },
        },
        select: {
          id: true,
          userId: true,
          displayName: true,
          bio: true,
          age: true,
          gender: true,
          orientation: true,
          relationshipType: true,
          seeking: true,
          verified: true,
          createdAt: true,
          photos: {
            where: { isPublic: true },
            orderBy: { position: 'asc' },
            select: {
              id: true,
              url: true,
              thumbnailSmall: true,
              thumbnailMedium: true,
              thumbnailLarge: true,
              position: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      })

      // Filter out profiles that have been swiped on or seen
      const userSwiped = await ctx.prisma.swipe.findMany({
        where: { userId: ctx.userId },
        select: { targetId: true },
      })

      let seenTargetIds = new Set<string>()

      // Try to get seen list from Redis first
      let seenList = await getSeenList(ctx.redis, ctx.userId)

      // If Redis cache is empty, warm it from database
      if (seenList.length === 0) {
        await warmSeenListFromDb(ctx.prisma, ctx.redis, ctx.userId)
        seenList = await getSeenList(ctx.redis, ctx.userId)
      }

      seenTargetIds = new Set(seenList)

      const swipedTargetIds = new Set(userSwiped.map(s => s.targetId))

      const filteredProfiles = profiles.filter(profile =>
        !swipedTargetIds.has(profile.userId) && !seenTargetIds.has(profile.userId)
      )

      return filteredProfiles
    }),

  swipe: protectedProcedure
    .input(swipeSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify target profile exists
      const targetProfile = await ctx.prisma.profile.findUnique({
        where: { userId: input.targetId },
      })

      if (!targetProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Target profile not found',
        })
      }

      // Prevent swiping on self
      if (input.targetId === ctx.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot swipe on your own profile',
        })
      }

      // Upsert swipe record
      const swipe = await ctx.prisma.swipe.upsert({
        where: {
          userId_targetId: {
            userId: ctx.userId,
            targetId: input.targetId,
          },
        },
        create: {
          userId: ctx.userId,
          targetId: input.targetId,
          action: input.action,
        },
        update: {
          action: input.action,
          createdAt: new Date(),
        },
      })

      // Create or update seen profile
      await ctx.prisma.seenProfile.upsert({
        where: {
          userId_targetId: {
            userId: ctx.userId,
            targetId: input.targetId,
          },
        },
        create: {
          userId: ctx.userId,
          targetId: input.targetId,
        },
        update: {
          seenAt: new Date(),
        },
      })

      // Add to Redis seen list cache
      await addToSeenList(ctx.redis, ctx.userId, input.targetId)

      // If PASS action, return early without match checking
      if (input.action === 'PASS') {
        return { matched: false }
      }

      // Check if target has also liked the user
      const targetSwipe = await ctx.prisma.swipe.findUnique({
        where: {
          userId_targetId: {
            userId: input.targetId,
            targetId: ctx.userId,
          },
        },
      })

      // If target did not like user, no match
      if (!targetSwipe || targetSwipe.action !== 'LIKE') {
        return { matched: false }
      }

      // Mutual like detected - create match with consistent ordering
      // Sort UUIDs to ensure user1Id < user2Id for consistency
      const [user1Id, user2Id] = [ctx.userId, input.targetId].sort()

      const result = await ctx.prisma.$transaction(async (tx) => {
        const match = await tx.match.create({
          data: {
            user1Id,
            user2Id,
          },
        })

        const conversation = await tx.conversation.create({
          data: {
            matchId: match.id,
            participants: {
              createMany: {
                data: [
                  { userId: user1Id },
                  { userId: user2Id },
                ],
              },
            },
          },
        })

        return { match, conversation }
      })

      return { matched: true, matchId: result.match.id, conversationId: result.conversation.id }
    }),

  getMatches: protectedProcedure
    .query(async ({ ctx }) => {
      const matches = await ctx.prisma.match.findMany({
        where: {
          OR: [
            { user1Id: ctx.userId },
            { user2Id: ctx.userId },
          ],
        },
        select: {
          id: true,
          createdAt: true,
          user1Id: true,
          user2Id: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      // Fetch the matched user's profile for each match
      const result = await Promise.all(
        matches.map(async (match) => {
          const matchedUserId = match.user1Id === ctx.userId ? match.user2Id : match.user1Id

          const profile = await ctx.prisma.profile.findUnique({
            where: { userId: matchedUserId },
            select: {
              userId: true,
              displayName: true,
              age: true,
              bio: true,
              photos: {
                where: { isPublic: true },
                orderBy: { position: 'asc' },
                select: {
                  id: true,
                  url: true,
                  thumbnailSmall: true,
                  thumbnailMedium: true,
                  thumbnailLarge: true,
                  position: true,
                },
              },
            },
          })

          return {
            id: match.id,
            createdAt: match.createdAt,
            matchedUser: profile,
          }
        })
      )

      return result
    }),

  search: protectedProcedure
    .input(searchSchema)
    .query(async ({ ctx, input }) => {
      // Build where conditions for Prisma query
      const whereConditions: Record<string, unknown> = {
        userId: {
          not: ctx.userId,
        },
        user: {
          status: 'ACTIVE',
        },
      }

      // Add gender filter
      if (input.gender && input.gender.length > 0) {
        whereConditions.gender = { in: input.gender }
      }

      // Add orientation filter
      if (input.orientation && input.orientation.length > 0) {
        whereConditions.orientation = { in: input.orientation }
      }

      // Add age range filter
      if (input.ageMin !== undefined || input.ageMax !== undefined) {
        whereConditions.age = {}
        if (input.ageMin !== undefined) {
          (whereConditions.age as Record<string, number>).gte = input.ageMin
        }
        if (input.ageMax !== undefined) {
          (whereConditions.age as Record<string, number>).lte = input.ageMax
        }
      }

      // Add seeking filter
      if (input.seeking && input.seeking.length > 0) {
        whereConditions.seeking = {
          hasSome: input.seeking,
        }
      }

      // Fetch user's location if radius filter is requested
      let locationProfiles: { id: string }[] = []
      if (input.radiusKm !== undefined) {
        // Use raw query for PostGIS distance filtering
        // (location is Unsupported type, can't use Prisma select)
        const radiusMeters = input.radiusKm * 1000
        locationProfiles = await ctx.prisma.$queryRaw<{ id: string }[]>`
          SELECT p.id::text
          FROM profiles p
          WHERE p.user_id != ${ctx.userId}::uuid
            AND p.location IS NOT NULL
            AND ST_DWithin(
              p.location,
              (SELECT location FROM profiles WHERE user_id = ${ctx.userId}::uuid),
              ${radiusMeters}
            )
        `
      }

      // Add location filter to where conditions if we have location results
      if (input.radiusKm !== undefined) {
        if (locationProfiles.length > 0) {
          whereConditions.id = { in: locationProfiles.map(p => p.id) }
        } else {
          // No profiles within radius, return empty results
          return { profiles: [], nextCursor: null }
        }
      }

      // Pagination cursor handling
      const cursorCondition = input.cursor
        ? { id: { gt: input.cursor } }
        : {}

      // Query profiles
      const profiles = await ctx.prisma.profile.findMany({
        where: {
          ...whereConditions,
          ...cursorCondition,
        },
        select: {
          id: true,
          userId: true,
          displayName: true,
          bio: true,
          age: true,
          gender: true,
          orientation: true,
          relationshipType: true,
          seeking: true,
          verified: true,
          createdAt: true,
          photos: {
            where: { isPublic: true },
            orderBy: { position: 'asc' },
            select: {
              id: true,
              url: true,
              thumbnailSmall: true,
              thumbnailMedium: true,
              thumbnailLarge: true,
              position: true,
            },
          },
        },
        orderBy: { id: 'asc' },
        take: (input.limit ?? 20) + 1, // Fetch one extra to determine if there are more
      })

      // Determine next cursor and trim results
      let nextCursor: string | null = null
      let resultsToReturn = profiles

      if (profiles.length > (input.limit ?? 20)) {
        resultsToReturn = profiles.slice(0, input.limit ?? 20)
        nextCursor = resultsToReturn[resultsToReturn.length - 1].id
      }

      return { profiles: resultsToReturn, nextCursor }
    }),
})
