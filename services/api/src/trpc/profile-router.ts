import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from './middleware.js'

// Define schemas inline to avoid monorepo resolution issues at runtime
const GenderEnum = z.enum([
  'MAN', 'WOMAN', 'NON_BINARY', 'TRANS_MAN', 'TRANS_WOMAN',
  'GENDERQUEER', 'GENDERFLUID', 'AGENDER', 'BIGENDER', 'TWO_SPIRIT', 'OTHER'
])

const OrientationEnum = z.enum([
  'STRAIGHT', 'GAY', 'LESBIAN', 'BISEXUAL', 'PANSEXUAL',
  'QUEER', 'ASEXUAL', 'DEMISEXUAL', 'OTHER'
])

const RelationshipTypeEnum = z.enum([
  'SINGLE', 'PARTNERED', 'MARRIED', 'OPEN_RELATIONSHIP', 'POLYAMOROUS', 'OTHER'
])

const SeekingEnum = z.enum([
  'FRIENDSHIP', 'DATING', 'CASUAL', 'RELATIONSHIP', 'PLAY_PARTNER', 'NETWORKING', 'OTHER'
])

const ContentPreferenceEnum = z.enum(['SOFT', 'OPEN', 'EXPLICIT', 'NO_DICK_PICS'])

const createProfileSchema = z.object({
  displayName: z.string().min(2).max(50),
  bio: z.string().max(2000).optional(),
  age: z.number().int().min(18).max(99),
  gender: GenderEnum,
  orientation: OrientationEnum,
  relationshipType: RelationshipTypeEnum.optional(),
  seeking: z.array(SeekingEnum).default([]),
  contentPreference: ContentPreferenceEnum,
})

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(2000).optional().nullable(),
  age: z.number().int().min(18).max(99).optional(),
  gender: GenderEnum.optional(),
  orientation: OrientationEnum.optional(),
  relationshipType: RelationshipTypeEnum.optional().nullable(),
  seeking: z.array(SeekingEnum).optional(),
  contentPreference: ContentPreferenceEnum.optional(),
})

export const profileRouter = router({
  create: protectedProcedure
    .input(createProfileSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if profile already exists
      const existing = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
      })
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Profile already exists' })
      }

      const profile = await ctx.prisma.profile.create({
        data: {
          userId: ctx.userId,
          displayName: input.displayName,
          bio: input.bio,
          age: input.age,
          gender: input.gender,
          orientation: input.orientation,
          relationshipType: input.relationshipType,
          seeking: input.seeking,
          contentPreference: input.contentPreference,
        },
        include: {
          photos: true,
          kinkTags: { include: { kinkTag: true } },
        },
      })

      return profile
    }),

  update: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
      })
      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
      }

      const updated = await ctx.prisma.profile.update({
        where: { userId: ctx.userId },
        data: input,
        include: {
          photos: { orderBy: { position: 'asc' } },
          kinkTags: { include: { kinkTag: true } },
        },
      })

      return updated
    }),

  get: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.profile.findUnique({
      where: { userId: ctx.userId },
      include: {
        photos: { orderBy: { position: 'asc' } },
        kinkTags: { include: { kinkTag: true } },
      },
    })
    if (!profile) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }
    return profile
  }),

  getPublic: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: input.userId },
        include: {
          photos: {
            where: { isPublic: true },
            orderBy: { position: 'asc' },
          },
          kinkTags: {
            where: { isPublic: true },
            include: { kinkTag: true },
          },
        },
      })
      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
      }

      // Exclude private fields
      const { contentPreference, ...publicProfile } = profile
      return publicProfile
    }),
})
