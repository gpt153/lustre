# Epic: wave-3a-consent-mobile
**Model:** sonnet
**Wave:** 3
**Group:** A (parallel)

## Goal
Build ConsentVault mobile screens: proximity detection, consent capture UI, recording controls, DRM video player, recording gallery, revoke/delete controls.

## Acceptance Criteria
1. `packages/app/src/screens/ConsentVaultScreen.tsx` — main screen: recording gallery (list of recordings with status), button to start new consent session
2. `packages/app/src/screens/ConsentInitiateScreen.tsx` — initiator side: Bluetooth proximity scan UI, GPS capture, "Send Consent Request" button calling `consent.initiate`
3. `packages/app/src/screens/ConsentConfirmScreen.tsx` — participant side: shows incoming consent request, GPS capture, "Confirm" button calling `consent.confirm`
4. `packages/app/src/screens/ConsentRecordingScreen.tsx` — active recording screen: timer, stop button, calls `consent.getUploadUrl` then `consent.confirmUpload`
5. `packages/app/src/screens/ConsentPlaybackScreen.tsx` — DRM player using `expo-av` Video component with license token from `consent.getPlaybackToken`, no download controls visible
6. `packages/app/src/screens/ConsentRecordingDetailScreen.tsx` — shows recording details with revoke/delete buttons calling `consent.revoke` / `consent.delete`
7. `packages/app/src/hooks/useConsent.ts` — tRPC hooks: `useGetRecordings`, `useInitiateConsent`, `useConfirmConsent`, `useRevokeRecording`, `useDeleteRecording`
8. Mobile app: `apps/mobile/app/(tabs)/consent/` directory with `index.tsx` (ConsentVaultScreen), `initiate.tsx`, `confirm.tsx`, `recording.tsx`, `playback.tsx`
9. Bluetooth proximity: uses `expo-bluetooth` or `react-native-ble-plx` — scan for nearby device, display proximity indicator
10. All screens use Tamagui components (YStack, XStack, Text, Button, Sheet)

## File Paths
- `packages/app/src/screens/ConsentVaultScreen.tsx`
- `packages/app/src/screens/ConsentInitiateScreen.tsx`
- `packages/app/src/screens/ConsentConfirmScreen.tsx`
- `packages/app/src/screens/ConsentRecordingScreen.tsx`
- `packages/app/src/screens/ConsentPlaybackScreen.tsx`
- `packages/app/src/screens/ConsentRecordingDetailScreen.tsx`
- `packages/app/src/hooks/useConsent.ts`
- `apps/mobile/app/(tabs)/consent/index.tsx`
- `apps/mobile/app/(tabs)/consent/initiate.tsx`
- `apps/mobile/app/(tabs)/consent/confirm.tsx`

## Codebase Context
- tRPC client usage: `import { trpc } from '@/utils/trpc'` and `trpc.consent.getRecordings.useQuery()`
- Tamagui: `import { YStack, XStack, Text, Button } from 'tamagui'`
- Expo Router: file-based routing in `apps/mobile/app/(tabs)/`
- See `packages/app/src/screens/` for existing screen patterns
- Auth store: `import { useAuthStore } from '@/stores/authStore'`
- For BLE: use `react-native-ble-plx` (check if already in package.json first)
- GPS: use `expo-location` for coordinates
