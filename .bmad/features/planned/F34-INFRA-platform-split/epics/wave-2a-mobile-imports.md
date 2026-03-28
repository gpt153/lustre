# Epic: wave-2a-mobile-imports

**Model:** sonnet
**Wave:** 2
**Group:** A (parallel with 2b)

## Description

Update all import paths in `apps/mobile/` to use `@lustre/hooks` instead of `@lustre/app` for shared hooks/stores, and replace `@lustre/ui` component imports with local component references. Platform-specific hooks (`useSwipeGesture`, `useHaptics`, `usePressAnimation`) move from `packages/app/src/hooks/` to `apps/mobile/hooks/`. Screen files in `apps/mobile/app/` that import from `packages/app/src/screens/` are updated to import from local screen components or have logic inlined. Component imports from `packages/app/src/components/` point to local `apps/mobile/components/` stubs (actual RN implementations happen in F32).

## Import Changes

| Old import | New import |
|------------|------------|
| `from '@lustre/app/hooks/useFeed'` | `from '@lustre/hooks'` |
| `from '@lustre/app/stores/modeStore'` | `from '@lustre/hooks'` |
| `from '@lustre/app/hooks/useSwipeGesture'` | `from '../hooks/useSwipeGesture'` (local) |
| `from '@lustre/app/hooks/useHaptics'` | `from '../hooks/useHaptics'` (local) |
| `from '@lustre/app/screens/FeedScreen'` | inline or local screen |
| `from '@lustre/app/components/PostCard'` | `from '../components/PostCard'` (local) |
| `from '@lustre/ui'` | `from '../components/...'` (local) |
| `from '@lustre/ui/tokens'` | `from '@lustre/tokens'` |

## Acceptance Criteria

1. All hook imports in `apps/mobile/` that reference `@lustre/app/hooks/` are changed to `@lustre/hooks` for shared hooks (27 hooks)
2. All store imports in `apps/mobile/` that reference `@lustre/app/stores/` are changed to `@lustre/hooks` (4 stores)
3. `apps/mobile/hooks/useSwipeGesture.ts` exists as a local copy of the platform-specific hook (moved from `packages/app/src/hooks/`)
4. `apps/mobile/hooks/useHaptics.ts` exists as a local copy (moved from `packages/app/src/hooks/`)
5. `apps/mobile/hooks/usePressAnimation.ts` exists as a local copy (moved from `packages/app/src/hooks/`)
6. All imports from `@lustre/ui` in `apps/mobile/` are replaced with local component imports or `@lustre/tokens` for token values
7. No file in `apps/mobile/` contains `from '@lustre/app'` or `from '@lustre/ui'` (verified by grep)
8. `apps/mobile/` compiles: `tsc --noEmit` passes (or build succeeds)

## File Paths

- `apps/mobile/hooks/useSwipeGesture.ts`
- `apps/mobile/hooks/useHaptics.ts`
- `apps/mobile/hooks/usePressAnimation.ts`
- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/app/(tabs)/discover.tsx`
- `apps/mobile/app/(tabs)/_layout.tsx`
- `apps/mobile/package.json`
- `apps/mobile/tsconfig.json`
