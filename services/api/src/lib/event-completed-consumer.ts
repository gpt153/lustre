import type { PrismaClient } from '@prisma/client'
import type { NatsConnection } from 'nats'
import { StringCodec } from 'nats'
import { processPostEventSuggestions } from './post-event-suggestions.js'

const sc = StringCodec()

export async function startEventCompletedConsumer(prisma: PrismaClient, nats: NatsConnection): Promise<void> {
  const sub = nats.subscribe('event.completed')

  ;(async () => {
    for await (const msg of sub) {
      try {
        const { eventId } = JSON.parse(sc.decode(msg.data)) as { eventId: string }
        await processPostEventSuggestions(prisma, nats, eventId)
      } catch (err) {
        console.error('event-completed-consumer error:', err)
      }
    }
  })()
}
