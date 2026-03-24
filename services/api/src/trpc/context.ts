import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import { PrismaClient } from '@prisma/client'
import { verifyToken, hashToken } from '../auth/jwt.js'

let prisma: PrismaClient

declare global {
  var __prisma: PrismaClient | undefined
}

if (!global.__prisma) {
  global.__prisma = new PrismaClient()
}
prisma = global.__prisma

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  let userId: string | null = null
  let sessionId: string | null = null

  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const decoded = await verifyToken(token)
      if (decoded.type === 'access') {
        userId = decoded.userId

        // Find the session by matching the token hash
        const tokenHash = hashToken(token)
        const session = await prisma.session.findUnique({
          where: { tokenHash },
        })
        if (session) {
          sessionId = session.id
        }
      }
    } catch {
      // Invalid or expired token - userId remains null
    }
  }

  return { req, res, prisma, userId, sessionId }
}

export type Context = Awaited<ReturnType<typeof createContext>>
