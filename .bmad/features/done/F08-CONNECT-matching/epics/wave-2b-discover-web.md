# Epic: wave-2b-discover-web

**Model:** haiku
**Wave:** 2
**Group:** A (parallel with 2a)

## Description

Build the web discover experience: grid/card view for browsing profiles, search with filters, matches list. Replace the placeholder discover page.

## Acceptance Criteria

1. `apps/web/app/(app)/discover/page.tsx` updated — grid layout of profile cards using DiscoverScreen from shared package. Each card shows photo, displayName, age, bio preview, with Like/Pass buttons. Responsive grid (1-3 columns).
2. `apps/web/app/(app)/discover/search/page.tsx` exists — search page with filter sidebar (gender, orientation, age range, seeking, radius) and results grid. Uses `match.search` tRPC query.
3. `apps/web/app/(app)/discover/matches/page.tsx` exists — matches list page showing matched profiles in a grid. Tappable to view profile.
4. Match animation shown as a modal/overlay when mutual match occurs on the discover page
5. All pages are `'use client'` components
6. All pages use Tamagui components and follow existing web page patterns
7. Navigation between discover/search/matches via tabs or links at the top of the discover section

## File Paths

- `apps/web/app/(app)/discover/page.tsx` (edit)
- `apps/web/app/(app)/discover/search/page.tsx` (new)
- `apps/web/app/(app)/discover/matches/page.tsx` (new)
