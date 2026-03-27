import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { indexIntention, removeFromIndex, updateIntentionIndex } from '../lib/intention-index.js'
import { generateIntentionFeed } from '../lib/intention-feed.js'

const IntentionSeekingEnum = z.enum(['CASUAL', 'RELATIONSHIP', 'FRIENDSHIP', 'EXPLORATION', 'EVENT', 'OTHER'])
const GenderEnum = z.enum(['MAN', 'WOMAN', 'NON_BINARY', 'TRANS_MAN', 'TRANS_WOMAN', 'GENDERQUEER', 'GENDERFLUID', 'AGENDER', 'BIGENDER', 'TWO_SPIRIT', 'OTHER'])
const OrientationEnum = z.enum(['STRAIGHT', 'GAY', 'LESBIAN', 'BISEXUAL', 'PANSEXUAL', 'QUEER', 'ASEXUAL', 'DEMISEXUAL', 'OTHER'])
const RelationshipTypeEnum = z.enum(['SINGLE', 'PARTNERED', 'MARRIED', 'OPEN_RELATIONSHIP', 'POLYAMOROUS', 'OTHER'])
const IntentionAvailabilityEnum = z.enum(['WEEKDAYS', 'WEEKENDS', 'FLEXIBLE'])

const createIntentionSchema = z.object({
  seeking: IntentionSeekingEnum,
  genderPreferences: z.array(GenderEnum).min(1),
  ageMin: z.number().int().min(18).max(99),
  ageMax: z.number().int().min(18).max(99),
  distanceRadiusKm: z.number().int().min(1).max(500),
  orientationMatch: z.array(OrientationEnum).min(1),
  availability: IntentionAvailabilityEnum,
  relationshipStructure: RelationshipTypeEnum.optional(),
  kinkTagIds: z.array(z.string().uuid()).optional(),
}).refine((data) => data.ageMin < data.ageMax, {
  message: 'ageMin must be less than ageMax',
  path: ['ageMin'],
})

const updateIntentionSchema = z.object({
  id: z.string().uuid(),
  seeking: IntentionSeekingEnum.optional(),
  genderPreferences: z.array(GenderEnum).min(1).optional(),
  ageMin: z.number().int().min(18).max(99).optional(),
  ageMax: z.number().int().min(18).max(99).optional(),
  distanceRadiusKm: z.number().int().min(1).max(500).optional(),
  orientationMatch: z.array(OrientationEnum).min(1).optional(),
  availability: IntentionAvailabilityEnum.optional(),
  relationshipStructure: RelationshipTypeEnum.optional().nullable(),
  kinkTagIds: z.array(z.string().uuid()).optional(),
}).refine((data) => {
  if (data.ageMin !== undefined && data.ageMax !== undefined) {
    return data.ageMin < data.ageMax
  }
  return true
}, {
  message: 'ageMin must be less than ageMax',
  path: ['ageMin'],
})

