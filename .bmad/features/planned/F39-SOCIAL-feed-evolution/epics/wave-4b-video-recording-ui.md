# Epic: wave-4b-video-recording-ui

**Model:** sonnet
**Wave:** 4
**Group:** A (sequential — after 4a)

## Description

In-app camera for recording 15-60 second shorts. Front/back camera toggle, flash, timer, preview before posting.

## Acceptance Criteria

1. Camera screen accessible from post creation flow (FAB → "Spela in Short")
2. Uses `expo-camera` for camera access + `expo-av` for recording
3. UI elements:
   - Record button (hold to record, release to stop — or tap to start, tap to stop)
   - Timer showing elapsed time (min 15s enforced, max 60s auto-stop)
   - Front/back camera toggle button
   - Flash toggle (auto/on/off)
   - Cancel button (discard recording)
4. Preview screen after recording:
   - Plays recorded video in loop
   - "Använd" (proceed to post creation) or "Spela in igen" (discard and re-record)
   - Trim start/end (basic slider, optional — Could priority)
5. After "Använd": navigates to post creation flow with video attached
   - Type auto-set to MOMENT (shorts are moments with video)
   - Spicy level selection
   - Caption input
   - Upload with progress bar
6. Camera permissions handled gracefully (request on first use, show settings prompt if denied)
7. Recording stored temporarily in app cache, deleted after upload completes

## File Paths

- `packages/app/src/screens/VideoRecordScreen.tsx` (new)
- `packages/app/src/hooks/useVideoRecorder.ts` (new)
- `packages/app/src/components/RecordButton.tsx` (new)
- `apps/mobile/app/(tabs)/create/record.tsx` (new route)
