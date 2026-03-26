import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from './middleware.js'
import { indexProfile } from '../lib/meilisearch.js'
import { PROMPT_OPTIONS } from '../lib/prompt-options.js'

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
  allowPostEventSuggestions: z.boolean().optional(),
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

      // Index in Meilisearch
      await indexProfile(profile).catch(() => {})

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

      // Update search index
      await indexProfile(updated).catch(() => {})

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
      const callerProfile = ctx.userId
        ? await ctx.prisma.profile.findUnique({
            where: { userId: ctx.userId },
            select: { spicyModeEnabled: true },
          })
        : null
      const isVanilla = !callerProfile?.spicyModeEnabled

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

      // Get pair link members
      const pairMembers = await ctx.prisma.pairLinkMember.findMany({
        where: { profileId: profile.id },
        include: {
          pairLink: {
            include: {
              members: {
                include: {
                  profile: {
                    select: {
                      displayName: true,
                      userId: true,
                      photos: {
                        where: { isPublic: true },
                        orderBy: { position: 'asc' },
                        take: 1,
                        select: { thumbnailSmall: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })

      const linkedPartners = pairMembers.flatMap(m =>
        m.pairLink.members
          .filter(member => member.profileId !== profile.id)
          .map(member => ({
            userId: member.profile.userId,
            displayName: member.profile.displayName,
            thumbnailUrl: member.profile.photos[0]?.thumbnailSmall ?? null,
          }))
      )

      return { ...publicProfile, kinkTags: isVanilla ? [] : publicProfile.kinkTags, linkedPartners }
    }),

  toggleSpicyMode: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
      })
      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
      }

      const updated = await ctx.prisma.profile.update({
        where: { userId: ctx.userId },
        data: { spicyModeEnabled: input.enabled },
        include: {
          photos: { orderBy: { position: 'asc' } },
          kinkTags: { include: { kinkTag: true } },
        },
      })

      return updated
    }),

  getPrompts: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.profile.findUnique({
      where: { userId: ctx.userId },
      select: { id: true },
    })
    if (!profile) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }

    const prompts = await ctx.prisma.profilePrompt.findMany({
      where: { profileId: profile.id },
      orderBy: { order: 'asc' },
    })

    return prompts
  }),

  setPrompts: protectedProcedure
    .input(
      z.array(
        z.object({
          promptKey: z.string(),
          response: z.string().max(500),
          order: z.number().int().min(1).max(3),
        })
      ).max(3)
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
        select: { id: true },
      })
      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
      }

      // Validate each promptKey exists in PROMPT_OPTIONS
      for (const prompt of input) {
        if (!(prompt.promptKey in PROMPT_OPTIONS)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Invalid prompt key: ${prompt.promptKey}`,
          })
        }
      }

      // Delete existing prompts and create new ones in a transaction
      const result = await ctx.prisma.$transaction(async (tx) => {
        await tx.profilePrompt.deleteMany({
          where: { profileId: profile.id },
        })

        const newPrompts = await tx.profilePrompt.createMany({
          data: input.map((prompt) => ({
            profileId: profile.id,
            promptKey: prompt.promptKey,
            response: prompt.response,
            order: prompt.order,
          })),
        })

        // Return the created prompts
        return tx.profilePrompt.findMany({
          where: { profileId: profile.id },
          orderBy: { order: 'asc' },
        })
      })

      return result
    }),
})
