import { getNatsConnection } from './nats.js'
import { StringCodec } from 'nats'
import type { PrismaClient } from '@prisma/client'

const sc = StringCodec()

export async function startKudosConsumer(prisma: PrismaClient): Promise<void> {
  const nc = await getNatsConnection()
  const sub = nc.subscribe('match.conversation.archived')

  for await (const msg of sub) {
    try {
      const data = JSON.parse(sc.decode(msg.data)) as {
        matchId: string
        user1Id: string
        user2Id: string
      }

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      await prisma.kudosPrompt.upsert({
        where: {
          userId_recipientId_matchId: {
            userId: data.user1Id,
            recipientId: data.user2Id,
            matchId: data.matchId,
          },
        },
        update: {},
        create: {
          userId: data.user1Id,
          recipientId: data.user2Id,
          matchId: data.matchId,
          expiresAt,
        },
      })

      await prisma.kudosPrompt.upsert({
        where: {
          userId_recipientId_matchId: {
            userId: data.user2Id,
            recipientId: data.user1Id,
            matchId: data.matchId,
          },
        },
        update: {},
        create: {
          userId: data.user2Id,
          recipientId: data.user1Id,
          matchId: data.matchId,
          expiresAt,
        },
      })
    } catch (err) {
      console.error('[kudos-consumer] Error processing archived conversation:', err)
    }
  }
}
