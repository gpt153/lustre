import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { appRouter } from './trpc/router.js'
import { createContext } from './trpc/context.js'

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

  server.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))

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
