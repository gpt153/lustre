# Epic: wave-2b-call-screens-web

**Wave:** 2
**Model:** haiku
**Status:** NOT_STARTED

## Goal
Implement voice/video call UI for the Next.js web app using the LiveKit React SDK. Mirrors mobile functionality: incoming call screen, active call screen with controls, background blur.

## Context

### LiveKit React SDK
- Package: `@livekit/components-react` (pre-built components) + `livekit-client`
- Or use lower-level hooks from `@livekit/components-react`: `useRoom`, `useTracks`, `useLocalParticipant`, `useRemoteParticipants`
- Background blur: `@livekit/track-processors` package, `BackgroundBlur()` processor
- Connect: `room.connect(wsUrl, token)`

### Web app structure
- `apps/web/app/(app)/` — authenticated app pages
- Chat: `apps/web/app/(app)/chat/[conversationId]/page.tsx`
- Add call page: `apps/web/app/(app)/call/[callId]/page.tsx`
- Full-screen overlay (not a sidebar layout)

### Shared hook
- The `useCall` hook created in wave-2a (`packages/app/src/hooks/useCall.ts`) can be reused if it doesn't use React Native specific APIs
- For web, use the same `useCall` hook with web-compatible LiveKit client (`livekit-client` works in both)
- If RN-specific, create `packages/app/src/hooks/useCallWeb.ts` as a web-only variant

### tRPC + auth patterns
- Same as mobile: `trpc.call.accept.useMutation()`, `trpc.call.end.useMutation()`, etc.
- Token fetch: `POST /api/call/token` with Bearer auth header
- Auth: `useAuthStore()` from `packages/app/src/stores/authStore.ts`

### ChatRoomScreen web integration
- `apps/web/app/(app)/chat/[conversationId]/page.tsx` — add a call button (voice/video)
- On click: call `call.initiate` mutation, then `router.push('/call/[callId]')`

### UI guidelines (follow existing Tamagui patterns)
- Use Tamagui components where appropriate (YStack, XStack, Button, Text)
- For web-only video elements, use native `<video>` with LiveKit track attachment
- Grid layout: remote video fills the screen, local video is a small PiP in bottom-right corner

## Acceptance Criteria

1. `apps/web/package.json` includes `@livekit/components-react`, `livekit-client`, and `@livekit/track-processors` dependencies
2. `apps/web/app/(app)/call/[callId]/page.tsx` exists and renders the call UI as a full-page view (no sidebar)
3. Web call page uses LiveKit `Room` to connect, displays remote participant video/audio track and local video preview (PiP)
4. Controls: mute button, camera toggle, blur toggle (using BackgroundBlur processor), end call button
5. Ringing state: if user is receiver and call status is RINGING, page shows accept/reject buttons instead of connecting
6. `apps/web/app/(app)/chat/[conversationId]/page.tsx` has a call icon button that opens voice/video picker and calls `call.initiate`
7. End call navigates back to chat: `router.push('/chat/[conversationId]')`
8. Background blur toggle uses `@livekit/track-processors` `BackgroundBlur()` processor applied to local camera track

## File Paths
- `apps/web/app/(app)/call/[callId]/page.tsx`
- `apps/web/app/(app)/chat/[conversationId]/page.tsx` (add call button)
- `apps/web/package.json` (add livekit deps)
