# Epic: wave-2a-safedate-screens-mobile
**Model:** sonnet
**Wave:** 2 / Group A (parallel)

## Goal
Build the mobile SafeDate UI: activation form, active overlay with countdown timer, check-in flow, SOS button, and background GPS logging.

## Files to create/modify
- `packages/app/src/hooks/useSafeDate.ts` (CREATE)
- `packages/app/src/screens/SafeDateActivateScreen.tsx` (CREATE)
- `packages/app/src/screens/SafeDateActiveScreen.tsx` (CREATE)
- `packages/app/src/index.ts` (MODIFY — export new screens + hook)
- `apps/mobile/app/(tabs)/safedate.tsx` (CREATE)
- `apps/mobile/app/(tabs)/_layout.tsx` (MODIFY — add SafeDate tab)

## Acceptance criteria (max 10)
1. `useSafeDate` hook exposes: `activeSafeDate` (current active/checked-in SafeDate or null), `activate(input)`, `checkin(id, pin)`, `extend(id, minutes)`, `end(id)`, `logGPS(id, lat, lng, accuracy?)`, `isLoading` — all via tRPC
2. `SafeDateActivateScreen`: form with fields for targetDescription (TextInput), durationMinutes (picker: 30/60/90/120/240/480 min), PIN (numeric 4-8 digits), safety contacts (add/remove list with name + phone), submit button. Calls `trpc.safedate.activate`. On success navigates to SafeDateActiveScreen (or replaces tab).
3. `SafeDateActiveScreen`: shows countdown timer (minutes:seconds remaining), current status badge (ACTIVE/CHECKED_IN/ESCALATED), check-in button (prompts PIN entry), extend button (+30 min), end SafeDate button, SOS button (immediately calls `end()` then shows emergency message). All in Tamagui components.
4. GPS polling: `SafeDateActiveScreen` uses `expo-location` (`import * as Location from 'expo-location'`) to poll GPS every 8 seconds while SafeDate is ACTIVE or CHECKED_IN. On each poll, calls `trpc.safedate.logGPS`. Requests `Location.requestForegroundPermissionsAsync()` on mount.
5. Check-in flow: modal with PIN input → calls `safedate.checkin` → resets countdown, shows success toast.
6. SOS button is red/prominent — immediately escalates (calls `safedate.end` then shows "Hjälp är på väg" message with instruction to call 112).
7. Mobile tab: `apps/mobile/app/(tabs)/safedate.tsx` renders `SafeDateActivateScreen` or `SafeDateActiveScreen` depending on whether there is an active SafeDate (use `activeSafeDate` from hook).
8. Tab added to `_layout.tsx` with name "SafeDate" using a shield icon (use `Ionicons` or `Shield` icon if available, or just text label).
9. All text in Swedish where user-facing (button labels, placeholder text, section headers).
10. No token deduction anywhere in these screens.

## Codebase context
- Tamagui components: `YStack, XStack, Text, Button, Input, Label, H2, Spinner, ScrollView` from `'tamagui'`
- tRPC: `import { trpc } from '@lustre/api'` — use `.useQuery()` and `.useMutation()`
- React: `useState, useEffect, useCallback, useRef` from `'react'`
- Expo Router navigation: `import { useRouter } from 'expo-router'`
- Expo location: `import * as Location from 'expo-location'` (expo-location is in expo SDK, no extra install needed)
- Tab layout: `<Tabs.Screen name="safedate" options={{ title: 'SafeDate' }} />` — add before the `chat` tab entry
- useSafeDate pattern: look at `packages/app/src/hooks/useGatekeeper.ts` for mutation hook patterns (use `trpc.safedate.*`)
- Read existing hook and screen files before writing to follow exact patterns

## Notes
- Keep screens relatively simple — no complex animations needed
- The countdown timer: use `setInterval` in useEffect to tick every second
- Background GPS in foreground mode (expo-location foreground) is sufficient for MVP