function calculateDaysRemaining(expiresAt: Date): number {
  const now = new Date()
  const diffMs = expiresAt.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

async function applyLazyExpiry(ctx: any, intentionId: string): Promise<void> {
  const intention = await ctx.prisma.intention.findUnique({
    where: { id: intentionId },
  })

  if (intention && (intention.status === 'ACTIVE' || intention.status === 'PAUSED') && intention.expiresAt < new Date()) {
    await ctx.prisma.intention.update({
      where: { id: intentionId },
      data: { status: 'EXPIRED' },
    })
  }
}

export const intentionRouter = router({
  create: protectedProcedure
    .input(createIntentionSchema)
    .mutation(async ({ ctx, input }) => {
      const activeCount = await ctx.prisma.intention.count({
        where: {
          userId: ctx.userId,
          status: 'ACTIVE',
        },
      })

      if (activeCount >= 3) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Maximum 3 active intentions allowed',
        })
      }

      if (input.kinkTagIds && input.kinkTagIds.length > 0) {
        const profile = await ctx.prisma.profile.findUnique({
          where: { userId: ctx.userId },
          select: { spicyModeEnabled: true },
        })

        if (!profile?.spicyModeEnabled) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Spicy mode must be enabled to add kink tags',
          })
        }
      }

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      const intention = await ctx.prisma.intention.create({
        data: {
          userId: ctx.userId,
          seeking: input.seeking,
          genderPreferences: input.genderPreferences,
          ageMin: input.ageMin,
          ageMax: input.ageMax,
          distanceRadiusKm: input.distanceRadiusKm,
          orientationMatch: input.orientationMatch,
          availability: input.availability,
          relationshipStructure: input.relationshipStructure,
          expiresAt,
          kinkTags: input.kinkTagIds && input.kinkTagIds.length > 0
            ? {
                create: input.kinkTagIds.map((kinkTagId) => ({
                  kinkTagId,
                })),
              }
            : undefined,
        },
        include: {
          kinkTags: {
            include: { kinkTag: true },
          },
        },
      })

      await indexIntention(intention)

      return {
        ...intention,
        daysRemaining: calculateDaysRemaining(intention.expiresAt),
      }
    }),

  update: protectedProcedure
    .input(updateIntentionSchema)
    .mutation(async ({ ctx, input }) => {
      const intention = await ctx.prisma.intention.findUnique({
        where: { id: input.id },
      })

      if (!intention || intention.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Intention not found',
        })
      }

      if (intention.status === 'DELETED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot update deleted intention',
        })
      }

      if (input.kinkTagIds && input.kinkTagIds.length > 0) {
        const profile = await ctx.prisma.profile.findUnique({
          where: { userId: ctx.userId },
          select: { spicyModeEnabled: true },
        })

        if (!profile?.spicyModeEnabled) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Spicy mode must be enabled to add kink tags',
          })
        }
      }

      const updateData: any = {}

      if (input.seeking !== undefined) updateData.seeking = input.seeking
      if (input.genderPreferences !== undefined) updateData.genderPreferences = input.genderPreferences
      if (input.ageMin !== undefined) updateData.ageMin = input.ageMin
      if (input.ageMax !== undefined) updateData.ageMax = input.ageMax
      if (input.distanceRadiusKm !== undefined) updateData.distanceRadiusKm = input.distanceRadiusKm
      if (input.orientationMatch !== undefined) updateData.orientationMatch = input.orientationMatch
      if (input.availability !== undefined) updateData.availability = input.availability
      if (input.relationshipStructure !== undefined) updateData.relationshipStructure = input.relationshipStructure

      const updated = await ctx.prisma.intention.update({
        where: { id: input.id },
        data: {
          ...updateData,
          kinkTags: input.kinkTagIds
            ? {
                deleteMany: {},
                create: input.kinkTagIds.map((kinkTagId) => ({
                  kinkTagId,
                })),
              }
            : undefined,
        },
        include: {
          kinkTags: {
            include: { kinkTag: true },
          },
        },
      })

      await updateIntentionIndex(intention, updated)

      return {
        ...updated,
        daysRemaining: calculateDaysRemaining(updated.expiresAt),
      }
    }),

  pause: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const intention = await ctx.prisma.intention.findUnique({
        where: { id: input.id },
      })

      if (!intention || intention.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Intention not found',
        })
      }

      if (intention.status !== 'ACTIVE') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only active intentions can be paused',
        })
      }

      const updated = await ctx.prisma.intention.update({
        where: { id: input.id },
        data: { status: 'PAUSED' },
        include: {
          kinkTags: {
            include: { kinkTag: true },
          },
        },
      })

      await removeFromIndex(updated)

      return {
        ...updated,
        daysRemaining: calculateDaysRemaining(updated.expiresAt),
      }
    }),

  resume: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const intention = await ctx.prisma.intention.findUnique({
        where: { id: input.id },
      })

      if (!intention || intention.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Intention not found',
        })
      }

      if (intention.status !== 'PAUSED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only paused intentions can be resumed',
        })
      }

      if (intention.expiresAt < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Intention has expired',
        })
      }

      const updated = await ctx.prisma.intention.update({
        where: { id: input.id },
        data: { status: 'ACTIVE' },
        include: {
          kinkTags: {
            include: { kinkTag: true },
          },
        },
      })

      await indexIntention(updated)

      return {
        ...updated,
        daysRemaining: calculateDaysRemaining(updated.expiresAt),
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const intention = await ctx.prisma.intention.findUnique({
        where: { id: input.id },
      })

      if (!intention || intention.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Intention not found',
        })
      }

      const deleted = await ctx.prisma.intention.update({
        where: { id: input.id },
        data: { status: 'DELETED' },
        include: {
          kinkTags: {
            include: { kinkTag: true },
          },
        },
      })

      await removeFromIndex(deleted)

      return {
        ...deleted,
        daysRemaining: calculateDaysRemaining(deleted.expiresAt),
      }
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const intentions = await ctx.prisma.intention.findMany({
      where: {
        userId: ctx.userId,
        status: {
          not: 'DELETED',
        },
      },
      include: {
        kinkTags: {
          include: { kinkTag: true },
        },
      },
    })

    const now = new Date()
    const expiredIds = intentions
      .filter((i) => (i.status === 'ACTIVE' || i.status === 'PAUSED') && i.expiresAt < now)
      .map((i) => i.id)

    if (expiredIds.length > 0) {
      await ctx.prisma.intention.updateMany({
        where: { id: { in: expiredIds } },
        data: { status: 'EXPIRED' },
      })
      for (const expired of intentions.filter((i) => expiredIds.includes(i.id))) {
        await removeFromIndex(expired)
      }
    }

    return intentions.map((intention) => ({
      ...intention,
      status: intention.expiresAt < now && (intention.status === 'ACTIVE' || intention.status === 'PAUSED')
        ? 'EXPIRED'
        : intention.status,
      daysRemaining: calculateDaysRemaining(intention.expiresAt),
    }))
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const intention = await ctx.prisma.intention.findUnique({
        where: { id: input.id },
        include: {
          kinkTags: {
            include: { kinkTag: true },
          },
        },
      })

      if (!intention || intention.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Intention not found',
        })
      }

      const now = new Date()
      if ((intention.status === 'ACTIVE' || intention.status === 'PAUSED') && intention.expiresAt < now) {
        await applyLazyExpiry(ctx, intention.id)
        intention.status = 'EXPIRED'
      }

      return {
        ...intention,
        daysRemaining: calculateDaysRemaining(intention.expiresAt),
      }
    }),

  getFeed: protectedProcedure
    .input(z.object({
      intentionId: z.string().uuid(),
      cursor: z.string().optional(),
      limit: z.number().int().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const intention = await ctx.prisma.intention.findUnique({
        where: { id: input.intentionId },
        include: {
          kinkTags: true,
          user: {
            include: {
              profile: {
                include: {
                  photos: {
                    orderBy: { position: 'asc' },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      })

      if (!intention || intention.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Intention not found',
        })
      }

      if (intention.status !== 'ACTIVE') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only active intentions can generate a feed',
        })
      }

      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
        select: {
          userId: true,
          gender: true,
          orientation: true,
          age: true,
          spicyModeEnabled: true,
        },
      })

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        })
      }

      return generateIntentionFeed(
        ctx.prisma,
        intention as any,
        profile,
        ctx.userId,
        input.cursor,
        input.limit
      )
    }),
})
