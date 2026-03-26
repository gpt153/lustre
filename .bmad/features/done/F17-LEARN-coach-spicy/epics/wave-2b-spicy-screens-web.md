# Epic: wave-2b-spicy-screens-web

**Wave:** 2 — Group A (parallel with wave-2a)
**Model:** haiku
**Estimate:** medium

## Context
- Web app: Next.js 16 at `apps/web/app/(app)/`
- Existing learn pages: `apps/web/app/(app)/learn/page.tsx`, `apps/web/app/(app)/learn/[moduleId]/page.tsx`, `apps/web/app/(app)/learn/[moduleId]/lesson/[lessonId]/page.tsx`
- Settings page: `apps/web/app/(app)/settings/` directory
- Shared hook `useLearn` is in `packages/app/src/hooks/useLearn.ts` (updated in wave-2a) — import from there
- Web uses Tamagui + Next.js — follow existing patterns in learn pages
- `trpc.profile.toggleSpicyMode` mutation available after wave-1a
- `trpc.module.list` returns `isSpicy` field on each module

## Goal
Web equivalents of the spicy learn UI: spicy section on learn page, 18+ badge on lesson pages, and a spicy mode toggle on settings.

## Acceptance Criteria

1. `apps/web/app/(app)/learn/page.tsx` shows a "Spicy Modules 🌶️" section below vanilla modules grid; when locked renders a `SpicyGateBanner` (can import from `packages/app/src/components/SpicyGateBanner.tsx` if compatible, or inline a web-specific equivalent)
2. Spicy modules in the grid show a red "🌶️ 18+" badge overlay on the card
3. `apps/web/app/(app)/learn/[moduleId]/page.tsx` shows "18+" pill in the module header when `module.isSpicy=true`
4. `apps/web/app/(app)/learn/[moduleId]/lesson/[lessonId]/page.tsx` shows "18+" pill in the lesson header when lesson's module is spicy
5. New page `apps/web/app/(app)/settings/spicy/page.tsx` renders a toggle card: title "Spicy Mode", subtitle "Access adult coaching modules (18+). Requires completion of vanilla module 6.", a toggle input bound to `profile.spicyModeEnabled`, calls `toggleSpicyMode` on change
6. Settings nav (wherever the settings sidebar/nav is) includes a link to `/settings/spicy` with label "Spicy Mode 🌶️"

## File Paths

- `apps/web/app/(app)/learn/page.tsx`
- `apps/web/app/(app)/learn/[moduleId]/page.tsx`
- `apps/web/app/(app)/learn/[moduleId]/lesson/[lessonId]/page.tsx`
- `apps/web/app/(app)/settings/spicy/page.tsx`
