# Epic: wave-2a-call-screens-mobile

**Wave:** 2
**Model:** haiku
**Status:** NOT_STARTED

## Goal
Implement voice/video call UI for the React Native (Expo) app using the LiveKit React Native SDK. Includes incoming call screen, active call screen with controls (mute, camera toggle, end), and background blur option.

## Context

### LiveKit React Native SDK
- Package: `@livekit/react-native` (peer deps: `livekit-client`)
- Also needed: `@livekit/react-native-webrtc` (WebRTC native module)
- Hooks: `useRoom`, `useLocalParticipant`, `useRemoteParticipants`, `useParticipant`
- Components: `VideoTrack`, `AudioTrack`
- Background blur: `@livekit/react-native` supports blur via `LocalVideoTrack.setProcessor`

### App structure
- Shared screens in `packages/app/src/screens/` (e.g., ChatRoomScreen, DiscoverScreen)
- Mobile app at `apps/mobile/app/(tabs)/`
- Chat room at `apps/mobile/app/(tabs)/chat/[conversationId].tsx`
- New call screen should be a modal: `apps/mobile/app/(tabs)/chat/[conversationId]/call.tsx` OR a root modal at `apps/mobile/app/call/[callId].tsx`
- Use root modal approach: `apps/mobile/app/call/[callId].tsx` (full screen, not a tab)

### tRPC patterns
```typescript
import { trpc } from '@lustre/api'

// In component:
const acceptMutation = trpc.call.accept.useMutation()
const endMutation = trpc.call.end.useMutation()
const statusQuery = trpc.call.getStatus.useQuery({ callId }, { enabled: !!callId })
const tokenMutation = // REST call to POST /api/call/token
```

### Token fetch pattern (REST, not tRPC)
```typescript
const response = await fetch(`${API_URL}/api/call/token`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ conversationId }),
})
const { token, wsUrl } = await response.json()
```

### Auth store
- `packages/app/src/stores/authStore.ts` — `useAuthStore()` returns `{ accessToken, userId }`

### ChatRoomScreen integration
- `packages/app/src/screens/ChatRoomScreen.tsx` — add a call button that calls `trpc.call.initiate.useMutation()` and navigates to the call screen
- Use Expo Router's `router.push('/call/[callId]')` for navigation

### Shared hook
- Create `packages/app/src/hooks/useCall.ts` — manages call state, token fetch, LiveKit room connection
- This hook is used by both mobile and web call screens

## Acceptance Criteria

1. `packages/app/package.json` includes `@livekit/react-native` and `livekit-client` dependencies
2. `packages/app/src/hooks/useCall.ts` exports `useCall(callId, conversationId)` — fetches token, connects to LiveKit room, exposes `{ room, isMuted, isCameraOn, isBlurred, toggleMute, toggleCamera, toggleBlur, endCall, status }`
3. `packages/app/src/screens/CallScreen.tsx` renders full-screen call UI with: remote video/audio, local video preview, mute button, camera toggle, blur toggle, end call button, and status display (ringing/connected)
4. `apps/mobile/app/call/[callId].tsx` renders the shared `CallScreen` component as a full-screen modal
5. `packages/app/src/screens/ChatRoomScreen.tsx` has a call button (voice/video picker) that calls `call.initiate` and navigates to `/call/[callId]`
6. Incoming call detection: `useCall` polls `call.getStatus` every 2s when status is RINGING; if user is receiver and call is RINGING, the app shows accept/reject buttons
7. Background blur toggle calls `localVideoTrack.setProcessor` with the blur processor
8. End call button calls `call.end` mutation and disconnects from LiveKit room, then navigates back

## File Paths
- `packages/app/src/hooks/useCall.ts`
- `packages/app/src/screens/CallScreen.tsx`
- `apps/mobile/app/call/[callId].tsx`
- `packages/app/src/screens/ChatRoomScreen.tsx` (add call button)
- `packages/app/package.json` (add livekit deps)
