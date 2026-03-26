# Epic: wave-3b-intention-screens-web

**Model:** haiku
**Wave:** 3
**Group:** A (parallel with 3a)

## Description

Build the web UI for the Intentions system: Intention creation/edit form, Intention dashboard page, per-Intention feed page with intent-first profile cards. Responsive design with sidebar for active Intentions on desktop. Integrate into the discover section with mode-aware navigation.

## Acceptance Criteria

1. Create/edit Intention page at `/discover/intentions/new` and `/discover/intentions/[intentionId]/edit` — form with all fields, Zod client-side validation, kink fields hidden in Vanilla mode.
2. Intention dashboard at `/discover/intentions` — card grid of user's Intentions with status, days remaining, pause/resume/delete actions. "Create new" button.
3. Per-Intention feed at `/discover/intentions/[intentionId]` — profile list with intent-first cards (compatibility score, matched tags, bio snippet above photo). IntersectionObserver infinite scroll.
4. Desktop layout: sidebar with active Intentions list, main content area shows selected Intention's feed. Mobile layout: top tabs for switching between Intentions.
5. Discover page (`/discover`) updated with mode-aware tabs: Spicy [Intentions | Swipe | Search], Vanilla [Swipe | Intentions | Search].
6. Reuses `useIntentions` hook from `packages/app/src/hooks/useIntentions.ts`.
7. Fallback results shown with "Suggested" badge to distinguish from intention-matched profiles.

## File Paths

- `apps/web/app/(app)/discover/intentions/page.tsx`
- `apps/web/app/(app)/discover/intentions/new/page.tsx`
- `apps/web/app/(app)/discover/intentions/[intentionId]/page.tsx`
- `apps/web/app/(app)/discover/intentions/[intentionId]/edit/page.tsx`
- `apps/web/app/(app)/discover/page.tsx` (update tabs)
- `packages/ui/src/IntentionProfileCard.tsx`
