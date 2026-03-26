import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from './middleware.js'
import { revokeSession, getActiveSessions } from '../auth/session.js'
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
import { swishPaymentRouter } from './swish-payment-router.js'
import { segpayRouter } from './segpay-router.js'
import { reportRouter } from './report-router.js'
import { settingsRouter } from './settings-router.js'

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

    completeRegistration: publicProcedure
      .input(z.object({
        tempToken: z.string(),
        email: z.string().email(),
        password: z.string().min(8),
      }))
      .mutation(async ({ ctx, input }) => {
        const { jwtVerify } = await import('jose')
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
        let payload: { sub?: string; type?: unknown }
        try {
          const result = await jwtVerify(input.tempToken, secret)
          payload = result.payload as { sub?: string; type?: unknown }
        } catch {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired registration token' })
        }
        if (payload.type !== 'registration' || !payload.sub) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token type' })
        }
        const userId = payload.sub as string

        const user = await ctx.prisma.user.findUnique({ where: { id: userId } })
        if (!user || user.status !== 'PENDING_EMAIL') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid registration state' })
        }

        const existing = await ctx.prisma.user.findUnique({ where: { email: input.email } })
        if (existing) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Email already in use' })
        }

        const { hashPassword } = await import('../auth/email.js')
        const passwordHash = await hashPassword(input.password)
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { email: input.email, passwordHash, status: 'ACTIVE' },
        })

        const { generateAccessToken, generateRefreshToken } = await import('../auth/jwt.js')
        const { createSession } = await import('../auth/session.js')
        const accessToken = await generateAccessToken(userId)
        const refreshToken = await generateRefreshToken(userId)
        await createSession(ctx.prisma, userId, accessToken, ctx.req)
        return { accessToken, refreshToken }
      }),

    loginWithEmail: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
        if (!user || !user.passwordHash || user.status !== 'ACTIVE') {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' })
        }
        const { verifyPassword } = await import('../auth/email.js')
        const valid = await verifyPassword(input.password, user.passwordHash)
        if (!valid) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' })
        }
        const { generateAccessToken, generateRefreshToken } = await import('../auth/jwt.js')
        const { createSession } = await import('../auth/session.js')
        const accessToken = await generateAccessToken(user.id)
        const refreshToken = await generateRefreshToken(user.id)
        await createSession(ctx.prisma, user.id, accessToken, ctx.req)
        return { accessToken, refreshToken }
      }),

    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
        if (!user || !user.email) return { success: true }
        const { generateResetToken } = await import('../auth/email.js')
        const { token, tokenHash, expiresAt } = generateResetToken()
        console.log(`[DEV] Password reset token for ${input.email}: ${token}`)
        await ctx.prisma.session.create({
          data: {
            userId: user.id,
            tokenHash: `reset:${tokenHash}`,
            expiresAt,
            deviceInfo: 'password-reset',
          },
        })
        return { success: true }
      }),

    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ ctx, input }) => {
        const { hashResetToken, hashPassword } = await import('../auth/email.js')
        const tokenHash = hashResetToken(input.token)
        const session = await ctx.prisma.session.findUnique({
          where: { tokenHash: `reset:${tokenHash}` },
        })
        if (!session || session.expiresAt < new Date() || session.revokedAt) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid or expired reset token' })
        }
        const passwordHash = await hashPassword(input.newPassword)
        await ctx.prisma.$transaction([
          ctx.prisma.user.update({
            where: { id: session.userId },
            data: { passwordHash },
          }),
          ctx.prisma.session.update({
            where: { id: session.id },
            data: { revokedAt: new Date() },
          }),
        ])
        return { success: true }
      }),

    loginWithGoogle: publicProcedure
      .input(z.object({ idToken: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { verifyGoogleToken, findOrLinkOAuthAccount } = await import('../auth/oauth.js')
        let oauthPayload
        try {
          oauthPayload = await verifyGoogleToken(input.idToken)
        } catch {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid Google token' })
        }
        const result = await findOrLinkOAuthAccount(ctx.prisma, 'google', oauthPayload)
        if ('registrationRequired' in result) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'REGISTRATION_REQUIRED',
          })
        }
        const { generateAccessToken, generateRefreshToken } = await import('../auth/jwt.js')
        const { createSession } = await import('../auth/session.js')
        const accessToken = await generateAccessToken(result.userId)
        const refreshToken = await generateRefreshToken(result.userId)
        await createSession(ctx.prisma, result.userId, accessToken, ctx.req)
        return { accessToken, refreshToken }
      }),

    loginWithApple: publicProcedure
      .input(z.object({ identityToken: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { verifyAppleToken, findOrLinkOAuthAccount } = await import('../auth/oauth.js')
        let oauthPayload
        try {
          oauthPayload = await verifyAppleToken(input.identityToken)
        } catch {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid Apple token' })
        }
        const result = await findOrLinkOAuthAccount(ctx.prisma, 'apple', oauthPayload)
        if ('registrationRequired' in result) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'REGISTRATION_REQUIRED',
          })
        }
        const { generateAccessToken, generateRefreshToken } = await import('../auth/jwt.js')
        const { createSession } = await import('../auth/session.js')
        const accessToken = await generateAccessToken(result.userId)
        const refreshToken = await generateRefreshToken(result.userId)
        await createSession(ctx.prisma, result.userId, accessToken, ctx.req)
        return { accessToken, refreshToken }
      }),
  },
  user: userRouter,
  profile: profileRouter,
  photo: photoRouter,
  report: reportRouter,
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
  swishPayment: swishPaymentRouter,
  segpay: segpayRouter,
  settings: settingsRouter,
})

export type AppRouter = typeof appRouter
