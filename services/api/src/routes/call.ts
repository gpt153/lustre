import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { verifyToken } from '../auth/jwt.js'
import { prisma } from '../trpc/context.js'
import { generateCallToken, LIVEKIT_WS_URL } from '../lib/livekit.js'

const callTokenBodySchema = z.object({
  conversationId: z.string().uuid(),
})

export async function callRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/api/call/token', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const rawToken = authHeader.slice(7)

    let userId: string
    try {
      const decoded = await verifyToken(rawToken)
      if (decoded.type !== 'access') throw new Error('Invalid token type')
      userId = decoded.userId
    } catch {
      return reply.status(401).send({ error: 'Invalid token' })
    }

    const bodyParse = callTokenBodySchema.safeParse(request.body)
    if (!bodyParse.success) {
      return reply.status(400).send({ error: 'conversationId must be a valid UUID' })
    }
    const { conversationId } = bodyParse.data

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

    const otherParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: { not: userId },
      },
    })

    const roomName = `call-${conversationId}`
    const token = await generateCallToken(userId, roomName)

    return reply.status(200).send({
      token,
      wsUrl: LIVEKIT_WS_URL,
      roomName,
      receiverId: otherParticipant?.userId ?? null,
    })
  })
}
