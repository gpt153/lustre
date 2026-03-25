import { prisma } from '../trpc/context.js'
import { getNatsConnection } from './nats.js'
import { StringCodec } from 'nats'

const sc = StringCodec()

export interface ChatMessagePayload {
  conversationId: string
  senderId: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'VIDEO'
  clientMsgId?: string
}

export async function startChatConsumer(): Promise<void> {
  const nc = await getNatsConnection()

  const sub = nc.subscribe('chat.message.new')

  for await (const msg of sub) {
    try {
      const payload = JSON.parse(sc.decode(msg.data)) as ChatMessagePayload

      // Persist message to database
      const dbMessage = await prisma.message.create({
        data: {
          conversationId: payload.conversationId,
          senderId: payload.senderId,
          content: payload.content,
          type: payload.type,
          status: 'SENT',
        },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          type: true,
          status: true,
          mediaUrl: true,
          deletedAt: true,
          createdAt: true,
        },
      })

      // Reply with the persisted message ID if reply-to is present
      if (msg.reply) {
        await msg.respond(sc.encode(JSON.stringify({ id: dbMessage.id })))
      }
    } catch (error) {
      console.error('Error processing chat message from NATS:', error)
      // Continue processing other messages
    }
  }
}
