# Epic: wave-2a-coach-screens-mobile
**Model:** haiku
**Wave:** 2 — Group A (parallel)

## Goal
Build mobile coach screens: session start (persona + mode select), active session UI with LiveKit voice, session history list.

## Context
- Expo Router at `apps/mobile/app/(tabs)/`
- Shared screens in `packages/app/src/screens/`
- Shared hooks in `packages/app/src/hooks/`
- tRPC client usage pattern: `trpc.coach.create.useMutation()`, `trpc.coach.list.useQuery()` etc.
- Auth store: `packages/app/src/stores/authStore.ts` — `useAuthStore()` gives `{ token }`
- API client pattern: see `packages/app/src/hooks/useCall.ts` for LiveKit integration example
- Existing CallScreen at `packages/app/src/screens/CallScreen.tsx` for UI patterns
- Tamagui components: `YStack, XStack, Text, Button, ScrollView` from `tamagui`
- POST /api/coach/token returns `{ token, wsUrl, roomName }`

## File Paths to Create/Modify
1. `packages/app/src/screens/CoachStartScreen.tsx` — new screen
2. `packages/app/src/screens/CoachSessionScreen.tsx` — new screen
3. `packages/app/src/screens/CoachHistoryScreen.tsx` — new screen
4. `packages/app/src/hooks/useCoach.ts` — new hook
5. `apps/mobile/app/(tabs)/coach/index.tsx` — history/entry tab
6. `apps/mobile/app/(tabs)/coach/start.tsx` — start screen route
7. `apps/mobile/app/(tabs)/coach/session.tsx` — active session route
8. `packages/app/src/index.ts` — export new screens and hook

## useCoach Hook
```typescript
// useCoach.ts
// Returns: { sessions, isLoading, createSession, startSession, endSession }
// createSession(persona, mode) → calls POST /api/coach/token then trpc.coach.create
// startSession(sessionId) → calls trpc.coach.start
// endSession(sessionId, durationSecs) → calls trpc.coach.end
// sessions from trpc.coach.list.useQuery()
```

## CoachStartScreen
- Props: `{ onStartSession: (sessionId: string, token: string, wsUrl: string, roomName: string, mode: 'voice'|'text') => void }`
- Shows two persona cards: "Axel" (coach) and "Sophia" (practice partner)
- Shows two mode buttons: "Röst" (voice) and "Text"
- Start button → calls `/api/coach/token` with selected mode, then `trpc.coach.create`, then calls `onStartSession`

## CoachSessionScreen
- Props: `{ sessionId: string, token: string, wsUrl: string, roomName: string, mode: 'voice'|'text', onEnd: () => void }`
- For voice mode: shows active session UI (timer, mute button, end button)
- For text mode: shows simple chat input + message list (polls `trpc.coach.get` for messages — simplified)
- End button → calls `useCoach.endSession(sessionId, elapsed)` then `onEnd()`
- Timer counts up from 00:00

## CoachHistoryScreen
- Shows list of past sessions from `trpc.coach.list`
- Each item: persona name, mode, duration, date, tokens debited
- Tapping "New Session" navigates to CoachStartScreen

## Acceptance Criteria
1. `CoachStartScreen` renders persona cards for COACH and PARTNER and mode buttons for VOICE and TEXT
2. `CoachStartScreen` calls POST /api/coach/token (with Bearer auth header) before creating session
3. `CoachSessionScreen` shows a running timer (useEffect with setInterval)
4. `CoachSessionScreen` end button calls `trpc.coach.end.mutate` with elapsed seconds
5. `CoachHistoryScreen` renders sessions list from `trpc.coach.list.useQuery()`
6. `useCoach.ts` exports `useCoach()` hook with all required functions
7. Mobile tab `apps/mobile/app/(tabs)/coach/index.tsx` renders `CoachHistoryScreen`
8. `packages/app/src/index.ts` exports `CoachStartScreen`, `CoachSessionScreen`, `CoachHistoryScreen`, `useCoach`
9. No TODO comments, all imports resolve correctly using existing patterns
