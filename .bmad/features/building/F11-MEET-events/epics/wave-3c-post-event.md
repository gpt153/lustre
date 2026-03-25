# Epic: wave-3c-post-event

**Model:** haiku
**Wave:** 3
**Group:** A (parallel)

## Description

Post-event suggestion engine: after an event completes, attendees are suggested to each other via the discovery system. Opt-in only — users who have enabled `allowPostEventSuggestions` (a new Profile field) are visible to co-attendees. Implemented as a NATS consumer that fires when an event transitions to COMPLETED status. Follows pattern from `services/api/src/lib/chat-consumer.ts`.

## Acceptance Criteria

1. `services/api/prisma/schema.prisma` — add `allowPostEventSuggestions Boolean @default(false) @map("allow_post_event_suggestions")` to Profile model
2. `services/api/src/lib/post-event-suggestions.ts` — exports `processPostEventSuggestions(prisma, nats, eventId)`: fetches all EventAttendee records for the event where status=GOING; fetches each attendee's profile; filters to those with `allowPostEventSuggestions=true`; for each pair (A,B) where both opt in and no existing Match or Swipe between them: publishes NATS message `post_event.suggestion` with `{ userId: A.userId, suggestedUserId: B.userId, eventId }`
3. `services/api/src/lib/post-event-consumer.ts` — NATS JetStream consumer subscribing to `post_event.suggestion`; for each message: upserts a SeenProfile record so suggestions appear in discovery stack; acks message; exports `startPostEventConsumer(prisma, nats)`
4. `event.complete` mutation in event-router.ts: input `{ eventId }` — creator-only; sets event status to COMPLETED; publishes NATS message `event.completed` with `{ eventId }` via `ctx.nats.publish`
5. `services/api/src/lib/event-completed-consumer.ts` — subscribes `event.completed`; calls `processPostEventSuggestions`; exports `startEventCompletedConsumer(prisma, nats)`
6. `trpc.profile.updateSettings` (or existing profile update) in profile-router.ts gains `allowPostEventSuggestions?: boolean` in its input schema and saves it to the Profile
7. Both consumers started in server startup (follow pattern of existing consumers)
8. `event.complete` procedure added to event-router.ts

## File Paths

- `services/api/prisma/schema.prisma`
- `services/api/src/lib/post-event-suggestions.ts`
- `services/api/src/lib/post-event-consumer.ts`
- `services/api/src/lib/event-completed-consumer.ts`
- `services/api/src/trpc/event-router.ts`
- `services/api/src/trpc/profile-router.ts`
- `services/api/src/server.ts`
