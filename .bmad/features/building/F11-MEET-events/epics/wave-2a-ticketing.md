# Epic: wave-2a-ticketing

**Model:** haiku
**Wave:** 2
**Group:** A (parallel)

## Description

Ticket purchase flow for paid events using Swish. Organizer sets a price on the Event. Attendee purchases a ticket via Swish; on callback the EventTicket is created with status VALID and the user is added to EventAttendee. Includes ticket validation (check-in) and refund handling. Follow exact Swish mTLS pattern from `services/api/src/auth/swish.ts`.

## Acceptance Criteria

1. `services/api/src/lib/event-tickets.ts` — `createTicketPaymentRequest(prisma, userId, eventId, phoneNumber?)`: validates event is PUBLISHED and has a price; creates a pending EventTicket (status VALID, swishPaymentId from Swish response); returns `{ swishPaymentId, paymentRequestToken }`
2. `handleTicketPaymentCallback(prisma, body: SwishCallbackBody)`: finds EventTicket by swishPaymentId; on PAID: upserts EventAttendee with GOING and marks ticket VALID; on DECLINED/ERROR: marks ticket CANCELLED; idempotent
3. `event.purchaseTicket` mutation in event-router.ts: input `{ eventId, phoneNumber? }` — calls `createTicketPaymentRequest`; throws BAD_REQUEST if event is free (no price) or user already has a VALID ticket
4. `event.checkTicketStatus` query: input `{ eventId }` — returns ticket status for `ctx.userId` on that event (or null if no ticket)
5. `event.validateTicket` mutation: input `{ eventId, ticketId }` — only callable by event creator; marks ticket as USED (sets usedAt); throws NOT_FOUND/FORBIDDEN
6. `event.refundTicket` mutation: input `{ ticketId }` — only callable by event creator; marks ticket REFUNDED (sets refundedAt); refund to user is manual/out-of-band (log only)
7. Fastify route `POST /api/events/ticket-callback` registered in main server file; calls `handleTicketPaymentCallback`
8. All new procedures added to event-router.ts and exported from the router

## File Paths

- `services/api/src/lib/event-tickets.ts`
- `services/api/src/trpc/event-router.ts`
- `services/api/src/server.ts`
