# Epic: wave-1a-landing-page
**Model:** haiku
**Wave:** 1, Group A

## Goal
Add a countdown timer to the existing landing page at `apps/web/app/(landing)/`. The page already has hero, email signup, mode toggle, and social proof. Only the countdown timer is missing.

## Context
- Landing page: `apps/web/app/(landing)/page.tsx`
- Existing components: `WaitlistForm`, `ScrollReveal`, `ModeToggle`
- CSS: `apps/web/app/(landing)/landing.css`
- Stack: React, Next.js, plain CSS (no Tamagui here — this is a standalone landing page)

## Acceptance Criteria
1. New file `apps/web/app/(landing)/countdown.tsx` — `'use client'` component that counts down to `TARGET_DATE = new Date('2026-05-01T12:00:00Z')`
2. Countdown shows days, hours, minutes, seconds with Swedish labels (dagar, timmar, minuter, sekunder)
3. Countdown updates every second via `setInterval` in a `useEffect`
4. When target date is passed, countdown shows "Nu är vi live!" instead
5. Countdown is exported as `Countdown` component
6. In `apps/web/app/(landing)/page.tsx`, import and render `<Countdown />` inside the `hero__cta-area` section, above the `<WaitlistForm />`
7. CSS for countdown added to `landing.css`: `.countdown` flex row, `.countdown__unit` block with large number + small label, separated by `.countdown__sep` colons
8. Countdown matches the dark, glassmorphism aesthetic of the existing landing page

## File Paths
- `apps/web/app/(landing)/countdown.tsx` — NEW
- `apps/web/app/(landing)/page.tsx` — EDIT (import + render Countdown)
- `apps/web/app/(landing)/landing.css` — EDIT (add countdown styles)
