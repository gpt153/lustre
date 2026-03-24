# Epic: wave-3a-profile-screens-mobile
**Model:** haiku
**Wave:** 3, Group A (parallel)

## Description
Build mobile profile screens: onboarding wizard (5 steps), profile view, profile edit, and photo gallery.

## Acceptance Criteria
1. Onboarding wizard with 5 steps: (1) Display name + age, (2) Gender + orientation, (3) Content preference + relationship type, (4) Photo upload (min 1), (5) Bio + seeking. Each step validates before proceeding.
2. Profile view screen showing: display name, age, gender, orientation, bio, photo gallery, verification badge, kink tags (if in spicy mode)
3. Profile edit screen with all editable fields and save functionality
4. Photo gallery component with horizontal scroll, tap to enlarge, and reorder via drag
5. Onboarding flow calls `profile.create` on completion
6. Edit flow calls `profile.update` on save
7. Profile screen accessible from tab bar (already has profile.tsx tab)
8. Navigation: onboarding shown after auth if no profile exists, otherwise show main tabs

## File Paths
1. `apps/mobile/app/(auth)/onboarding/` — directory with step screens
2. `packages/app/src/screens/ProfileViewScreen.tsx` — shared profile view
3. `packages/app/src/screens/ProfileEditScreen.tsx` — shared profile edit
4. `packages/app/src/components/PhotoGallery.tsx` — shared photo gallery component
5. `packages/app/src/stores/profileStore.ts` — Zustand store for profile state
6. `packages/app/src/hooks/useProfile.ts` — tRPC hooks for profile data
7. `apps/mobile/app/(tabs)/profile.tsx` — update to use ProfileViewScreen
8. `apps/mobile/app/(auth)/_layout.tsx` — update to include onboarding route

## Context
- Expo Router file-based routing in apps/mobile/app/
- (auth) group for unauthenticated/setup flows, (tabs) for main app
- Use Tamagui components from packages/ui
- Shared screens go in packages/app/src/screens/ for Solito cross-platform
- Auth store in packages/app/src/stores/authStore.ts — follow same pattern for profile store
- tRPC client setup in packages/api/src/trpc-client.ts
