import { getJetStream, getJetStreamManager, getNatsConnection } from './nats.js'
import { AckPolicy, DeliverPolicy } from 'nats'
import { prisma } from '../trpc/context.js'
import { classifyAndTagMedia } from './sightengine.js'
import { classifyChatMedia } from './chat-classifier.js'

interface ClassifyMessage {
  mediaId: string
  url: string
  type: 'photo' | 'post' | 'chat'
  messageId?: string
  conversationId?: string
}

const CONSUMER_NAME = 'media-classifier'
const SUBJECT = 'lustre.media.classify'
const DLQ_SUBJECT = 'lustre.media.classify.dlq'
const MAX_DELIVER = 5

export async function startMediaClassifyConsumer(): Promise<void> {
  const jsm = await getJetStreamManager()
  const js = await getJetStream()

  // Ensure consumer exists with backoff config
  try {
    await jsm.consumers.info('LUSTRE_MEDIA', CONSUMER_NAME)
  } catch {
    await jsm.consumers.add('LUSTRE_MEDIA', {
      durable_name: CONSUMER_NAME,
      filter_subject: SUBJECT,
      ack_policy: AckPolicy.Explicit,
      deliver_policy: DeliverPolicy.All,
      max_deliver: MAX_DELIVER,
      // Backoff schedule: 1s, 5s, 30s, 120s, 600s
      backoff: [1_000_000_000, 5_000_000_000, 30_000_000_000, 120_000_000_000, 600_000_000_000],
    })
  }

  const consumer = await js.consumers.get('LUSTRE_MEDIA', CONSUMER_NAME)
  const messages = await consumer.consume()

  ;(async () => {
    for await (const msg of messages) {
      try {
        const data: ClassifyMessage = msg.json()

        if (data.type === 'chat' && data.messageId && data.conversationId) {
          await classifyChatMedia(data.messageId, data.url, data.conversationId)
        } else {
          await classifyAndTagMedia(data.mediaId, data.url)
        }

        msg.ack()
      } catch (err) {
        console.error(`[media-classifier] Error processing message:`, err)

        // Check if this is the last delivery attempt
        if (msg.info.redeliveryCount >= MAX_DELIVER - 1) {
          // Publish to DLQ
          const nc = await getNatsConnection()
          const js2 = nc.jetstream()
          try {
            await js2.publish(DLQ_SUBJECT, msg.data)
          } catch (dlqErr) {
            console.error('[media-classifier] Failed to publish to DLQ:', dlqErr)
          }

          // Flag media as needs_review (conservative fallback)
          try {
            const data: ClassifyMessage = msg.json()
            if (data.type === 'chat') {
              // For chat messages, we can't easily flag, just log
              console.warn(
                `[media-classifier] Chat media ${data.messageId} failed classification, needs manual review`,
              )
            } else {
              // For photos/posts, update the needsReview flag
              await prisma.postMedia.updateMany({
                where: { id: data.mediaId },
                data: { needsReview: true },
              })
              await prisma.profilePhoto.updateMany({
                where: { id: data.mediaId },
                data: { needsReview: true },
              })
            }
          } catch (flagErr) {
            console.error('[media-classifier] Failed to flag media for review:', flagErr)
          }

          msg.term() // Terminal failure, stop redelivery
        } else {
          msg.nak() // NAK to trigger redelivery with backoff
        }
      }
    }
  })()
}

// Helper to publish a classification job
export async function publishClassifyJob(data: ClassifyMessage): Promise<void> {
  const js = await getJetStream()
  await js.publish(SUBJECT, new TextEncoder().encode(JSON.stringify(data)))
}
