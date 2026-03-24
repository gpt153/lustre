import { PrismaClient, Session } from '@prisma/client'
import { FastifyRequest } from 'fastify'
import { hashToken } from './jwt.js'

export async function createSession(
  prisma: PrismaClient,
  userId: string,
  token: string,
  req: FastifyRequest,
): Promise<Session> {
  const tokenHash = hashToken(token)
  const ipAddress = req.ip || null
  const deviceInfo = req.headers['user-agent'] || null

  // Token expiry: 30 days
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      ipAddress,
      deviceInfo,
      expiresAt,
    },
  })

  return session
}

export async function revokeSession(
  prisma: PrismaClient,
  sessionId: string,
): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  })
}

export async function revokeAllUserSessions(
  prisma: PrismaClient,
  userId: string,
): Promise<void> {
  await prisma.session.updateMany({
    where: { userId },
    data: { revokedAt: new Date() },
  })
}

export async function getActiveSessions(
  prisma: PrismaClient,
  userId: string,
): Promise<Session[]> {
  const now = new Date()
  return prisma.session.findMany({
    where: {
      userId,
      revokedAt: null,
      expiresAt: {
        gt: now,
      },
    },
  })
}
