# Epic: wave-2b-safety-contact-view
**Model:** haiku
**Wave:** 2 / Group A (parallel)

## Goal
Build the web page that safety contacts open from the SMS link to see the user's live GPS location and escalation status.

## Files to create
- `apps/web/app/safe/[shareToken]/page.tsx` (CREATE)

## Acceptance criteria (max 10)
1. Page at `/safe/[shareToken]` — Next.js app router page, `'use client'`
2. Calls `trpc.safedate.getLiveLocation.useQuery({ shareToken })` with 15-second polling (`refetchInterval: 15000`)
3. Shows user's current SafeDate status with color coding: ACTIVE (green), CHECKED_IN (blue), ESCALATED (red/orange), COMPLETED (gray)
4. Shows timestamp of last GPS update ("Senaste position: X minuter sedan")
5. Shows escalation time if status is ESCALATED ("Eskalerades kl HH:MM")
6. Displays GPS coordinates as plain text (lat, lng) with a Google Maps link (`https://maps.google.com/?q={lat},{lng}`) — simple link, no embedded map needed
7. Shows all GPS points as a list (last 10, newest first) with recordedAt time
8. If status is COMPLETED, shows "SafeDate avslutad" and no GPS data
9. If shareToken not found (query error), shows "Ogiltig länk"
10. Page is fully in Swedish, no auth required, works without login

## Codebase context
- Next.js app router, `'use client'` at top
- Tamagui: `YStack, XStack, Text, H2, Spinner, ScrollView` from `'tamagui'`
- tRPC: `import { trpc } from '@lustre/api'`
- Pattern: see `apps/web/app/(app)/profile/page.tsx` for typical page structure
- This page is OUTSIDE the `(app)` layout group — it should be accessible without login
- Path: `apps/web/app/safe/[shareToken]/page.tsx` (create the `safe` directory)
- Keep the page simple and functional — this is a safety-critical page
- All text in Swedish
