import Fastify, { type FastifyRequest } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import multipart from '@fastify/multipart'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { appRouter } from './trpc/router.js'
import { createContext, prisma, redis } from './trpc/context.js'
import { handleSwishCallback, type SwishCallbackBody } from './auth/swish.js'
import { handleTicketPaymentCallback, type SwishCallbackBody as TicketSwishCallbackBody } from './lib/event-tickets.js'
import { meili } from './lib/meilisearch.js'
import { getNatsConnection } from './lib/nats.js'
import { processImage } from './lib/image.js'
import { uploadToR2, getPhotoKey, getPostMediaKey } from './lib/r2.js'
import { verifyToken } from './auth/jwt.js'
import { classifyAndTagMedia } from './lib/sightengine.js'
import { classifyChatMedia } from './lib/chat-classifier.js'
import { startChatConsumer } from './lib/chat-consumer.js'
import { startPostEventConsumer } from './lib/post-event-consumer.js'
import { startEventCompletedConsumer } from './lib/event-completed-consumer.js'
import { startEscalationService } from './lib/safedate-escalation.js'
import { autoConfirmOrders } from './lib/marketplace.js'
import { startTrustScoreConsumer } from './lib/trust-score-consumer.js'
import { refreshAllTrustScores } from './lib/trust-score.js'
import { callRoutes } from './routes/call.js'
import { coachRoutes } from './routes/coach.js'
import { consentRoutes } from './routes/consent.js'
import { marketplaceCallbackHandler, payoutCallbackHandler } from './routes/marketplace-callback.js'
import { handleRecurringCallback, type RecurringCallbackPayload } from './lib/swish-recurring.js'
import { handleSegpayCallback } from './lib/segpay.js'
import { verifySwishWebhook, verifySegpayWebhook } from './lib/webhook-verify.js'
import {
  SwishCallbackSchema,
  SwishRecurringCallbackSchema,
  SegpayCallbackSchema,
  PostUploadQuerySchema,
  ChatUploadQuerySchema,
} from './lib/rest-schemas.js'

// Extended request type that carries the raw body string for webhook verification.
interface FastifyRequestWithRawBody extends FastifyRequest {
  rawBody?: string
}

const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  },
})

let isShuttingDown = false

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return
  isShuttingDown = true

  server.log.info(`Received ${signal} — starting graceful shutdown`)

  // Force-exit safety net: kill after 30 seconds no matter what
  const forceExit = setTimeout(() => {
    server.log.error('Graceful shutdown timed out after 30s — forcing exit')
    process.exit(1)
  }, 30_000)
  forceExit.unref()

  // 1. Stop accepting new connections; drain in-flight requests
  try {
    await server.close()
    server.log.info('HTTP server closed')
  } catch (err) {
    server.log.error({ err }, 'Error closing HTTP server')
  }

  // 2. Drain NATS (finishes pending messages before disconnecting)
  try {
    const nc = await getNatsConnection()
    await nc.drain()
    server.log.info('NATS connection drained')
  } catch (err) {
    server.log.error({ err }, 'Error draining NATS connection')
  }

  // 3. Quit Redis
  try {
    await redis.quit()
    server.log.info('Redis connection closed')
  } catch (err) {
    server.log.error({ err }, 'Error closing Redis connection')
  }

  // 4. Disconnect Prisma
  try {
    await prisma.$disconnect()
    server.log.info('Prisma disconnected')
  } catch (err) {
    server.log.error({ err }, 'Error disconnecting Prisma')
  }

  clearTimeout(forceExit)
  server.log.info('Graceful shutdown complete')
  process.exit(0)
}

