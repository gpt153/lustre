import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'

const NudityLevelEnum = z.enum(['NONE', 'IMPLIED', 'PARTIAL', 'FULL'])
const BodyPartTagEnum = z.enum(['FACE', 'CHEST', 'BACK', 'BUTT', 'GENITALS', 'LEGS', 'FEET', 'FULL_BODY'])
const ActivityTagEnum = z.enum(['SELFIE', 'MIRROR', 'OUTDOOR', 'GYM', 'BEDROOM', 'ARTISTIC', 'COUPLE', 'GROUP'])
const VibeTagEnum = z.enum(['CASUAL', 'SENSUAL', 'PLAYFUL', 'INTENSE', 'ROMANTIC', 'ARTISTIC'])
const GenderPresentationTagEnum = z.enum(['MASCULINE', 'FEMININE', 'ANDROGYNOUS', 'MIXED'])
const ContentPreferenceEnum = z.enum(['SOFT', 'OPEN', 'EXPLICIT', 'NO_DICK_PICS'])

const PRESET_DEFAULTS = {
  SOFT: {
    nudityLevel: ['NONE'] as const,
    bodyPart: ['FACE', 'CHEST', 'BACK', 'BUTT', 'LEGS', 'FEET', 'FULL_BODY'] as const,
    activity: ['SELFIE', 'MIRROR', 'OUTDOOR', 'GYM', 'BEDROOM', 'ARTISTIC', 'COUPLE', 'GROUP'] as const,
    vibe: ['CASUAL', 'PLAYFUL', 'ROMANTIC', 'ARTISTIC'] as const,
    genderPresentation: ['MASCULINE', 'FEMININE', 'ANDROGYNOUS', 'MIXED'] as const,
  },
  OPEN: {
    nudityLevel: ['NONE', 'IMPLIED', 'PARTIAL'] as const,
    bodyPart: ['FACE', 'CHEST', 'BACK', 'BUTT', 'GENITALS', 'LEGS', 'FEET', 'FULL_BODY'] as const,
    activity: ['SELFIE', 'MIRROR', 'OUTDOOR', 'GYM', 'BEDROOM', 'ARTISTIC', 'COUPLE', 'GROUP'] as const,
    vibe: ['CASUAL', 'SENSUAL', 'PLAYFUL', 'INTENSE', 'ROMANTIC', 'ARTISTIC'] as const,
    genderPresentation: ['MASCULINE', 'FEMININE', 'ANDROGYNOUS', 'MIXED'] as const,
  },
  EXPLICIT: {
    nudityLevel: ['NONE', 'IMPLIED', 'PARTIAL', 'FULL'] as const,
    bodyPart: ['FACE', 'CHEST', 'BACK', 'BUTT', 'GENITALS', 'LEGS', 'FEET', 'FULL_BODY'] as const,
    activity: ['SELFIE', 'MIRROR', 'OUTDOOR', 'GYM', 'BEDROOM', 'ARTISTIC', 'COUPLE', 'GROUP'] as const,
    vibe: ['CASUAL', 'SENSUAL', 'PLAYFUL', 'INTENSE', 'ROMANTIC', 'ARTISTIC'] as const,
    genderPresentation: ['MASCULINE', 'FEMININE', 'ANDROGYNOUS', 'MIXED'] as const,
  },
  NO_DICK_PICS: {
    nudityLevel: ['NONE', 'IMPLIED', 'PARTIAL', 'FULL'] as const,
    bodyPart: ['FACE', 'CHEST', 'BACK', 'BUTT', 'LEGS', 'FEET', 'FULL_BODY'] as const,
    activity: ['SELFIE', 'MIRROR', 'OUTDOOR', 'GYM', 'BEDROOM', 'ARTISTIC', 'COUPLE', 'GROUP'] as const,
    vibe: ['CASUAL', 'SENSUAL', 'PLAYFUL', 'INTENSE', 'ROMANTIC', 'ARTISTIC'] as const,
    genderPresentation: ['MASCULINE', 'FEMININE', 'ANDROGYNOUS', 'MIXED'] as const,
  },
} as const

export const contentFilterRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    let filter = await ctx.prisma.userContentFilter.findUnique({
      where: { userId: ctx.userId },
    })

    if (!filter) {
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
        select: { contentPreference: true },
      })

      const preset = profile?.contentPreference ?? 'SOFT'
      const defaults = PRESET_DEFAULTS[preset]

      filter = await ctx.prisma.userContentFilter.create({
        data: {
          userId: ctx.userId,
          preset,
          nudityLevel: [...defaults.nudityLevel],
          bodyPart: [...defaults.bodyPart],
          activity: [...defaults.activity],
          vibe: [...defaults.vibe],
          genderPresentation: [...defaults.genderPresentation],
        },
      })
    }

    return filter
  }),

  update: protectedProcedure
    .input(z.object({
      nudityLevel: z.array(NudityLevelEnum).optional(),
      bodyPart: z.array(BodyPartTagEnum).optional(),
      activity: z.array(ActivityTagEnum).optional(),
      vibe: z.array(VibeTagEnum).optional(),
      genderPresentation: z.array(GenderPresentationTagEnum).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.userContentFilter.findUnique({
        where: { userId: ctx.userId },
      })
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Content filter not found. Call get first.' })
      }

      const updated = await ctx.prisma.userContentFilter.update({
        where: { userId: ctx.userId },
        data: input,
      })

      return updated
    }),

  applyPreset: protectedProcedure
    .input(z.object({
      preset: ContentPreferenceEnum,
    }))
    .mutation(async ({ ctx, input }) => {
      const defaults = PRESET_DEFAULTS[input.preset]

      const filter = await ctx.prisma.userContentFilter.upsert({
        where: { userId: ctx.userId },
        create: {
          userId: ctx.userId,
          preset: input.preset,
          nudityLevel: [...defaults.nudityLevel],
          bodyPart: [...defaults.bodyPart],
          activity: [...defaults.activity],
          vibe: [...defaults.vibe],
          genderPresentation: [...defaults.genderPresentation],
        },
        update: {
          preset: input.preset,
          nudityLevel: [...defaults.nudityLevel],
          bodyPart: [...defaults.bodyPart],
          activity: [...defaults.activity],
          vibe: [...defaults.vibe],
          genderPresentation: [...defaults.genderPresentation],
        },
      })

      return filter
    }),
})
