import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from './middleware.js'
import { revokeSession, getActiveSessions } from '../auth/session.js'
import { getAuthorizationUrl } from '../auth/bankid.js'
import { createPaymentRequest } from '../auth/swish.js'
import { userRouter } from './user-router.js'
import { profileRouter } from './profile-router.js'
import { photoRouter } from './photo-router.js'
import { searchRouter } from './search-router.js'
import { kinkRouter } from './kink-router.js'
import { pairRouter } from './pair-router.js'
import { postRouter } from './post-router.js'
import { contentFilterRouter } from './content-filter-router.js'
import { groupRouter } from './group-router.js'
import { orgRouter } from './org-router.js'
import { gatekeeperRouter } from './gatekeeper-router.js'
import { matchRouter } from './match-router.js'
import { conversationRouter } from './conversation-router.js'
import { callRouter } from './call-router.js'
import { eventRouter } from './event-router.js'
import { safedateRouter } from './safedate-router.js'
import { consentRouter } from './consent-router.js'
import { coachRouter } from './coach-router.js'
import { moduleRouter } from './module-router.js'
import { gamificationRouter } from './gamification-router.js'
import { educationRouter } from './education-router.js'
import { listingRouter } from './listing-router.js'
import { orderRouter } from './order-router.js'
import { sellerRouter } from './seller-router.js'
import { shopRouter } from './shop-router.js'
import { adRouter } from './ad-router.js'
import { tokenRouter } from './token-router.js'

const swishCallbackSchema = z.object({
  id: z.string(),
  payeePaymentReference: z.string(),
  paymentReference: z.string().optional(),
  callbackUrl: z.string(),
  payerAlias: z.string().optional(),
  payeeAlias: z.string(),
  amount: z.number(),
  currency: z.string(),
  message: z.string().optional(),
  status: z.enum(['CREATED', 'PAID', 'DECLINED', 'ERROR']),
  dateCreated: z.string(),
  datePaid: z.string().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  payerName: z.string().optional(),
})

export const appRouter = router({
  health: {
    check: publicProcedure.query(() => ({
      status: 'ok' as const,
      timestamp: new Date(),
    })),
  },
  auth: {
    logout: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.sessionId) {
        await revokeSession(ctx.prisma, ctx.sessionId)
      }
      return { success: true }
    }),
    sessions: protectedProcedure.query(async ({ ctx }) => {
      const sessions = await getActiveSessions(ctx.prisma, ctx.userId)
      return sessions.map((session) => ({
        id: session.id,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      }))
    }),
    revokeSession: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const session = await ctx.prisma.session.findUnique({
          where: { id: input.sessionId },
        })

        if (!session || session.userId !== ctx.userId) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' })
        }

        await revokeSession(ctx.prisma, input.sessionId)
        return { success: true }
      }),

    swish: {
      createPayment: protectedProcedure
        .input(z.object({ phoneNumber: z.string().optional() }))
        .mutation(async ({ ctx, input }) => {
          const user = await ctx.prisma.user.findUnique({ where: { id: ctx.userId } })
          if (!user || user.status !== 'PENDING') {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Payment not required' })
          }

          const result = await createPaymentRequest(ctx.prisma, ctx.userId, input.phoneNumber)
          return result
        }),

      checkStatus: protectedProcedure.query(async ({ ctx }) => {
        const payment = await ctx.prisma.payment.findFirst({
          where: { userId: ctx.userId },
          orderBy: { createdAt: 'desc' },
        })
        return { status: payment?.status ?? null, paidAt: payment?.completedAt ?? null }
      }),

      registrationCallback: publicProcedure
        .input(swishCallbackSchema)
        .mutation(async ({ ctx, input }) => {
          const { handleRegistrationCallback } = await import('../auth/swish.js')
          const result = await handleRegistrationCallback(ctx.prisma, input)
          if (!result || 'alreadyProcessed' in result) {
            return { success: true, tempToken: null }
          }
          return { success: true, tempToken: result.tempToken }
        }),
    },

    bankid: {
      // Initiate BankID login — returns the Criipto authorization URL and a state token
      init: publicProcedure.mutation(() => {
        const state = crypto.randomUUID()
        const authUrl = getAuthorizationUrl(state)
        return { authUrl, state }
      }),

      // BankID is no longer supported — removed in F30-CORE-auth-fix
      callback: publicProcedure
        .input(z.object({ code: z.string(), state: z.string() }))
        .mutation(() => {
          throw new TRPCError({
            code: 'METHOD_NOT_SUPPORTED',
            message: 'BankID authentication has been replaced by Swish+SPAR verification',
          })
        }),
    },
  },
  user: userRouter,
  profile: profileRouter,
  photo: photoRouter,
  search: searchRouter,
  kink: kinkRouter,
  pair: pairRouter,
  post: postRouter,
  contentFilter: contentFilterRouter,
  group: groupRouter,
  org: orgRouter,
  gatekeeper: gatekeeperRouter,
  match: matchRouter,
  conversation: conversationRouter,
  voiceVideo: callRouter,
  event: eventRouter,
  safedate: safedateRouter,
  consent: consentRouter,
  coach: coachRouter,
  module: moduleRouter,
  gamification: gamificationRouter,
  education: educationRouter,
  listing: listingRouter,
  order: orderRouter,
  seller: sellerRouter,
  shop: shopRouter,
  ad: adRouter,
  token: tokenRouter,
})

export type AppRouter = typeof appRouter
