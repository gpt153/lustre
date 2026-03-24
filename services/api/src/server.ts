import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import multipart from '@fastify/multipart'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { appRouter } from './trpc/router.js'
import { createContext, prisma, redis } from './trpc/context.js'
import { handleSwishCallback, type SwishCallbackBody } from './auth/swish.js'
import { meili } from './lib/meilisearch.js'
import { getNatsConnection } from './lib/nats.js'
import { processImage } from './lib/image.js'
import { uploadToR2, getPhotoKey } from './lib/r2.js'
import { verifyToken } from './auth/jwt.js'

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

  await server.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } })

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

    try {
      await meili.health()
      checks.meilisearch = 'ok'
    } catch {
      checks.meilisearch = 'error'
    }

    try {
      const nc = await getNatsConnection()
      checks.nats = nc.isClosed() ? 'error' : 'ok'
    } catch {
      checks.nats = 'error'
    }

    const allOk =
      checks.postgres === 'ok' &&
      checks.redis === 'ok' &&
      checks.meilisearch === 'ok' &&
      checks.nats === 'ok'
    const status = allOk ? 'ok' : 'degraded'
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

  server.post('/api/photos/upload', async (request, reply) => {
    // Auth check
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const token = authHeader.slice(7)
    let userId: string
    try {
      const decoded = await verifyToken(token)
      if (decoded.type !== 'access') throw new Error('Invalid token type')
      userId = decoded.userId
    } catch {
      return reply.status(401).send({ error: 'Invalid token' })
    }

    // Get profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { photos: true },
    })
    if (!profile) {
      return reply.status(404).send({ error: 'Profile not found' })
    }

    // Check photo limit
    if (profile.photos.length >= 10) {
      return reply.status(400).send({ error: 'Maximum 10 photos allowed' })
    }

    // Get file
    const file = await request.file()
    if (!file) {
      return reply.status(400).send({ error: 'No file provided' })
    }

    const buffer = await file.toBuffer()

    // Process image (convert to WebP + generate thumbnails)
    const images = await processImage(buffer)

    // Create DB record first to get ID
    const photo = await prisma.profilePhoto.create({
      data: {
        profileId: profile.id,
        url: '',
        position: profile.photos.length,
      },
    })

    // Upload all sizes to R2
    const [originalUrl, smallUrl, mediumUrl, largeUrl] = await Promise.all([
      uploadToR2(getPhotoKey(profile.id, photo.id, 'original'), images.original, 'image/webp'),
      uploadToR2(getPhotoKey(profile.id, photo.id, 'small'), images.small, 'image/webp'),
      uploadToR2(getPhotoKey(profile.id, photo.id, 'medium'), images.medium, 'image/webp'),
      uploadToR2(getPhotoKey(profile.id, photo.id, 'large'), images.large, 'image/webp'),
    ])

    // Update record with URLs
    const updated = await prisma.profilePhoto.update({
      where: { id: photo.id },
      data: {
        url: originalUrl,
        thumbnailSmall: smallUrl,
        thumbnailMedium: mediumUrl,
        thumbnailLarge: largeUrl,
      },
    })

    return reply.status(201).send(updated)
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
