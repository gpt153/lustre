# Epic: wave-2a-spicy-screens-mobile

**Wave:** 2 — Group A (parallel with wave-2b)
**Model:** haiku
**Estimate:** medium

## Goal
Mobile screens for spicy modules: a locked/unlocked spicy section in the Learn tab, module detail, lesson view with 18+ badge, and a spicy mode toggle in profile settings.

## Context
- Existing screens in `packages/app/src/screens/`: `LearnModuleListScreen.tsx`, `LearnModuleDetailScreen.tsx`, `LearnLessonScreen.tsx`
- Existing hook: `packages/app/src/hooks/useLearn.ts`
- Mobile routes at `apps/mobile/app/(tabs)/learn/` — index, `[moduleId]/index.tsx`, `[moduleId]/lesson/[lessonId].tsx`
- Profile settings mobile: `apps/mobile/app/(tabs)/profile/` directory
- Tamagui is the UI library — use `YStack`, `XStack`, `Text`, `Button`, `Card`, `Separator` etc.
- `trpc.profile.toggleSpicyMode` is the mutation (added in wave-1a)
- `trpc.module.list` now returns `isSpicy` on each module object
- The existing `LearnModuleListScreen` shows all modules — split into vanilla section + spicy section
- Spicy section shows locked UI (lock icon + explanation) when spicyModeEnabled=false or vanilla level <6

## Acceptance Criteria

1. `LearnModuleListScreen.tsx` shows a "Spicy Modules 🌶️" section below vanilla modules; when spicy is locked it renders a `SpicyGateBanner` explaining requirements (vanilla level 6 + Spicy mode)
2. `SpicyGateBanner` is a new component in `packages/app/src/components/SpicyGateBanner.tsx` with a "18+" badge, lock icon, requirement text, and a CTA button that navigates to profile spicy toggle
3. When spicy is unlocked, spicy modules render exactly like vanilla modules but with a red "🌶️ 18+" tag on each card
4. `LearnLessonScreen.tsx` shows a red "18+" pill badge in the header when the lesson belongs to a spicy module (use `module.isSpicy` from `useLearnModule` hook)
5. `useLearn.ts` hook exposes `spicyModules` (filtered array of isSpicy=true modules) and `vanillaModules` (isSpicy=false) separately
6. New file `apps/mobile/app/(tabs)/profile/spicy-settings.tsx` renders a toggle card: title "Spicy Mode", subtitle "Access adult coaching modules (18+)", a Switch component bound to `profile.spicyModeEnabled`, calls `toggleSpicyMode` on change
7. `useLearn.ts` adds `toggleSpicyMode(enabled: boolean)` wrapping `trpc.profile.toggleSpicyMode.useMutation()` with query invalidation on success

## File Paths

- `packages/app/src/screens/LearnModuleListScreen.tsx`
- `packages/app/src/screens/LearnLessonScreen.tsx`
- `packages/app/src/hooks/useLearn.ts`
- `packages/app/src/components/SpicyGateBanner.tsx`
- `apps/mobile/app/(tabs)/profile/spicy-settings.tsx`
