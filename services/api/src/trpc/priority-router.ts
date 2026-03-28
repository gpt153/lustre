import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure, adminProcedure } from './middleware.js'
import { getSparkBalance, sendSpark, getSparksReceived } from '../lib/spark.js'
import { activateSpotlight, getSpotlightStatus, getSpotlightCredits } from '../lib/spotlight.js'

export const priorityRouter = router({
  getSparkBalance: protectedProcedure
    .query(async ({ ctx }) => {
      const balance = await getSparkBalance(ctx.prisma, ctx.userId)
      return { balance }
    }),

  sendSpark: protectedProcedure
    .input(z.object({ recipientId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (input.recipientId === ctx.userId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot spark yourself' })
      }
      const result = await sendSpark(ctx.prisma, ctx.userId, input.recipientId)
      if (!result.success) {
        throw new TRPCError({
          code: result.reason === 'insufficient_balance' ? 'PRECONDITION_FAILED' : 'CONFLICT',
          message: result.reason,
        })
      }
      return { balance: result.newBalance }
    }),

  getSparksReceived: protectedProcedure
    .query(async ({ ctx }) => {
      return getSparksReceived(ctx.prisma, ctx.userId)
    }),

  getSpotlightCredits: protectedProcedure
    .query(async ({ ctx }) => {
      const credits = await getSpotlightCredits(ctx.prisma, ctx.userId)
      return { credits }
    }),

  activateSpotlight: protectedProcedure
    .mutation(async ({ ctx }) => {
      const result = await activateSpotlight(ctx.prisma, ctx.userId)
      if (!result.success) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: result.reason,
        })
      }
      return { expiresAt: result.expiresAt, remainingSeconds: result.remainingSeconds }
    }),

  getSpotlightStatus: protectedProcedure
    .query(async ({ ctx }) => {
      return getSpotlightStatus(ctx.userId)
    }),

  adminGetTrustScore: adminProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const score = await ctx.prisma.profileTrustScore.findUnique({
        where: { userId: input.userId },
      })
      if (!score) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No trust score found' })
      }
      return score
    }),
})
