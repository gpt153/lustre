import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { checkBalance, debitTokens } from '../lib/tokens.js'
import { calculateTokenCost } from '../lib/spread-engine.js'

export const tokenRouter = router({
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const balance = await checkBalance(ctx.prisma, ctx.userId)
    const userBalance = await ctx.prisma.userBalance.findUnique({
      where: { userId: ctx.userId },
    })
    return {
      balance,
      balanceDecimal: userBalance?.balance.toString() ?? '0',
    }
  }),

  deduct: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        type: z.enum(['GATEKEEPER', 'TOPUP', 'REFUND', 'COACH_SESSION']),
        description: z.string().optional(),
        serviceRef: z.string().optional(),
        referenceId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await debitTokens(
        ctx.prisma,
        ctx.userId,
        input.amount,
        input.type,
        input.referenceId,
        input.description,
        input.serviceRef
      )

      const newBalance = await checkBalance(ctx.prisma, ctx.userId)
      return {
        success: true,
        newBalance,
      }
    }),

  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const transactions = await ctx.prisma.tokenTransaction.findMany({
        where: { userId: ctx.userId },
        orderBy: { createdAt: 'desc' },
        take: input.limit + 1,
        skip: input.cursor ? 1 : 0,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      })

      const hasMore = transactions.length > input.limit
      const items = hasMore ? transactions.slice(0, -1) : transactions

      const mappedTransactions = items.map((tx) => ({
        id: tx.id,
        amount: tx.amount.toNumber(),
        type: tx.type,
        description: tx.description,
        serviceRef: tx.serviceRef,
        createdAt: tx.createdAt,
      }))

      return {
        transactions: mappedTransactions,
        nextCursor: hasMore ? mappedTransactions[mappedTransactions.length - 1]?.id : null,
      }
    }),

  getSpreadConfig: protectedProcedure.query(async ({ ctx }) => {
    const configs = await ctx.prisma.spreadConfig.findMany()

    return configs.map((config) => ({
      id: config.id,
      segment: config.segment,
      market: config.market,
      multiplier: config.multiplier.toNumber(),
      isDefault: config.isDefault,
      createdAt: config.createdAt,
    }))
  }),

  setSpreadConfig: protectedProcedure
    .input(
      z.object({
        segment: z.string().optional(),
        market: z.string().optional(),
        multiplier: z.number().positive(),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const segment = input.segment || null
      const market = input.market || null

      const existing = await ctx.prisma.spreadConfig.findFirst({
        where: {
          segment,
          market,
        },
      })

      let config
      if (existing) {
        config = await ctx.prisma.spreadConfig.update({
          where: { id: existing.id },
          data: {
            multiplier: input.multiplier,
            isDefault: input.isDefault,
          },
        })
      } else {
        config = await ctx.prisma.spreadConfig.create({
          data: {
            segment,
            market,
            multiplier: input.multiplier,
            isDefault: input.isDefault,
          },
        })
      }

      return {
        id: config.id,
        segment: config.segment,
        market: config.market,
        multiplier: config.multiplier.toNumber(),
        isDefault: config.isDefault,
        createdAt: config.createdAt,
      }
    }),

  deleteSpreadConfig: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const config = await ctx.prisma.spreadConfig.findUnique({
        where: { id: input.id },
      })

      if (!config) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Spread config not found',
        })
      }

      if (config.isDefault) {
        const otherConfigs = await ctx.prisma.spreadConfig.findMany({
          where: { isDefault: false },
        })

        if (otherConfigs.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot delete the only default spread config',
          })
        }
      }

      await ctx.prisma.spreadConfig.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
