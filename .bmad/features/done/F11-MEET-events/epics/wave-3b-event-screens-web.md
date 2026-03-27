# Epic: wave-3b-event-screens-web

**Model:** haiku
**Wave:** 3
**Group:** A (parallel)

## Description

Web screens for the events feature in Next.js 16. Events list page, event detail page, create event page. Navigation link added to web header. Reuses EventCard component from packages/app/src. Follows exact patterns from apps/web/app/(app)/groups/ pages.

## Acceptance Criteria

1. `apps/web/app/(app)/events/page.tsx` — 'use client'; lists events using `trpc.event.listFiltered.useInfiniteQuery`; renders EventCard grid (responsive 1-3 columns); filter bar (type buttons: All/Online/IRL/Hybrid); infinite scroll Load More button; loading spinner; empty state; link to create event
2. `apps/web/app/(app)/events/[eventId]/page.tsx` — 'use client'; fetches event via `trpc.event.get.useQuery`; shows full details: title, type badge, date/time, location, description, price or "Free", attendee count; RSVP button (free events) or Buy Ticket with Swish phone input (paid); creator sees Edit and Cancel buttons
3. `apps/web/app/(app)/events/create/page.tsx` — 'use client'; form matching CreateEventScreen fields; uses `trpc.event.create.useMutation`; on success redirects to `/events/[eventId]`; back link to /events
4. Navigation: `apps/web/app/(app)/layout.tsx` header gains `<Link href="/events">Events</Link>` nav item
5. All pages use `AuthGuard` via the app layout (no extra wrapping needed)
6. TypeScript types inferred from tRPC — no `any` types

## File Paths

- `apps/web/app/(app)/events/page.tsx`
- `apps/web/app/(app)/events/[eventId]/page.tsx`
- `apps/web/app/(app)/events/create/page.tsx`
- `apps/web/app/(app)/layout.tsx`