async function start() {
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : [
        'https://app.lovelustre.com',
        'https://pay.lovelustre.com',
        'https://admin.lovelustre.com',
      ]

  await server.register(cors, {
    origin: allowedOrigins,
  })

  await server.register(helmet, { contentSecurityPolicy: false })

  await server.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } })

  // Capture raw body for webhook signature verification on payment callback routes.
  // Fastify parses JSON before handlers run, so we intercept the raw bytes here.
  server.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (req, body, done) => {
      // Attach raw body for signature verification
      ;(req as FastifyRequestWithRawBody).rawBody = body as string
      try {
        done(null, JSON.parse(body as string))
      } catch (err) {
        done(err as Error)
      }
    },
  )

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
    const rawBody = (request as FastifyRequestWithRawBody).rawBody ?? ''
    if (!verifySwishWebhook(rawBody, request.headers['x-swish-signature'] as string | undefined)) {
      server.log.warn('Swish callback signature verification failed')
      return reply.status(401).send({ error: 'Invalid signature' })
    }

    const parsed = SwishCallbackSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
      })
    }
    const body = parsed.data as unknown as SwishCallbackBody

    const handled = await handleSwishCallback(prisma, body)
    if (!handled) {
      server.log.warn({ swishPaymentId: body.id }, 'Swish callback received for unknown payment')
    }

    // Swish requires a 200 response to consider the callback delivered.
    return reply.status(200).send()
  })

  // Swish marketplace payment callback — called by Swish servers when a marketplace order payment completes.
  server.post('/api/marketplace/swish-callback', async (request, reply) => {
    const rawBody = (request as FastifyRequestWithRawBody).rawBody ?? ''
    if (!verifySwishWebhook(rawBody, request.headers['x-swish-signature'] as string | undefined)) {
      server.log.warn('Marketplace Swish callback signature verification failed')
      return reply.status(401).send({ error: 'Invalid signature' })
    }
    return marketplaceCallbackHandler(request, reply)
  })

  // Swish payout callback — called by Swish servers when a seller payout completes or fails.
  server.post('/api/marketplace/payout-callback', payoutCallbackHandler)

  // Swish recurring payment callback — called by Swish servers when a recurring auto-topup payment completes.
  server.post('/api/payments/swish-recurring-callback', async (request, reply) => {
    const rawBody = (request as FastifyRequestWithRawBody).rawBody ?? ''
    if (!verifySwishWebhook(rawBody, request.headers['x-swish-signature'] as string | undefined)) {
      server.log.warn('Swish recurring callback signature verification failed')
      return reply.status(401).send({ error: 'Invalid signature' })
    }

    const parsed = SwishRecurringCallbackSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
      })
    }
    const body = parsed.data as unknown as RecurringCallbackPayload

    await handleRecurringCallback(prisma, body)

    // Swish requires a 200 response to consider the callback delivered.
    return reply.status(200).send()
  })

  // Segpay payment callback — called by Segpay servers when a card payment completes.
  server.post('/api/payments/segpay-callback', async (request, reply) => {
    const rawBody = (request as FastifyRequestWithRawBody).rawBody ?? ''
    if (!verifySegpayWebhook(rawBody, request.headers['x-segpay-signature'] as string | undefined)) {
      server.log.warn('Segpay callback signature verification failed')
      return reply.status(401).send({ error: 'Invalid signature' })
    }

    const parsed = SegpayCallbackSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
      })
    }
    const body = parsed.data as unknown as { status: string; [key: string]: unknown }

    await handleSegpayCallback(prisma, body)

    return reply.status(200).send()
  })

  // Swish ticket payment callback — called by Swish servers when a ticket payment completes.
  server.post('/api/events/ticket-callback', async (request, reply) => {
    const rawBody = (request as FastifyRequestWithRawBody).rawBody ?? ''
    if (!verifySwishWebhook(rawBody, request.headers['x-swish-signature'] as string | undefined)) {
      server.log.warn('Swish ticket callback signature verification failed')
      return reply.status(401).send({ error: 'Invalid signature' })
    }

    const parsed = SwishCallbackSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
      })
    }
    const body = parsed.data as unknown as TicketSwishCallbackBody

    const handled = await handleTicketPaymentCallback(prisma, body)
    if (!handled) {
      server.log.warn({ swishPaymentId: body.id }, 'Swish ticket callback received for unknown ticket')
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

  server.post('/api/posts/upload', async (request, reply) => {
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

    const queryParsed = PostUploadQuerySchema.safeParse(request.query)
    if (!queryParsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: queryParsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
      })
    }
    const { postId } = queryParsed.data

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { media: true },
    })
    if (!post || post.authorId !== userId) {
      return reply.status(404).send({ error: 'Post not found' })
    }

    if (post.media.length >= 4) {
      return reply.status(400).send({ error: 'Maximum 4 images per post' })
    }

    const file = await request.file()
    if (!file) {
      return reply.status(400).send({ error: 'No file provided' })
    }

    const buffer = await file.toBuffer()
    const images = await processImage(buffer)

    const media = await prisma.postMedia.create({
      data: {
        postId: post.id,
        url: '',
        position: post.media.length,
      },
    })

    const [originalUrl, smallUrl, mediumUrl, largeUrl] = await Promise.all([
      uploadToR2(getPostMediaKey(post.id, media.id, 'original'), images.original, 'image/webp'),
      uploadToR2(getPostMediaKey(post.id, media.id, 'small'), images.small, 'image/webp'),
      uploadToR2(getPostMediaKey(post.id, media.id, 'medium'), images.medium, 'image/webp'),
      uploadToR2(getPostMediaKey(post.id, media.id, 'large'), images.large, 'image/webp'),
    ])

    const updated = await prisma.postMedia.update({
      where: { id: media.id },
      data: {
        url: originalUrl,
        thumbnailSmall: smallUrl,
        thumbnailMedium: mediumUrl,
        thumbnailLarge: largeUrl,
      },
    })

    // Classify image asynchronously (don't block the response)
    classifyAndTagMedia(media.id, originalUrl).catch(() => {})

    return reply.status(201).send(updated)
  })

  server.post('/api/chat/upload', async (request, reply) => {
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

    // Get conversationId from query params
    const queryParsed = ChatUploadQuerySchema.safeParse(request.query)
    if (!queryParsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: queryParsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
      })
    }
    const { conversationId } = queryParsed.data

    // Verify user is participant in conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    })
    if (!participant) {
      return reply.status(403).send({ error: 'Not a participant in this conversation' })
    }

    // Get file
    const file = await request.file()
    if (!file) {
      return reply.status(400).send({ error: 'No file provided' })
    }

    // Content-type validation
    const contentType = file.mimetype
    if (!['image/jpeg', 'image/png', 'image/webp', 'video/mp4'].includes(contentType)) {
      return reply.status(400).send({
        error: 'Invalid content type. Allowed: image/jpeg, image/png, image/webp, video/mp4',
      })
    }

    const buffer = await file.toBuffer()

    // Determine media type
    let mediaType: 'IMAGE' | 'VIDEO'
    let mediaUrl: string

    if (contentType.startsWith('image/')) {
      mediaType = 'IMAGE'

      // Process image: convert to WebP and generate thumbnails
      const images = await processImage(buffer)

      // Create R2 keys with pattern: chat/<conversationId>/<userId>/<timestamp>-<filename>.webp
      const timestamp = Date.now()
      const filename = file.filename.replace(/\.[^.]+$/, '') // Remove extension
      const baseKey = `chat/${conversationId}/${userId}/${timestamp}-${filename}.webp`

      // Upload original and thumbnails (sized versions)
      const [originalUrl] = await Promise.all([
        uploadToR2(`${baseKey}`, images.original, 'image/webp'),
        uploadToR2(`${baseKey.replace('.webp', '-small.webp')}`, images.small, 'image/webp'),
        uploadToR2(`${baseKey.replace('.webp', '-medium.webp')}`, images.medium, 'image/webp'),
        uploadToR2(`${baseKey.replace('.webp', '-large.webp')}`, images.large, 'image/webp'),
      ])

      mediaUrl = originalUrl
    } else {
      mediaType = 'VIDEO'

      // Upload video as-is
      const timestamp = Date.now()
      const filename = file.filename
      const videoKey = `chat/${conversationId}/${userId}/${timestamp}-${filename}`

      mediaUrl = await uploadToR2(videoKey, buffer, contentType)
    }

    // Create Message record with status SENT
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        type: mediaType,
        mediaUrl,
        status: 'SENT',
        content: null,
      },
    })

    // Trigger classification asynchronously (fire-and-forget) for images only
    if (mediaType === 'IMAGE') {
      classifyChatMedia(message.id, mediaUrl, conversationId).catch(() => {})
    }

    return reply.status(201).send({
      messageId: message.id,
      mediaUrl: message.mediaUrl,
      type: message.type,
    })
  })

  // Start NATS consumers in background
  startChatConsumer().catch((err) => {
    server.log.error('Failed to start chat consumer:', err)
  })

  const nc = await getNatsConnection()
  startPostEventConsumer(prisma, nc).catch((err) => {
    server.log.error('Failed to start post-event consumer:', err)
  })

  startEventCompletedConsumer(prisma, nc).catch((err) => {
    server.log.error('Failed to start event-completed consumer:', err)
  })

  startEscalationService()

  startTrustScoreConsumer(prisma).catch((err) => {
    server.log.error('Failed to start trust-score consumer:', err)
  })

  setInterval(() => {
    autoConfirmOrders(prisma).catch((err) => {
      server.log.error('Failed to auto-confirm orders:', err)
    })
  }, 60 * 60 * 1000)

  setInterval(() => {
    refreshAllTrustScores(prisma).catch((err) => {
      server.log.error('Failed to refresh trust scores:', err)
    })
  }, 60 * 60 * 1000)

  await server.register(callRoutes)
  await server.register(coachRoutes)
  await server.register(consentRoutes)

  // Dev-only: quick login for local testing
  if (process.env.NODE_ENV !== 'production') {
    server.post('/api/dev/login', async (request, reply) => {
      const { displayName = 'Testuser' } = (request.body as Record<string, string>) || {}
      const { generateAccessToken, generateRefreshToken, hashToken } = await import('./auth/jwt.js')

      let user = await prisma.user.findFirst({ where: { displayName } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            displayName,
            personnummer_hash: `dev-${displayName}-${Date.now()}`,
            status: 'ACTIVE',
          },
        })
      }

      const accessToken = await generateAccessToken(user.id)
      const refreshToken = await generateRefreshToken(user.id)
      await prisma.session.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(refreshToken),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      return reply.send({
        accessToken,
        refreshToken,
        user: { id: user.id, displayName: user.displayName },
      })
    })
  }

  await server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: { router: appRouter, createContext },
  })

  const port = Number(process.env.PORT) || 4000
  const host = process.env.HOST || '0.0.0.0'

  await server.listen({ port, host })
  server.log.info(`Server listening on ${host}:${port}`)

  // Register shutdown handlers only after the server is up and running
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))
}

start().catch((err) => {
  server.log.error(err)
  process.exit(1)
})

export type { AppRouter } from './trpc/router.js'
