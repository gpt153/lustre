# PRD: Platform Split & Shared Infrastructure

## Overview

Refactor the Lustre monorepo from a cross-platform Tamagui/Solito architecture (shared UI via `packages/ui/` and `packages/app/`) to a platform-independent architecture where each app owns its own UI layer and shares only business logic, design tokens, and API types. This unblocks F32 (native mobile) and F33 (web app) to build platform-optimized experiences without cross-platform compromises.

## Target Audience

Internal — engineering team. No user-facing changes.

## Problem Statement

The current architecture shares UI components (`packages/ui/`) and screens (`packages/app/`) across mobile and web using Tamagui and Solito. This creates several problems:

1. **Lowest-common-denominator UI** — components must work on both platforms, preventing platform-native interactions (gestures, hover, keyboard shortcuts)
2. **Build complexity** — Tamagui requires transpilation plugins in both Metro and Next.js, causing build issues and slow compilation
3. **Import coupling** — `packages/app/` mixes platform-agnostic business logic (Zustand stores, TanStack Query hooks) with platform-specific UI (screens, components), making extraction difficult
4. **Blocked platform optimization** — F32 and F33 cannot fully own their UI layer while `packages/ui/` and `packages/app/` exist as shared dependencies

## Functional Requirements (FR)

### FR-1: Design Token Package (`packages/tokens/`)
- Priority: Must
- Acceptance criteria:
  - Given the existing `packages/tokens/` package, when extended, then it contains ALL design token values currently in `packages/ui/src/tokens.ts` plus typography, border radius, animation timing, breakpoints, and theme color mappings
  - Given `packages/tokens/`, then it has ZERO dependencies on Tamagui, React Native, or any UI framework

### FR-2: Shared Hooks Package (`packages/hooks/`)
- Priority: Must
- Acceptance criteria:
  - Given `packages/hooks/`, then it contains all platform-agnostic hooks and stores extracted from `packages/app/src/hooks/` and `packages/app/src/stores/`
  - Given any hook in `packages/hooks/`, then it has NO imports from `react-native`, Tamagui, or web-specific APIs (`window`, `document`)
  - Given both apps, when importing shared hooks, then they import from `@lustre/hooks` instead of `@lustre/app`

### FR-3: Import Migration
- Priority: Must
- Acceptance criteria:
  - Given `apps/mobile/`, then NO import paths reference `packages/ui/` or `packages/app/`
  - Given `apps/web/`, then NO import paths reference `packages/ui/` or `packages/app/`
  - Given both apps, when built, then `pnpm build` succeeds from the monorepo root

### FR-4: Platform Detection Middleware
- Priority: Must
- Acceptance criteria:
  - Given an API request, when it includes `X-Lustre-Platform: mobile|web|admin`, then the API can gate responses based on platform
  - Given a web request for mobile-only content (ConsentVault, SafeDate GPS, spicy NSFW media), then the API returns appropriate gated responses

### FR-5: Package Deprecation
- Priority: Must
- Acceptance criteria:
  - Given `packages/ui/` and `packages/app/`, then they are marked deprecated in `package.json` and removed from the Turborepo build pipeline
  - Given any app in the monorepo, then no active import path references the deprecated packages

## Non-Functional Requirements (NFR)

- **Zero downtime:** Both apps remain functional at every migration step (incremental, not big-bang)
- **Build integrity:** `pnpm build` passes from root after every wave
- **Test integrity:** `pnpm test` passes from root after every wave
- **No new dependencies:** No new runtime dependencies added (Zustand, TanStack Query, Zod already in use)
- **Type safety:** All path aliases and package references resolve correctly in TypeScript

## Success Criteria

1. `packages/tokens/` exports all design tokens as pure TS — verified by snapshot tests
2. `packages/hooks/` exports all shared hooks — verified by unit tests with mocked tRPC
3. `apps/mobile/` builds with zero imports from `@lustre/ui` or `@lustre/app`
4. `apps/web/` builds with zero imports from `@lustre/ui` or `@lustre/app`
5. `pnpm build` succeeds from monorepo root
6. `pnpm test` succeeds from monorepo root
7. `packages/ui/` and `packages/app/` are not in the Turborepo build pipeline
8. API returns `X-Lustre-Platform` in request context for downstream handlers

## MVP Scope

All FRs are MVP. This is a prerequisite for F32 and F33.

## Risks and Dependencies

- **Risk:** Import migration may break screens that have deep coupling to Tamagui components — mitigated by incremental migration per screen
- **Risk:** Some hooks in `packages/app/src/hooks/` use `react-native` APIs (e.g., `useHaptics`, `useSwipeGesture`) — these stay in `apps/mobile/hooks/`, NOT in `packages/hooks/`
- **Dependency:** F32 and F33 depend on this feature completing before they can fully build platform-specific UIs
- **Dependency:** `packages/tokens/` already partially exists (colors, spacing, shadows) — this feature extends it with typography, radii, animation, breakpoints, and themes
