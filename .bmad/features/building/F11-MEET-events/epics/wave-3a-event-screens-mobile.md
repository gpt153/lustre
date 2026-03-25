# Epic: wave-3a-event-screens-mobile

**Model:** haiku
**Wave:** 3
**Group:** A (parallel)

## Description

Mobile screens for the events feature. New Events tab in the bottom navigator. Shared hook `useEvents` and component `EventCard` in packages/app/src. Mobile tab renders EventListScreen. Screens: list, detail, create, RSVP/ticket purchase flow. Uses Tamagui for UI. Follows exact patterns from GroupListScreen, GroupDetailScreen, CreateGroupScreen.

## Acceptance Criteria

1. `packages/app/src/hooks/useEvents.ts` — exports `useEvents({ type?, dateFrom?, dateTo? })` using `trpc.event.listFiltered.useInfiniteQuery`; returns `{ events, isLoading, hasNextPage, fetchNextPage, rsvp, purchaseTicket, isRsvping }`; `rsvp(eventId)` calls `trpc.event.rsvp.useMutation` then refetches; `purchaseTicket(eventId, phone?)` calls `trpc.event.purchaseTicket.useMutation`
2. `packages/app/src/components/EventCard.tsx` — Tamagui card showing: coverImage (or color placeholder), title, date/time formatted, location name, type badge (ONLINE/IRL/HYBRID), attendee count, price (or "Free"); pressable; receives `event` prop and `onPress` callback
3. `packages/app/src/screens/EventListScreen.tsx` — FlatList of EventCards with tab bar (All/Online/IRL); infinite scroll via `fetchNextPage`; loading spinner; empty state
4. `packages/app/src/screens/EventDetailScreen.tsx` — shows full event info; attendee list preview (up to 5); RSVP button (free) or Buy Ticket button (paid, price shown); if already attending: "You're going" badge; creator sees Cancel Event button
5. `packages/app/src/screens/CreateEventScreen.tsx` — form: title, description, type selector (ONLINE/IRL/HYBRID), date/time pickers, location name, capacity, price (optional), targeting fields (gender multi-select, orientation multi-select, min/max age); Submit calls `trpc.event.create.useMutation`
6. All screens exported from `packages/app/src/index.ts`
7. `apps/mobile/app/(tabs)/events.tsx` — renders EventListScreen; tab icon "calendar" or similar
8. `apps/mobile/app/(tabs)/_layout.tsx` — adds Events tab between Groups and Chat

## File Paths

- `packages/app/src/hooks/useEvents.ts`
- `packages/app/src/components/EventCard.tsx`
- `packages/app/src/screens/EventListScreen.tsx`
- `packages/app/src/screens/EventDetailScreen.tsx`
- `packages/app/src/screens/CreateEventScreen.tsx`
- `packages/app/src/index.ts`
- `apps/mobile/app/(tabs)/events.tsx`
- `apps/mobile/app/(tabs)/_layout.tsx`
