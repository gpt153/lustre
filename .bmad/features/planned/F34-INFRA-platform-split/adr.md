# ADR: Platform Split & Shared Infrastructure

## Status

Proposed

## Date

2026-03-27

## Context

Lustre currently uses a cross-platform architecture with Tamagui (shared UI components in `packages/ui/`) and Solito (shared screens/hooks in `packages/app/`). The decision to split into platform-native apps (F32: Expo/RN mobile, F33: Next.js web) requires reorganizing shared code. We need to decide:

1. What code remains shared vs. becomes platform-specific
2. How to structure the new shared packages
3. How to handle the migration incrementally
4. How to gate platform-specific API behavior

## Decisions

### D1: Package Structure — Two New Shared Packages

**Decision:** Create `packages/tokens/` (extend existing) and `packages/hooks/` (new). Do NOT create a `packages/utils/` or `packages/shared/` catch-all.

**Rationale:** A strict two-package model enforces clean separation:
- `packages/tokens/` = data (values, no logic, no React)
- `packages/hooks/` = behavior (React hooks, stores, NO UI)

A catch-all package would re-create the same coupling problem that `packages/app/` has.

**Alternatives considered:**
- Single `packages/shared/` package — rejected because it would become another dumping ground
- Keep `packages/app/` but remove UI — rejected because the package name implies UI ownership

### D2: Token Format — TypeScript `as const` Objects

**Decision:** Design tokens are exported as TypeScript `as const` objects with full type inference. Not JSON, not CSS custom properties, not a build-time token pipeline (Style Dictionary, etc.).

**Rationale:**
- `as const` gives exact literal types (`'#B87333'` not `string`)
- Both platforms can tree-shake unused tokens
- No build step needed — direct import
- The existing `packages/tokens/` already uses this pattern (colors, spacing, shadows)
- JSON would require a loader/transformer; CSS custom properties don't work in React Native StyleSheet

**What goes in `packages/tokens/`:**
- Colors (brand palette + mode color sets: vanilla light/dark, spicy light/dark)
- Spacing scale (xs=4, sm=8, md=16, lg=24, xl=32, xxl=48)
- Typography (font families as strings, size/weight/lineHeight scales as number maps)
- Border radii (sm=4, md=8, lg=12, xl=16, full=9999)
- Shadows (cross-platform objects with iOS + Android + CSS properties)
- Animation timing (spring configs as `{ damping, stiffness, mass }`, durations in ms)
- Breakpoints (sm=640, md=768, lg=1024, xl=1280)
- Theme variant color mappings (without Tamagui `createTheme`)

### D3: Hook Extraction Criteria — No Platform Imports

**Decision:** A hook belongs in `packages/hooks/` if and only if it has NO imports from:
- `react-native` or any `@react-native/*` package
- `expo-*` packages
- `tamagui` or `@tamagui/*`
- Web-specific globals (`window`, `document`, `navigator`)

**Hooks that STAY platform-specific:**
- `useSwipeGesture` (uses `react-native-reanimated`, `react-native-gesture-handler`) → `apps/mobile/hooks/`
- `useHaptics` (uses `expo-haptics`) → `apps/mobile/hooks/`
- `usePressAnimation` (uses `react-native-reanimated`) → `apps/mobile/hooks/`

**Hooks that move to `packages/hooks/`:**
- All TanStack Query hooks (useFeed, useMatches, useDiscovery, useProfile, useChat, etc.)
- All Zustand stores (useModeStore, useAuthStore, useToastStore)
- useMode, useAuth, useTokenBalance, useDebounce, useHealth

**Edge case — `useModeStore`:** Currently uses `typeof window !== 'undefined'` for localStorage detection. This is acceptable in `packages/hooks/` because it's a runtime check, not a build-time import. The hook works on both platforms.

### D4: Platform Header Design — `X-Lustre-Platform`

**Decision:** Mobile and web apps include an `X-Lustre-Platform` header on every tRPC/REST request. Values: `mobile`, `web`, `admin`. The API uses this for content gating, NOT for different response shapes.

**Implementation:**
- Mobile: Set in tRPC client link headers (`packages/api/` or `apps/mobile/` tRPC config)
- Web: Set in tRPC client link headers
- API: Fastify `onRequest` hook extracts header, sets `request.platform`

**Gating rules:**
| Feature | mobile | web | admin |
|---------|--------|-----|-------|
| ConsentVault playback | Yes | No | View-only |
| SafeDate GPS tracking | Yes | No | No |
| Spicy NSFW (MEDIUM/HIGH nudity) | Yes | Gated (age-verify interstitial) | View-only |

**Why header, not user-agent parsing:** User-agent is unreliable and can be spoofed. An explicit header is a contract between client and server.

### D5: Deprecation Strategy — Mark, Remove from Pipeline, Delete Later

**Decision:** Three-phase deprecation:
1. **Mark:** Add `"deprecated": "Replaced by @lustre/tokens and @lustre/hooks. See F34."` to `package.json`
2. **Remove from pipeline:** Remove `packages/ui/` and `packages/app/` from Turborepo `pipeline` by adding them to `turbo.json` ignorePatterns or removing workspace references
3. **Delete:** After F32 and F33 are complete and both apps build without deprecated packages, delete the directories

**Rationale:** Keeping deprecated packages as read-only reference during F32/F33 development reduces risk. Teams can see original implementations while building replacements.

### D6: Build Order

**Decision:** Turborepo build order enforced via `dependsOn`:

```
packages/tokens  (no deps)
       ↓
packages/hooks   (depends on: tokens, api)
packages/api     (no deps)
       ↓
apps/mobile      (depends on: hooks, api, tokens)
apps/web         (depends on: hooks, api, tokens)
apps/admin       (depends on: api)
```

### D7: TypeScript Configuration

**Decision:** Each package gets a strict tsconfig that only includes the types it needs:

- `packages/tokens/tsconfig.json` — `lib: ["ES2022"]`, NO React, NO DOM, NO React Native
- `packages/hooks/tsconfig.json` — `lib: ["ES2022"]`, `jsx: "react-jsx"`, NO DOM, NO React Native types
- `apps/mobile/tsconfig.json` — inherits from Expo's base, adds React Native types
- `apps/web/tsconfig.json` — inherits from Next.js base, adds DOM types

This catches cross-platform imports at compile time.

## Consequences

- **Positive:** Platform-specific apps can diverge freely without shared UI constraints
- **Positive:** Build times improve once Tamagui transpilation is removed from the pipeline
- **Positive:** Clear ownership: each app owns its entire UI layer
- **Negative:** Some code duplication between apps (e.g., similar button components) — acceptable, these diverge quickly anyway
- **Negative:** Migration effort across ~30 hooks, ~55 screens, ~28 components — mitigated by incremental wave approach
