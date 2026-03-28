# Epic: wave-2b-web-imports

**Model:** sonnet
**Wave:** 2
**Group:** A (parallel with 2a)

## Description

Update all import paths in `apps/web/` to use `@lustre/hooks` instead of `@lustre/app` for shared hooks/stores, and replace `@lustre/ui` component imports with local component references. Web-specific hooks (if any, e.g., `useKeyboardShortcuts`) stay in `apps/web/hooks/`. Page files that import shared screens from `packages/app/src/screens/` are updated to import from local page components or have rendering logic inlined. Component imports from `packages/app/src/components/` and `packages/ui/src/` point to local `apps/web/components/` stubs (actual web implementations happen in F33).

## Import Changes

| Old import | New import |
|------------|------------|
| `from '@lustre/app/hooks/useFeed'` | `from '@lustre/hooks'` |
| `from '@lustre/app/stores/modeStore'` | `from '@lustre/hooks'` |
| `from '@lustre/app/screens/FeedScreen'` | inline or local page component |
| `from '@lustre/app/components/PostCard'` | `from '../../components/PostCard'` (local) |
| `from '@lustre/ui'` | `from '../../components/...'` (local) |
| `from '@lustre/ui/tokens'` | `from '@lustre/tokens'` |

## Acceptance Criteria

1. All hook imports in `apps/web/` that reference `@lustre/app/hooks/` are changed to `@lustre/hooks` for shared hooks (27 hooks)
2. All store imports in `apps/web/` that reference `@lustre/app/stores/` are changed to `@lustre/hooks` (4 stores)
3. All imports from `@lustre/ui` in `apps/web/` are replaced with local component imports or `@lustre/tokens` for token values
4. All imports from `@lustre/app/screens/` in `apps/web/` are replaced with local page components or inlined rendering
5. All imports from `@lustre/app/components/` in `apps/web/` are replaced with local `apps/web/components/` imports
6. No file in `apps/web/` contains `from '@lustre/app'` or `from '@lustre/ui'` (verified by grep)
7. `apps/web/` compiles: `next build` or `tsc --noEmit` passes
8. Token imports use `@lustre/tokens` instead of `@lustre/ui/tokens` or `@lustre/ui/src/tokens`

## File Paths

- `apps/web/app/(app)/home/page.tsx`
- `apps/web/app/(app)/discover/page.tsx`
- `apps/web/app/(app)/layout.tsx`
- `apps/web/app/(app)/components/Header.tsx`
- `apps/web/app/(app)/chat/page.tsx`
- `apps/web/app/(app)/learn/page.tsx`
- `apps/web/package.json`
- `apps/web/tsconfig.json`
