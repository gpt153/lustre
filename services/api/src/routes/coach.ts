import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { verifyToken } from '../auth/jwt.js'
import { generateCallToken, LIVEKIT_WS_URL } from '../lib/livekit.js'

const coachTokenBodySchema = z.object({
  mode: z.enum(['voice', 'text']),
  persona: z.enum(['coach', 'partner']).optional(),
})

export async function coachRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/api/coach/token', async (request, reply) => {
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

    const parseResult = coachTokenBodySchema.safeParse(request.body)
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: parseResult.error.flatten() })
    }

    const { persona } = parseResult.data
    const resolvedPersona = persona ?? 'coach'
    const roomName = `coach-${userId}-${randomUUID()}`

    const token = await generateCallToken(userId, roomName)

    return reply.status(200).send({
      token,
      wsUrl: LIVEKIT_WS_URL,
      roomName,
      persona: resolvedPersona,
    })
  })
}
