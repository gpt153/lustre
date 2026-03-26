import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { creditTokens } from '../lib/tokens.js'

export const inviteRouter = router({
  generate: protectedProcedure.mutation(async ({ ctx }) => {
    const { nanoid } = await import('nanoid')
    const code = nanoid(8)
    const link = await ctx.prisma.inviteLink.create({
      data: { code, referrerId: ctx.userId },
    })
    return { code: link.code, url: `https://lovelustre.com/invite/${link.code}` }
  }),

  getMyLinks: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.inviteLink.findMany({
      where: { referrerId: ctx.userId },
      orderBy: { createdAt: 'desc' },
    })
  }),

  claim: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.prisma.inviteLink.findUnique({ where: { code: input.code } })
      if (!link) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ogiltig inbjudningskod' })
      if (link.referrerId === ctx.userId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Du kan inte använda din egen inbjudningslänk' })

      const existing = await ctx.prisma.referralReward.findFirst({
        where: { refereeId: ctx.userId },
      })
      if (existing) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Du har redan använt en inbjudningslänk' })

      const REFERRER_TOKENS = 100
      const REFEREE_TOKENS = 50

      await ctx.prisma.$transaction(async (tx) => {
        await tx.inviteLink.update({
          where: { id: link.id },
          data: { usedCount: { increment: 1 } },
        })
        await tx.referralReward.create({
          data: {
            inviteLinkId: link.id,
            referrerId: link.referrerId,
            refereeId: ctx.userId,
            referrerTokens: REFERRER_TOKENS,
            refereeTokens: REFEREE_TOKENS,
          },
        })
      })

      await creditTokens(ctx.prisma, link.referrerId, REFERRER_TOKENS, 'REFERRAL', link.id)
      await creditTokens(ctx.prisma, ctx.userId, REFEREE_TOKENS, 'REFERRAL', link.id)

      return { success: true, tokensEarned: REFEREE_TOKENS }
    }),

  getRewards: protectedProcedure.query(async ({ ctx }) => {
    const [given, received] = await Promise.all([
      ctx.prisma.referralReward.findMany({ where: { referrerId: ctx.userId }, orderBy: { createdAt: 'desc' } }),
      ctx.prisma.referralReward.findMany({ where: { refereeId: ctx.userId }, orderBy: { createdAt: 'desc' } }),
    ])
    return { given, received }
  }),
})
