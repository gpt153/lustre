# Epic: wave-1b-hooks-package

**Model:** sonnet
**Wave:** 1
**Group:** A (sequential — after 1a)

## Description

Create `packages/hooks/` and extract all platform-agnostic hooks and Zustand stores from `packages/app/src/hooks/` and `packages/app/src/stores/`. Every hook that does NOT import `react-native`, `expo-*`, `tamagui`, or web-only APIs moves here. Platform-specific hooks (`useSwipeGesture`, `useHaptics`, `usePressAnimation`) stay in `packages/app/` (and will later move to `apps/mobile/hooks/` in Wave 2). The `useModeStore` uses a runtime `typeof window` check for localStorage which is acceptable in shared code.

## Hooks to Extract (from `packages/app/src/hooks/`)

**Move to `packages/hooks/`:** useAds, useAuth, useCall, useChat, useChatRoom, useCoach, useConsent, useDiscovery, useEducation, useEvents, useFeed, useGamification, useGatekeeper, useGroups, useHealth, useHealthCheck, useIntentions, useInvite, useKudos, useLearn, useMarketplace, useMigration, useMode, useProfile, useSafeDate, useShop, useTokenBalance

**Stay platform-specific (NOT moved):** useSwipeGesture (react-native-reanimated, gesture-handler), useHaptics (expo-haptics), usePressAnimation (react-native-reanimated)

## Stores to Extract (from `packages/app/src/stores/`)

**Move to `packages/hooks/stores/`:** authStore, modeStore, profileStore, toastStore

## Acceptance Criteria

1. `packages/hooks/package.json` exists with name `@lustre/hooks`, dependencies on `@lustre/api`, `@lustre/tokens`, `react`, `zustand`, `@tanstack/react-query`, `zod` — NO dependencies on `react-native`, `tamagui`, or `@tamagui/*`
2. `packages/hooks/src/hooks/` contains all 27 extracted hooks re-exported from `packages/hooks/src/index.ts`
3. `packages/hooks/src/stores/` contains all 4 Zustand stores (authStore, modeStore, profileStore, toastStore)
4. No file in `packages/hooks/src/` contains any import from `react-native`, `expo-*`, `@tamagui/*`, `tamagui`, or references to `window` or `document` (except `typeof window` runtime check in modeStore persistence)
5. `packages/hooks/tsconfig.json` extends root tsconfig with `compilerOptions.jsx: "react-jsx"`, `lib: ["ES2022"]`, NO `dom` in lib, NO React Native types
6. All hooks compile: `tsc --noEmit` passes for `packages/hooks/`
7. `packages/hooks/src/index.ts` exports all hooks and stores with named exports
8. The existing hooks in `packages/app/src/hooks/` are NOT deleted (they remain for backward compatibility until Wave 2 migrates imports)

## File Paths

- `packages/hooks/package.json`
- `packages/hooks/tsconfig.json`
- `packages/hooks/src/index.ts`
- `packages/hooks/src/hooks/` (directory with 27 hook files)
- `packages/hooks/src/stores/` (directory with 4 store files)
