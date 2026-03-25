# Epic: wave-2b-event-discovery

**Model:** haiku
**Wave:** 2
**Group:** A (parallel)

## Description

Enhanced event discovery: map-based proximity search (PostGIS), calendar-grouped list, filter support (type/date range/distance), and basic AI recommendation scoring. Recommendations score events based on user profile seeking/interests. All new procedures added to the existing event-router.ts.

## Acceptance Criteria

1. `event.nearby` query: input `{ lat, lng, radiusKm (default 50), limit? (default 20) }` — PostGIS raw query `SELECT e.*, ST_Distance(e.location::geography, ST_SetSRID(ST_MakePoint($lng,$lat),4326)::geography)/1000 AS distance_km FROM events e WHERE e.status='PUBLISHED' AND ST_DWithin(e.location::geography, ST_SetSRID(ST_MakePoint($lng,$lat),4326)::geography, $radiusMeters)` ORDER BY distance_km; applies targeting filter; returns events with distance_km
2. `event.calendar` query: input `{ year, month }` — fetches all PUBLISHED events in the given month ordered by startsAt; returns `{ date: string (YYYY-MM-DD), events: Event[] }[]` grouped by date
3. `event.listFiltered` query: input `{ type?, dateFrom?, dateTo?, lat?, lng?, radiusKm?, cursor?, limit? (default 20) }` — applies Prisma WHERE filters for type/date range; if lat/lng/radiusKm provided, fetches only events within radius (uses raw query); cursor pagination; applies targeting filter
4. `event.recommended` query: input `{ limit? (default 10) }` — fetches PUBLISHED upcoming events; scores each: +3 if event type is IRL or HYBRID (prefer in-person), +2 if event in next 7 days, +1 for each targetOrientation matching user's orientation, +1 if targeting matches user age; returns top N scored events sorted by score desc then startsAt asc
5. All queries apply targeting filter (matchesEventTargeting) and exclude DRAFT/CANCELLED for non-creators
6. Queries without location gracefully handle null location field (don't crash)

## File Paths

- `services/api/src/trpc/event-router.ts`
