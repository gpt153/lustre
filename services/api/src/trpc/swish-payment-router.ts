import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import {
  setupRecurringAgreement,
  cancelRecurringAgreement,
} from '../lib/swish-recurring.js'

export const swishPaymentRouter = router({
  setupSwishRecurring: protectedProcedure
    .input(
      z.object({
        autoTopupAmount: z.number().min(10).max(1000),
        lowBalanceThreshold: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await setupRecurringAgreement(
        ctx.prisma,
        ctx.userId,
        input.autoTopupAmount,
        input.lowBalanceThreshold,
      )
      return result
    }),

  cancelSwishRecurring: protectedProcedure.mutation(async ({ ctx }) => {
    await cancelRecurringAgreement(ctx.prisma, ctx.userId)
    return { success: true }
  }),

  getSwishRecurringStatus: protectedProcedure.query(async ({ ctx }) => {
    const agreement = await ctx.prisma.swishRecurringAgreement.findUnique({
      where: { userId: ctx.userId },
    })

    if (!agreement) {
      return null
    }

    return {
      id: agreement.id,
      status: agreement.status,
      autoTopupAmount: agreement.autoTopupAmount.toNumber(),
      lowBalanceThreshold: agreement.lowBalanceThreshold.toNumber(),
      createdAt: agreement.createdAt,
      updatedAt: agreement.updatedAt,
    }
  }),
})
