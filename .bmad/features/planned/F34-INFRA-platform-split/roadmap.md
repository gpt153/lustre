# Roadmap: F34-INFRA-platform-split

**Status:** PLANNED
**Created:** 2026-03-27
**Waves:** 3
**Total epics:** 9
**Estimated duration:** 3 weeks

---

## Wave 1: New Shared Packages (week 1)

Create the new shared packages and extract content into them. After this wave, `packages/tokens/` and `packages/hooks/` exist as buildable, testable packages — but apps still import from old locations.

**Status:** NOT STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-tokens-package (haiku) — Extend `packages/tokens/` with typography, border radii, animation timing, breakpoints, and theme color mappings. All pure TS constants.
- wave-1b-hooks-package (sonnet) — Create `packages/hooks/` with shared Zustand stores and TanStack Query hooks extracted from `packages/app/src/`. Ensure zero platform-specific imports.
- wave-1c-turborepo-config (haiku) — Update Turborepo + TypeScript configs for new package structure. Add workspace entries, update build deps, configure path aliases.

### Testgate Wave 1:
- [ ] `packages/tokens/` builds with `tsc --noEmit` — no errors
- [ ] `packages/tokens/` snapshot tests pass for all token values
- [ ] `packages/hooks/` builds with `tsc --noEmit` — no errors
- [ ] `packages/hooks/` has no imports from `react-native`, `tamagui`, `window`, or `document`
- [ ] `pnpm build` succeeds from monorepo root (both old and new packages coexist)

---

## Wave 2: Import Migration (week 2)

Rewire imports in both apps to use new packages. Add platform detection to the API. After this wave, apps import from `@lustre/hooks` and `@lustre/tokens` instead of `@lustre/app` and `@lustre/ui`.

**Status:** NOT STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-mobile-imports (sonnet) — Update all `apps/mobile/` imports from `@lustre/app` → `@lustre/hooks`, from `@lustre/ui` → local components. Platform-specific hooks stay in `apps/mobile/hooks/`.
- wave-2b-web-imports (sonnet) — Update all `apps/web/` imports from `@lustre/app` → `@lustre/hooks`, from `@lustre/ui` → local components. Web-specific hooks stay in `apps/web/hooks/`.

**Group B (parallel with A):**
- wave-2c-platform-middleware (haiku) — Add `X-Lustre-Platform` header to tRPC clients. Add Fastify middleware to extract platform. Gate ConsentVault/SafeDate/spicy content by platform.

### Testgate Wave 2:
- [ ] `apps/mobile/` builds with zero imports from `@lustre/app` or `@lustre/ui`
- [ ] `apps/web/` builds with zero imports from `@lustre/app` or `@lustre/ui`
- [ ] API correctly reads `X-Lustre-Platform` header and gates content
- [ ] `pnpm build` succeeds from monorepo root
- [ ] `pnpm test` succeeds from monorepo root

---

## Wave 3: Cleanup & Verification (week 3)

Deprecate old packages, set up CI pipeline, update documentation.

**Status:** NOT STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-deprecate-packages (haiku) — Mark `packages/ui/` and `packages/app/` as deprecated. Remove from Turborepo pipeline. Verify no imports remain.
- wave-3b-ci-pipeline (haiku) — CI pipeline with correct build order: tokens → hooks → api → mobile → web. Test matrix for all packages.
- wave-3c-documentation (haiku) — Update root README, CLAUDE.md, and BMAD status files.

### Testgate Wave 3:
- [ ] `packages/ui/` and `packages/app/` are not built by `turbo build`
- [ ] No file in `apps/` imports from `@lustre/ui` or `@lustre/app`
- [ ] CI pipeline runs: tokens → hooks → api → mobile → web
- [ ] `pnpm build` and `pnpm test` succeed from root
- [ ] README and CLAUDE.md reflect the new architecture
