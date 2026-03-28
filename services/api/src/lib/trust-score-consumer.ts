import { getNatsConnection } from './nats.js'
import { StringCodec } from 'nats'
import type { NatsConnection } from 'nats'
import type { PrismaClient } from '@prisma/client'
import { recordActivityPoint } from './trust-score.js'

const sc = StringCodec()

export async function startTrustScoreConsumer(_prisma: PrismaClient): Promise<void> {
  const nc = await getNatsConnection()

  // Start all subscription handlers in parallel (each is an infinite async iterator)
  handleKudosReceived(nc).catch((err) =>
    console.error('[trust-score-consumer] kudos.received error:', err),
  )
  handlePostCreated(nc).catch((err) =>
    console.error('[trust-score-consumer] post.created error:', err),
  )
  handleEventAttended(nc).catch((err) =>
    console.error('[trust-score-consumer] event.attended error:', err),
  )
  handleEventHosted(nc).catch((err) =>
    console.error('[trust-score-consumer] event.hosted error:', err),
  )
  handleMessageSent(nc).catch((err) =>
    console.error('[trust-score-consumer] message.sent error:', err),
  )
  handleReportCreated(nc).catch((err) =>
    console.error('[trust-score-consumer] report.created error:', err),
  )
  handleStreakMilestone(nc).catch((err) =>
    console.error('[trust-score-consumer] streak.milestone error:', err),
  )
  handleKudosMilestone(nc).catch((err) =>
    console.error('[trust-score-consumer] kudos.milestone error:', err),
  )

  console.log('[trust-score-consumer] Started all subscriptions')
}

async function handleKudosReceived(nc: NatsConnection): Promise<void> {
  const sub = nc.subscribe('lustre.kudos.received')
  for await (const msg of sub) {
    try {
      const data = JSON.parse(sc.decode(msg.data)) as { userId: string; recipientId: string }
      await recordActivityPoint(data.recipientId, 'COMMENT_REACT')
    } catch (err) {
      console.error('[trust-score-consumer] Error processing kudos.received:', err)
    }
  }
}

async function handlePostCreated(nc: NatsConnection): Promise<void> {
  const sub = nc.subscribe('lustre.post.created')
  for await (const msg of sub) {
    try {
      const data = JSON.parse(sc.decode(msg.data)) as { userId: string; postId: string }
      await recordActivityPoint(data.userId, 'POST_CREATED')
    } catch (err) {
      console.error('[trust-score-consumer] Error processing post.created:', err)
    }
  }
}

async function handleEventAttended(nc: NatsConnection): Promise<void> {
  const sub = nc.subscribe('lustre.event.attended')
  for await (const msg of sub) {
    try {
      const data = JSON.parse(sc.decode(msg.data)) as { userId: string; eventId: string }
      await recordActivityPoint(data.userId, 'EVENT_ATTEND')
    } catch (err) {
      console.error('[trust-score-consumer] Error processing event.attended:', err)
    }
  }
}

async function handleEventHosted(nc: NatsConnection): Promise<void> {
  const sub = nc.subscribe('lustre.event.hosted')
  for await (const msg of sub) {
    try {
      const data = JSON.parse(sc.decode(msg.data)) as { userId: string; eventId: string }
      await recordActivityPoint(data.userId, 'EVENT_HOST')
    } catch (err) {
      console.error('[trust-score-consumer] Error processing event.hosted:', err)
    }
  }
}

async function handleMessageSent(nc: NatsConnection): Promise<void> {
  const sub = nc.subscribe('lustre.message.sent')
  for await (const msg of sub) {
    try {
      const data = JSON.parse(sc.decode(msg.data)) as {
        senderId: string
        conversationId: string
      }
      await recordActivityPoint(data.senderId, 'MESSAGE_SENT')
    } catch (err) {
      console.error('[trust-score-consumer] Error processing message.sent:', err)
    }
  }
}

async function handleReportCreated(nc: NatsConnection): Promise<void> {
  const sub = nc.subscribe('lustre.report.created')
  for await (const msg of sub) {
    try {
      // Safety score reads reports from DB directly via computeSafetyScore — no activity point needed
      JSON.parse(sc.decode(msg.data)) as {
        reporterId: string
        targetId: string
        targetType: string
      }
    } catch (err) {
      console.error('[trust-score-consumer] Error processing report.created:', err)
    }
  }
}

async function handleStreakMilestone(nc: NatsConnection): Promise<void> {
  const sub = nc.subscribe('lustre.streak.milestone')
  for await (const msg of sub) {
    try {
      const data = JSON.parse(sc.decode(msg.data)) as { userId: string; streakDays: number }
      // Sparks/spotlight awards are wave-2 — log for later processing
      console.log('[trust-score-consumer] Streak milestone:', data)
    } catch (err) {
      console.error('[trust-score-consumer] Error processing streak.milestone:', err)
    }
  }
}

async function handleKudosMilestone(nc: NatsConnection): Promise<void> {
  const sub = nc.subscribe('lustre.kudos.milestone.*')
  for await (const msg of sub) {
    try {
      const data = JSON.parse(sc.decode(msg.data)) as { userId: string; milestone: number }
      // Spark awards are wave-2 — log for later processing
      console.log('[trust-score-consumer] Kudos milestone:', data)
    } catch (err) {
      console.error('[trust-score-consumer] Error processing kudos.milestone:', err)
    }
  }
}
