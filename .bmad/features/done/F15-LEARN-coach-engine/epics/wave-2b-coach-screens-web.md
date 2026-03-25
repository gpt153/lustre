# Epic: wave-2b-coach-screens-web
**Model:** haiku
**Wave:** 2 — Group A (parallel with wave-2a)

## Goal
Build web coach screens at `/coach` (history), `/coach/start` (persona+mode select), `/coach/session` (active session) using Next.js App Router patterns.

## Context
- Next.js app at `apps/web/app/(app)/`
- Existing page patterns: `apps/web/app/(app)/home/page.tsx`, `apps/web/app/(app)/groups/page.tsx`
- tRPC usage in web: `trpc` client from `packages/api/`
- Tamagui works on web too — but web pages may also use standard React components
- Auth token: from auth store or cookie
- POST /api/coach/token endpoint at `services/api`

## File Paths to Create/Modify
1. `apps/web/app/(app)/coach/page.tsx` — history/entry page
2. `apps/web/app/(app)/coach/start/page.tsx` — start session page
3. `apps/web/app/(app)/coach/session/page.tsx` — active session page

## Web Pages

### /coach (history page)
- Lists past sessions from `trpc.coach.list`
- "New Session" button → navigates to /coach/start
- Shows: persona, mode, duration, date, tokens debited per session row

### /coach/start
- Two persona cards: Axel (coach) and Sophia (partner)
- Two mode buttons: Voice and Text
- Start button → POST /api/coach/token, then trpc.coach.create.mutate, then redirect to /coach/session?sessionId=...&token=...&wsUrl=...&roomName=...&mode=...

### /coach/session
- Reads params from URL query params: sessionId, token, wsUrl, roomName, mode
- For voice mode: shows timer + End button
- For text mode: shows text input + response area
- End button → trpc.coach.end.mutate, redirect to /coach

## Acceptance Criteria
1. `/coach` page renders sessions list with "New Session" button
2. `/coach/start` renders persona selection (Axel / Sophia) and mode selection (Voice / Text)
3. `/coach/start` fetches token from POST /api/coach/token with Bearer auth header before creating session
4. `/coach/session` reads sessionId from URL query params and shows active session UI
5. `/coach/session` has a timer (useState + useEffect setInterval) counting up
6. `/coach/session` End button calls trpc.coach.end.mutate with elapsed seconds then redirects to /coach
7. No TODO comments, all imports use existing patterns from the web app
8. Pages use `'use client'` directive where needed for interactivity
