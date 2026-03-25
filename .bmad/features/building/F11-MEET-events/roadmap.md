# Roadmap: F11-MEET-events

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Started:** 2026-03-25
**Waves:** 3
**Total epics:** 8

---

## Wave 1: Event Backend
**Status:** DONE
**Started:** 2026-03-25T00:00:00Z
**Completed:** 2026-03-25

**Testgate results:** Event CRUD PASS | Targeting filter PASS | RSVP PASS

### Parallelization groups:
**Group A (sequential):**
- wave-1a-event-schema (haiku) — Prisma: Event, EventAttendee, EventTicket. Enums for event type, status. PostGIS location. **Status: VERIFIED**
- wave-1b-event-api (haiku) — tRPC: event.create, event.update, event.list, event.search, event.rsvp, event.getAttendees **Status: VERIFIED**
- wave-1c-event-targeting (haiku) — Targeting filter **Status: VERIFIED**

### Testgate Wave 1:
- [x] Event CRUD works
- [x] Targeting filters events correctly
- [x] RSVP adds user to attendee list

---

## Wave 2: Ticketing & Discovery
**Status:** IN_PROGRESS
**Started:** 2026-03-25

### Parallelization groups:
**Group A (parallel):**
- wave-2a-ticketing (haiku) **Status: IN_PROGRESS** — Ticket purchase flow, Swish integration for payment, ticket validation, refund handling
- wave-2b-event-discovery (haiku) **Status: IN_PROGRESS** — Map view (PostGIS proximity), calendar view, list with filters, AI event recommendations (basic scoring)

### Testgate Wave 2:
- [ ] Ticket purchase via Swish works
- [ ] Map shows nearby events
- [ ] Calendar view displays events chronologically

---

## Wave 3: Event Screens
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-event-screens-mobile (haiku) — Event list, event detail, create event, RSVP flow, ticket purchase
- wave-3b-event-screens-web (haiku) — Same for web
- wave-3c-post-event (haiku) — Post-event suggestion engine: "You were at the same event" opt-in connections

### Testgate Wave 3:
- [ ] Event creation flow works end-to-end
- [ ] Discovery shows nearby events
- [ ] Ticket purchase completes successfully
