import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { tokenizeCard, chargeCard } from '../lib/segpay.js'
import { creditTokens } from '../lib/tokens.js'

export const segpayRouter = router({
  addCard: protectedProcedure
    .input(
      z.object({
        number: z.string(),
        cvv: z.string(),
        expiryMonth: z.number().int().min(1).max(12),
        expiryYear: z.number().int(),
        holderName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tokenized = await tokenizeCard({
        number: input.number,
        cvv: input.cvv,
        expiryMonth: input.expiryMonth,
        expiryYear: input.expiryYear,
        holderName: input.holderName,
      })

      const existingCards = await ctx.prisma.segpayCard.findMany({
        where: { userId: ctx.userId },
      })

      const isDefault = existingCards.length === 0

      const card = await ctx.prisma.segpayCard.create({
        data: {
          userId: ctx.userId,
          cardToken: tokenized.cardToken,
          last4: tokenized.last4,
          brand: tokenized.brand,
          expiryMonth: tokenized.expiryMonth,
          expiryYear: tokenized.expiryYear,
          isDefault,
        },
      })

      return {
        id: card.id,
        last4: card.last4,
        brand: card.brand,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        isDefault: card.isDefault,
        createdAt: card.createdAt,
      }
    }),

  listCards: protectedProcedure.query(async ({ ctx }) => {
    const cards = await ctx.prisma.segpayCard.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: 'asc' },
    })

    return cards.map((card) => ({
      id: card.id,
      last4: card.last4,
      brand: card.brand,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      isDefault: card.isDefault,
      createdAt: card.createdAt,
    }))
  }),

  removeCard: protectedProcedure
    .input(z.object({ cardId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const card = await ctx.prisma.segpayCard.findUnique({
        where: { id: input.cardId },
      })

      if (!card || card.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Card not found' })
      }

      await ctx.prisma.segpayCard.delete({ where: { id: input.cardId } })

      if (card.isDefault) {
        const remaining = await ctx.prisma.segpayCard.findFirst({
          where: { userId: ctx.userId },
          orderBy: { createdAt: 'asc' },
        })

        if (remaining) {
          await ctx.prisma.segpayCard.update({
            where: { id: remaining.id },
            data: { isDefault: true },
          })
        }
      }

      return { success: true }
    }),

  setDefaultCard: protectedProcedure
    .input(z.object({ cardId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const card = await ctx.prisma.segpayCard.findUnique({
        where: { id: input.cardId },
      })

      if (!card || card.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Card not found' })
      }

      await ctx.prisma.segpayCard.updateMany({
        where: { userId: ctx.userId },
        data: { isDefault: false },
      })

      await ctx.prisma.segpayCard.update({
        where: { id: input.cardId },
        data: { isDefault: true },
      })

      return { success: true }
    }),

  topup: protectedProcedure
    .input(
      z.object({
        amountSek: z.number().min(10).max(10000),
        cardId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let card

      if (input.cardId) {
        card = await ctx.prisma.segpayCard.findUnique({
          where: { id: input.cardId },
        })

        if (!card || card.userId !== ctx.userId) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'No payment card found' })
        }
      } else {
        card = await ctx.prisma.segpayCard.findFirst({
          where: { userId: ctx.userId, isDefault: true },
        })

        if (!card) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'No payment card found' })
        }
      }

      // 1 SEK = 1 token
      const tokensCredit = input.amountSek

      const transaction = await ctx.prisma.segpayTransaction.create({
        data: {
          userId: ctx.userId,
          amountSek: input.amountSek,
          tokensCredit,
          status: 'PENDING',
        },
      })

      let chargeResult
      try {
        chargeResult = await chargeCard(card.cardToken, input.amountSek)
      } catch (err) {
        await ctx.prisma.segpayTransaction.update({
          where: { id: transaction.id },
          data: { status: 'FAILED' },
        })
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Payment processing failed',
        })
      }

      if (!chargeResult.success) {
        await ctx.prisma.segpayTransaction.update({
          where: { id: transaction.id },
          data: { status: 'FAILED', segpayTxId: chargeResult.txId },
        })
        throw new TRPCError({
          code: 'PAYMENT_REQUIRED',
          message: 'Payment was declined',
        })
      }

      await ctx.prisma.segpayTransaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED', segpayTxId: chargeResult.txId },
      })

      await creditTokens(ctx.prisma, ctx.userId, tokensCredit, 'TOPUP', transaction.id)

      return {
        success: true,
        transactionId: transaction.id,
        tokensCredit,
        amountSek: input.amountSek,
      }
    }),
})
