import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from './middleware.js'
import { revokeSession, getActiveSessions, createSession } from '../auth/session.js'
import { generateAccessToken, generateRefreshToken } from '../auth/jwt.js'
import { getAuthorizationUrl, exchangeCodeForIdentity } from '../auth/bankid.js'
import { hashPersonnummer, validateAge } from '../auth/personnummer.js'
import { encryptIdentity } from '../auth/crypto.js'
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
import { gatekeeperRouter } from './gatekeeper-router.js'
import { matchRouter } from './match-router.js'

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
    },

    bankid: {
      // Initiate BankID login — returns the Criipto authorization URL and a state token
      init: publicProcedure.mutation(() => {
        const state = crypto.randomUUID()
        const authUrl = getAuthorizationUrl(state)
        return { authUrl, state }
      }),

      // Handle the callback after the user completes BankID authentication
      callback: publicProcedure
        .input(z.object({ code: z.string(), state: z.string() }))
        .mutation(async ({ ctx, input }) => {
          // 1. Exchange authorization code for identity claims from Criipto
          const identity = await exchangeCodeForIdentity(input.code)

          // 2. Validate age — must be 18 or older
          if (!validateAge(identity.personnummer)) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Must be 18 or older to use this service',
            })
          }

          // 3. Hash personnummer for database uniqueness lookup
          const pnrHash = hashPersonnummer(identity.personnummer)

          // 4. Look up existing user by personnummer hash
          let user = await ctx.prisma.user.findUnique({
            where: { personnummerHash: pnrHash },
          })

          // Reject deleted accounts
          if (user && user.status === 'DELETED') {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Account deleted. Contact support.',
            })
          }

          const isNewUser = !user

          if (!user) {
            // 5. Create a new user with PENDING status
            user = await ctx.prisma.user.create({
              data: {
                personnummerHash: pnrHash,
                status: 'PENDING',
              },
            })

            // 6. Encrypt and store PII — real names and personnummer never stored in plaintext
            const encData = encryptIdentity(identity)
            await ctx.prisma.encryptedIdentity.create({
              data: {
                userId: user.id,
                encryptedFirstName: encData.encryptedFirstName,
                encryptedLastName: encData.encryptedLastName,
                encryptedPersonnummer: encData.encryptedPersonnummer,
                iv: encData.iv,
              },
            })
          }

          // 7. Generate access and refresh tokens
          const accessToken = await generateAccessToken(user.id)
          const refreshToken = await generateRefreshToken(user.id)

          // 8. Persist the session (keyed by access token hash)
          await createSession(ctx.prisma, user.id, accessToken, ctx.req)

          return {
            accessToken,
            refreshToken,
            user: {
              id: user.id,
              displayName: user.displayName ?? null,
            },
            isNewUser,
          }
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
  gatekeeper: gatekeeperRouter,
  match: matchRouter,
})

export type AppRouter = typeof appRouter
