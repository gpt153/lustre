# Epic: wave-1c-event-targeting

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — after wave-1b)

## Description

Add a targeting filter to `event.list` and `event.search` so that events with demographic constraints are only visible to users whose profile matches. The filter checks the requesting user's profile (gender, orientation, age) against the event's `targetGenders`, `targetOrientations`, `targetMinAge`, `targetMaxAge`. Events with empty targeting arrays are visible to all. Also filter out DRAFT and CANCELLED events for non-creators in list/search.

## Acceptance Criteria

1. Helper `matchesEventTargeting(profile, event)` returns true if: `targetGenders` is empty OR profile.gender is in targetGenders; AND `targetOrientations` is empty OR profile.orientation is in targetOrientations; AND `targetMinAge` is null OR profile.age >= targetMinAge; AND `targetMaxAge` is null OR profile.age <= targetMaxAge
2. `event.list` query: fetches requesting user's profile; post-filters events using `matchesEventTargeting`; non-creators only see PUBLISHED or COMPLETED events
3. `event.search` (PostGIS) query: similarly applies targeting filter post-query; non-creators only see PUBLISHED/COMPLETED
4. `event.get`: non-creator cannot access a DRAFT event (throws FORBIDDEN)
5. `event.rsvp`: cannot RSVP to a CANCELLED or COMPLETED event (throws BAD_REQUEST)
6. If requesting user has no profile, they see all events without targeting filter (graceful fallback)
7. Targeting filter is implemented as a pure TypeScript function (no DB query) for maintainability
8. All changes are in event-router.ts only — no schema changes needed

## File Paths

- `services/api/src/trpc/event-router.ts`
