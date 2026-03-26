import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'
import type { Context } from './context.js'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

const isAuthenticatedMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    })
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      sessionId: ctx.sessionId,
    },
  })
})

export const protectedProcedure = t.procedure.use(isAuthenticatedMiddleware)

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? '').split(',').filter(Boolean)

const isAdminMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.userId || !ADMIN_USER_IDS.includes(ctx.userId)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    })
  }
  return next({ ctx })
})

export const adminProcedure = t.procedure.use(isAuthenticatedMiddleware).use(isAdminMiddleware)
