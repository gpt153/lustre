# Epic: wave-3b-kudos-screens-web

**Model:** haiku
**Wave:** 3
**Group:** A (parallel with 3a)

## Description

Build the web UI for the kudos system: a kudos prompt modal (triggered after conversation archive), badge selection page with AI suggestions and manual browse, and a profile section displaying kudos count and top badges. Reuses shared hooks from packages/app.

## Acceptance Criteria

1. Kudos prompt modal at `/chat` page — when pending prompts exist, show a modal asking "Vill du lamna kudos till [namn]?" with Accept/Dismiss.
2. Badge selection page at `/kudos/give/[recipientId]` — free-text textarea, AI-suggested badges section, full badge catalog grid organized by category. Max 6 badges selectable. Submit button.
3. Profile kudos section integrated into `/profile/[userId]` — total kudos count displayed prominently, top badges shown as styled tags with counts.
4. Spicy badges hidden when viewer is in Vanilla mode.
5. Reuses `useKudos` hook from `packages/app/src/hooks/useKudos.ts`.
6. Badge category filters as tab buttons above the badge grid.
7. Responsive layout: badge grid adapts from 2 columns (mobile) to 4 columns (desktop).

## File Paths

- `apps/web/app/(app)/kudos/give/[recipientId]/page.tsx`
- `apps/web/app/(app)/chat/page.tsx` (integrate kudos prompt modal)
- `apps/web/app/(app)/profile/[userId]/page.tsx` (integrate kudos section)
- `packages/ui/src/KudosBadgeTag.tsx`
