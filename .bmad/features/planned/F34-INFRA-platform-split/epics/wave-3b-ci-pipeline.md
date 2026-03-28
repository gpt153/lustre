# Epic: wave-3b-ci-pipeline

**Model:** haiku
**Wave:** 3
**Group:** A (parallel)

## Description

Set up or update the CI pipeline to enforce the new build order and run tests for all active packages. The build order must be: `packages/tokens` (no deps) → `packages/hooks` + `packages/api` (parallel, both depend on tokens) → `apps/mobile` + `apps/web` + `apps/admin` (parallel, depend on hooks/api). The test matrix runs unit tests for `packages/tokens/`, `packages/hooks/`, and `packages/api/`, followed by build verification for all apps. Deprecated packages (`packages/ui/`, `packages/app/`) are excluded from CI.

## Acceptance Criteria

1. CI workflow file (`.github/workflows/ci.yml` or equivalent) builds packages in correct order: tokens first, then hooks + api, then apps
2. CI runs `pnpm test --filter @lustre/tokens` — token snapshot tests pass
3. CI runs `pnpm test --filter @lustre/hooks` — hook unit tests pass
4. CI runs `pnpm test --filter @lustre/api` — API tests pass
5. CI runs `pnpm build --filter apps/mobile` — mobile build succeeds
6. CI runs `pnpm build --filter apps/web` — web build succeeds
7. CI does NOT build or test `packages/ui/` or `packages/app/` (deprecated)
8. CI workflow completes in under 10 minutes for the full pipeline

## File Paths

- `.github/workflows/ci.yml`
- `turbo.json`
- `package.json`
