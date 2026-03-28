# Test Spec: Wave 1 — New Shared Packages

## Scope

Verify that `packages/tokens/` and `packages/hooks/` are correctly structured, buildable, and have no forbidden dependencies.

---

## T1.1: Token Package — Snapshot Tests

**Package:** `packages/tokens/`
**Tool:** Vitest
**File:** `packages/tokens/__tests__/tokens.test.ts`

### Tests

1. **Colors snapshot** — `expect(COLORS).toMatchInlineSnapshot()` — captures all brand color hex values
2. **Spacing snapshot** — `expect(SPACING).toMatchInlineSnapshot()` — captures xs=4, sm=8, md=16, lg=24, xl=32, xxl=48
3. **Shadows snapshot** — `expect(SHADOWS).toMatchInlineSnapshot()` — captures all shadow definitions (sm, md, lg, xl)
4. **Typography snapshot** — `expect(TYPOGRAPHY).toMatchInlineSnapshot()` — captures font families, sizes, weights, line heights
5. **Radii snapshot** — `expect(RADII).toMatchInlineSnapshot()` — captures sm=4, md=8, lg=12, xl=16, full=9999
6. **Animation snapshot** — `expect(ANIMATION).toMatchInlineSnapshot()` — captures spring configs and durations
7. **Breakpoints snapshot** — `expect(BREAKPOINTS).toMatchInlineSnapshot()` — captures sm=640, md=768, lg=1024, xl=1280
8. **Themes snapshot** — `expect(THEMES).toMatchInlineSnapshot()` — captures all 4 theme variant color mappings
9. **Type safety** — `COLORS.copper satisfies string` compiles, `SPACING.md satisfies number` compiles

### Boundary Tests

10. **No Tamagui dependency** — `expect(require('packages/tokens/package.json').dependencies).not.toHaveProperty('tamagui')`
11. **No React dependency** — `expect(require('packages/tokens/package.json').dependencies).not.toHaveProperty('react')`

---

## T1.2: Hooks Package — Unit Tests

**Package:** `packages/hooks/`
**Tool:** Vitest + @testing-library/react-hooks (or renderHook from @testing-library/react)
**File:** `packages/hooks/__tests__/`

### Store Tests

1. **modeStore — default state** — `useModeStore.getState().mode === 'vanilla'`
2. **modeStore — setMode** — after `setMode('spicy')`, `getState().mode === 'spicy'`
3. **authStore — default state** — store initializes with null user/token
4. **toastStore — add/remove** — toast added then removed correctly

### Hook Tests (with mocked tRPC)

5. **useMode — returns mode** — given mocked tRPC `settings.getMode` returning `{ mode: 'vanilla' }`, `useMode()` returns `{ mode: 'vanilla', isSpicy: false }`
6. **useFeed — returns posts** — given mocked tRPC `post.feed` returning posts array, `useFeed()` returns data
7. **useProfile — returns profile** — given mocked tRPC `profile.get`, `useProfile(userId)` returns profile data
8. **useTokenBalance — returns balance** — given mocked tRPC `token.getBalance`, hook returns balance

### Boundary Tests

9. **No react-native imports** — run `grep -r "from 'react-native'" packages/hooks/src/` returns zero results
10. **No tamagui imports** — run `grep -r "from 'tamagui'" packages/hooks/src/` returns zero results
11. **No expo imports** — run `grep -r "from 'expo-" packages/hooks/src/` returns zero results

---

## T1.3: Build Verification

**Tool:** Shell commands

1. **Tokens build** — `cd packages/tokens && npx tsc --noEmit` exits 0
2. **Hooks build** — `cd packages/hooks && npx tsc --noEmit` exits 0
3. **Root build** — `pnpm build` from monorepo root exits 0
4. **Workspace discovery** — `pnpm ls --filter @lustre/hooks` shows the package
5. **Workspace discovery** — `pnpm ls --filter @lustre/tokens` shows the package
