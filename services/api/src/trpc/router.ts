import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import type { Context } from './context.js'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

export const appRouter = router({
  health: {
    check: publicProcedure.query(() => ({
      status: 'ok' as const,
      timestamp: new Date(),
    })),
  },
})

export type AppRouter = typeof appRouter
