import type { PrismaClient } from '@prisma/client'
import type { NatsConnection } from 'nats'
import { StringCodec } from 'nats'

const sc = StringCodec()

export async function processPostEventSuggestions(
  prisma: PrismaClient,
  nats: NatsConnection,
  eventId: string,
): Promise<void> {
  // Get all GOING attendees with user profile info
  const attendees = await prisma.eventAttendee.findMany({
    where: { eventId, status: 'GOING' },
  })

  // Fetch user profiles for attendees
  const userIds = attendees.map(a => a.userId)
  const profiles = await prisma.profile.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, allowPostEventSuggestions: true },
  }) as unknown as Array<{ userId: string; allowPostEventSuggestions: boolean }>

  // Filter to opted-in users only
  const profileMap = new Map(profiles.map(p => [p.userId, p]))
  const optedIn = attendees.filter(a => profileMap.get(a.userId)?.allowPostEventSuggestions === true)

  // For each pair, check no existing Match or Swipe
  for (let i = 0; i < optedIn.length; i++) {
    for (let j = i + 1; j < optedIn.length; j++) {
      const userA = optedIn[i].userId
      const userB = optedIn[j].userId

      // Check no existing match
      const existingMatch = await prisma.match.findFirst({
        where: {
          OR: [
            { user1Id: userA, user2Id: userB },
            { user1Id: userB, user2Id: userA },
          ],
        },
      })
      if (existingMatch) continue

      // Check no existing swipe
      const existingSwipe = await prisma.swipe.findFirst({
        where: {
          OR: [
            { userId: userA, targetId: userB },
            { userId: userB, targetId: userA },
          ],
        },
      })
      if (existingSwipe) continue

      // Publish suggestion for A → B
      nats.publish(
        'post_event.suggestion',
        sc.encode(JSON.stringify({ userId: userA, suggestedUserId: userB, eventId })),
      )
      // Publish suggestion for B → A
      nats.publish(
        'post_event.suggestion',
        sc.encode(JSON.stringify({ userId: userB, suggestedUserId: userA, eventId })),
      )
    }
  }
}
