import { z } from 'zod'
import { router, protectedProcedure } from './middleware.js'

const updateConfigSchema = z.object({
  strictness: z.enum(['MILD', 'STANDARD', 'STRICT']).optional(),
  customQuestions: z.array(z.string().max(500)).max(10).optional(),
  dealbreakers: z.array(z.string().max(200)).max(10).optional(),
  aiTone: z.enum(['FORMAL', 'CASUAL', 'FLIRTY']).optional(),
})

export const gatekeeperRouter = router({
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    let config = await ctx.prisma.gatekeeperConfig.findUnique({
      where: { userId: ctx.userId },
    })

    if (!config) {
      config = await ctx.prisma.gatekeeperConfig.create({
        data: {
          userId: ctx.userId,
          enabled: true,
          strictness: 'STANDARD',
          aiTone: 'CASUAL',
          customQuestions: [],
          dealbreakers: [],
        },
      })
    }

    return config
  }),

  updateConfig: protectedProcedure
    .input(updateConfigSchema)
    .mutation(async ({ ctx, input }) => {
      let config = await ctx.prisma.gatekeeperConfig.findUnique({
        where: { userId: ctx.userId },
      })

      if (!config) {
        config = await ctx.prisma.gatekeeperConfig.create({
          data: {
            userId: ctx.userId,
            enabled: true,
            strictness: 'STANDARD',
            aiTone: 'CASUAL',
            customQuestions: [],
            dealbreakers: [],
          },
        })
      }

      const updateData: Record<string, unknown> = {}
      if (input.strictness !== undefined) updateData.strictness = input.strictness
      if (input.customQuestions !== undefined) updateData.customQuestions = input.customQuestions
      if (input.dealbreakers !== undefined) updateData.dealbreakers = input.dealbreakers
      if (input.aiTone !== undefined) updateData.aiTone = input.aiTone

      return ctx.prisma.gatekeeperConfig.update({
        where: { userId: ctx.userId },
        data: updateData,
      })
    }),

  toggle: protectedProcedure.mutation(async ({ ctx }) => {
    let config = await ctx.prisma.gatekeeperConfig.findUnique({
      where: { userId: ctx.userId },
    })

    if (!config) {
      config = await ctx.prisma.gatekeeperConfig.create({
        data: {
          userId: ctx.userId,
          enabled: false,
          strictness: 'STANDARD',
          aiTone: 'CASUAL',
          customQuestions: [],
          dealbreakers: [],
        },
      })
    }

    return ctx.prisma.gatekeeperConfig.update({
      where: { userId: ctx.userId },
      data: { enabled: !config.enabled },
    })
  }),
})
