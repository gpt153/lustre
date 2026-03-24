# Roadmap: F11-MEET-events

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 3
**Total epics:** 7

---

## Wave 1: Event Backend
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-event-schema (haiku) — Prisma: Event, EventAttendee, EventTicket. Enums for event type, status. PostGIS location.
- wave-1b-event-api (haiku) — tRPC: event.create, event.update, event.list, event.search, event.rsvp, event.getAttendees
- wave-1c-event-targeting (haiku) — Targeting filter: event visible only to matching profiles based on organizer's demographic settings

### Testgate Wave 1:
- [ ] Event CRUD works
- [ ] Targeting filters events correctly
- [ ] RSVP adds user to attendee list

---

## Wave 2: Ticketing & Discovery
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-ticketing (haiku) — Ticket purchase flow, Swish integration for payment, ticket validation, refund handling
- wave-2b-event-discovery (haiku) — Map view (PostGIS proximity), calendar view, list with filters, AI event recommendations (basic scoring)

### Testgate Wave 2:
- [ ] Ticket purchase via Swish works
- [ ] Map shows nearby events
- [ ] Calendar view displays events chronologically

---

## Wave 3: Event Screens
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-event-screens-mobile (haiku) — Event list, event detail, create event, map/calendar views, RSVP flow, ticket purchase
- wave-3b-event-screens-web (haiku) — Same for web
- wave-3c-post-event (haiku) — Post-event suggestion engine: "You were at the same event" opt-in connections

### Testgate Wave 3:
- [ ] Event creation flow works end-to-end
- [ ] Map discovery shows events near user
- [ ] Ticket purchase completes successfully
