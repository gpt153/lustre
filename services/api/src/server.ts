import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { appRouter } from './trpc/router.js'
import { createContext, prisma, redis } from './trpc/context.js'
import { handleSwishCallback, type SwishCallbackBody } from './auth/swish.js'

const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  },
})

async function start() {
  await server.register(cors, {
    origin: [
      'http://localhost:3000',
      'http://localhost:8081',
      'http://localhost:19006',
    ],
  })

  await server.register(helmet, { contentSecurityPolicy: false })

  server.get('/health', async () => {
    const checks: Record<string, string> = {
      timestamp: new Date().toISOString(),
    }

    try {
      await prisma.$queryRaw`SELECT 1`
      checks.postgres = 'ok'
    } catch {
      checks.postgres = 'error'
    }

    try {
      await redis.ping()
      checks.redis = 'ok'
    } catch {
      checks.redis = 'error'
    }

    const status = checks.postgres === 'ok' && checks.redis === 'ok' ? 'ok' : 'degraded'
    return { status, ...checks }
  })

  // Swish payment callback — called by Swish servers when a payment completes.
  // Must be a plain REST endpoint (not tRPC) because Swish sends a fixed POST format.
  server.post('/swish/callback', async (request, reply) => {
    const body = request.body as SwishCallbackBody

    if (!body || !body.id || !body.status) {
      return reply.status(400).send({ error: 'Invalid callback body' })
    }

    const handled = await handleSwishCallback(prisma, body)
    if (!handled) {
      server.log.warn({ swishPaymentId: body.id }, 'Swish callback received for unknown payment')
    }

    // Swish requires a 200 response to consider the callback delivered.
    return reply.status(200).send()
  })

  await server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: { router: appRouter, createContext },
  })

  const port = Number(process.env.PORT) || 4000
  const host = process.env.HOST || '0.0.0.0'

  await server.listen({ port, host })
  server.log.info(`Server listening on ${host}:${port}`)
}

start().catch((err) => {
  server.log.error(err)
  process.exit(1)
})

export type { AppRouter } from './trpc/router.js'
