# Epic: wave-1b-event-api

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — after wave-1a)

## Description

Create the event tRPC router with full CRUD plus RSVP and attendee management. Register it in the main appRouter. All procedures are protectedProcedure. Follows exact patterns from group-router.ts and match-router.ts.

## Acceptance Criteria

1. `event.create` mutation: input `{ title, description?, type, status?, startsAt, endsAt?, locationName?, latitude?, longitude?, capacity?, price?, currency?, coverImageUrl?, targetGenders?, targetOrientations?, targetMinAge?, targetMaxAge? }` — creates Event with `createdById: ctx.userId`; if lat/lng provided, sets `location` as PostGIS point via `ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography`; returns created event
2. `event.update` mutation: input `{ eventId, ...same fields as create (all optional) }` — verifies `createdById === ctx.userId`, updates event; throws NOT_FOUND or FORBIDDEN
3. `event.get` query: input `{ eventId }` — returns event with `_count: { attendees: true, tickets: true }` and `creator: { select: { id, displayName } }`; throws NOT_FOUND
4. `event.list` query: input `{ cursor?, limit? (default 20), type?, status?, organizerId? }` — cursor-based pagination, orders by `startsAt ASC`, returns `{ events, nextCursor }`
5. `event.search` query: input `{ lat, lng, radiusKm (default 50), limit? }` — PostGIS `ST_DWithin` raw query returning events within radius with distance; orders by distance
6. `event.rsvp` mutation: input `{ eventId, status (AttendeeStatus) }` — upserts EventAttendee for `ctx.userId`; if free event (price is null/0) status GOING, creates/updates attendee; returns attendee record
7. `event.getAttendees` query: input `{ eventId, limit? }` — returns attendees with `user: { select: { id, displayName } }`, only for published events or if requester is creator
8. `event.cancel` mutation: input `{ eventId }` — verifies creator, sets status to CANCELLED; returns updated event
9. Router imported and registered in `services/api/src/trpc/router.ts` as `event: eventRouter`
10. All inputs validated with Zod; TRPCError thrown for NOT_FOUND/FORBIDDEN/BAD_REQUEST cases

## File Paths

- `services/api/src/trpc/event-router.ts`
- `services/api/src/trpc/router.ts`
