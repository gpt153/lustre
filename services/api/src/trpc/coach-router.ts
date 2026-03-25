import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { debitTokens } from '../lib/tokens.js'

const VOICE_TOKENS_PER_MIN = 15
const TEXT_TOKENS_PER_MIN = 2

export const coachRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        persona: z.enum(['COACH', 'PARTNER']),
        mode: z.enum(['VOICE', 'TEXT']),
        roomName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.prisma.coachSession.create({
        data: {
          userId: ctx.userId,
          persona: input.persona,
          mode: input.mode,
          roomName: input.roomName,
          status: 'PENDING',
        },
      })
      return session
    }),

  start: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.prisma.coachSession.findUnique({
        where: { id: input.sessionId },
      })

      if (!session || session.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      }

      if (session.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Session is not in PENDING status',
        })
      }

      return ctx.prisma.coachSession.update({
        where: { id: input.sessionId },
        data: {
          status: 'ACTIVE',
          startedAt: new Date(),
        },
      })
    }),

  end: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        durationSecs: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.prisma.coachSession.findUnique({
        where: { id: input.sessionId },
      })

      if (!session || session.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      }

      if (session.status === 'ENDED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Session has already ended',
        })
      }

      const costPerMin = session.mode === 'VOICE' ? VOICE_TOKENS_PER_MIN : TEXT_TOKENS_PER_MIN
      const minutes = Math.max(1, Math.ceil(input.durationSecs / 60))
      const tokensToDebit = minutes * costPerMin

      await debitTokens(
        ctx.prisma,
        ctx.userId,
        tokensToDebit,
        'COACH_SESSION' as any,
        input.sessionId,
      )

      return ctx.prisma.coachSession.update({
        where: { id: input.sessionId },
        data: {
          status: 'ENDED',
          endedAt: new Date(),
          durationSecs: input.durationSecs,
          tokensDebited: tokensToDebit,
        },
      })
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.coachSession.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
  }),

  get: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.prisma.coachSession.findUnique({
        where: { id: input.sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      if (!session || session.userId !== ctx.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      }

      return session
    }),
})
