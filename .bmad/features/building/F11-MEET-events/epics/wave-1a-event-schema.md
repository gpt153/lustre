# Epic: wave-1a-event-schema

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — first)

## Description

Add Prisma models for the events system: Event, EventAttendee, EventTicket. Add enums EventType (ONLINE/IRL/HYBRID), EventStatus (DRAFT/PUBLISHED/CANCELLED/COMPLETED), AttendeeStatus (GOING/WAITLIST/DECLINED), TicketStatus (VALID/USED/REFUNDED/CANCELLED). Event has PostGIS location field and demographic targeting arrays (targetGenders, targetOrientations, targetMinAge, targetMaxAge). Add relation fields to User model.

## Acceptance Criteria

1. Enum `EventType`: ONLINE, IRL, HYBRID
2. Enum `EventStatus`: DRAFT, PUBLISHED, CANCELLED, COMPLETED
3. Enum `AttendeeStatus`: GOING, WAITLIST, DECLINED
4. Enum `TicketStatus`: VALID, USED, REFUNDED, CANCELLED
5. `Event` model: id (uuid), createdById (User), title (VarChar 200), description (VarChar 4000 optional), type (EventType), status (EventStatus default DRAFT), startsAt, endsAt (optional), locationName (VarChar 500 optional), location (geography(Point,4326) optional), capacity (Int optional), price (Decimal(10,2) optional), currency (default SEK), coverImageUrl (optional), targetGenders (Gender[]), targetOrientations (Orientation[]), targetMinAge (Int optional), targetMaxAge (Int optional), createdAt, updatedAt; @@index([startsAt]); @@map("events")
6. `EventAttendee` model: id (uuid), eventId (Event), userId (User), status (AttendeeStatus default GOING), joinedAt; @@unique([eventId, userId]); @@map("event_attendees")
7. `EventTicket` model: id (uuid), eventId (Event), userId (User), status (TicketStatus default VALID), swishPaymentId (String unique optional), pricePaid (Decimal(10,2)), currency (default SEK), purchasedAt, usedAt (optional), refundedAt (optional); @@unique([eventId, userId]); @@map("event_tickets")
8. User model gains relation fields: `eventsCreated Event[] @relation("eventsCreated")`, `eventAttendances EventAttendee[]`, `eventTickets EventTicket[]`
9. `npx prisma generate` succeeds (no schema errors)
10. Migration file created: `npx prisma migrate dev --name add_events_schema --create-only`

## File Paths

- `services/api/prisma/schema.prisma`
