import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from './middleware.js'
import { setDisplayName, getSafeUserProfile } from '../auth/anonymity.js'

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return getSafeUserProfile(ctx.prisma, ctx.userId)
  }),

  setDisplayName: protectedProcedure
    .input(z.object({ displayName: z.string().min(3).max(30) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await setDisplayName(ctx.prisma, ctx.userId, input.displayName)
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error instanceof Error ? error.message : 'Failed to set display name',
        })
      }
    }),

  profile: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return getSafeUserProfile(ctx.prisma, input.userId)
    }),
})
