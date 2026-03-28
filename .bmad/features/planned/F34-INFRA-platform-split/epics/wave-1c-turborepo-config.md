# Epic: wave-1c-turborepo-config

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — after 1b)

## Description

Update Turborepo, pnpm workspace, and TypeScript configurations to include the new `packages/tokens/` (already in workspace) and `packages/hooks/` packages. Configure build dependencies so the build order is: tokens → hooks/api (parallel) → apps. Update path aliases so apps can import `@lustre/hooks` and `@lustre/tokens`. The existing workspace config already includes `packages/*` as a glob, so `packages/hooks/` will be auto-discovered — but explicit dependency declarations and path aliases need setup.

## Acceptance Criteria

1. `pnpm-workspace.yaml` already includes `packages/*` — verify `packages/hooks/` is discovered by running `pnpm ls --filter @lustre/hooks`
2. `turbo.json` tasks.build.dependsOn includes `^build` (already present) — verify that `packages/tokens/` builds before `packages/hooks/` via the dependency chain in `packages/hooks/package.json`
3. `packages/hooks/package.json` declares `@lustre/api` and `@lustre/tokens` as dependencies (workspace protocol: `"@lustre/api": "workspace:*"`, `"@lustre/tokens": "workspace:*"`)
4. `apps/mobile/package.json` declares `@lustre/hooks` as a dependency: `"@lustre/hooks": "workspace:*"`
5. `apps/web/package.json` declares `@lustre/hooks` as a dependency: `"@lustre/hooks": "workspace:*"`
6. `packages/hooks/tsconfig.json` has `paths` alias: `"@lustre/api": ["../api/src"]`, `"@lustre/tokens": ["../tokens"]`
7. `apps/mobile/tsconfig.json` has `paths` alias for `@lustre/hooks`: `["../../packages/hooks/src"]`
8. `apps/web/tsconfig.json` has `paths` alias for `@lustre/hooks`: `["../../packages/hooks/src"]`

## File Paths

- `turbo.json`
- `pnpm-workspace.yaml`
- `packages/hooks/package.json`
- `packages/hooks/tsconfig.json`
- `apps/mobile/package.json`
- `apps/mobile/tsconfig.json`
- `apps/web/package.json`
- `apps/web/tsconfig.json`
