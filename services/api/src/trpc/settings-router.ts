import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'

export const settingsRouter = router({
  getMode: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.profile.findUnique({
      where: { userId: ctx.userId },
      select: { spicyModeEnabled: true },
    })
    if (!profile) throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
    return { mode: profile.spicyModeEnabled ? 'spicy' : 'vanilla' } as {
      mode: 'vanilla' | 'spicy'
    }
  }),

  setMode: protectedProcedure
    .input(z.object({ mode: z.enum(['vanilla', 'spicy']) }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
      })
      if (!profile) throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
      await ctx.prisma.profile.update({
        where: { userId: ctx.userId },
        data: { spicyModeEnabled: input.mode === 'spicy' },
      })
      return { mode: input.mode }
    }),
})
