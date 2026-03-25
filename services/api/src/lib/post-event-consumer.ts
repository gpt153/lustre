import type { PrismaClient } from '@prisma/client'
import type { NatsConnection } from 'nats'
import { StringCodec } from 'nats'

const sc = StringCodec()

export async function startPostEventConsumer(prisma: PrismaClient, nats: NatsConnection): Promise<void> {
  const sub = nats.subscribe('post_event.suggestion')

  ;(async () => {
    for await (const msg of sub) {
      try {
        const data = JSON.parse(sc.decode(msg.data)) as {
          userId: string
          suggestedUserId: string
          eventId: string
        }
        // Log the suggestion — users will naturally see each other in discovery
        console.log(`[post-event] Suggestion: ${data.userId} → ${data.suggestedUserId} from event ${data.eventId}`)
      } catch (err) {
        console.error('post-event-consumer error:', err)
      }
    }
  })()
}
