# Epic: wave-3a-deprecate-packages

**Model:** haiku
**Wave:** 3
**Group:** A (parallel)

## Description

Mark `packages/ui/` and `packages/app/` as deprecated. Add deprecation notices to their `package.json` files. Remove them from the active Turborepo build pipeline by updating `turbo.json` to exclude these packages from `build`, `lint`, and `typecheck` tasks. Verify that no file in `apps/mobile/`, `apps/web/`, or `apps/admin/` still imports from these packages. The deprecated packages remain in the repo for reference but are not built or consumed.

## Acceptance Criteria

1. `packages/ui/package.json` has `"deprecated": "Replaced by @lustre/tokens (design values) and local app components. See F34-INFRA-platform-split."` field
2. `packages/app/package.json` has `"deprecated": "Replaced by @lustre/hooks (shared hooks/stores) and local app screens/components. See F34-INFRA-platform-split."` field
3. `turbo.json` excludes `packages/ui` and `packages/app` from build pipeline using `"filter"` or by removing their workspace dependency declarations from consuming packages
4. `apps/mobile/package.json` does NOT list `@lustre/ui` or `@lustre/app` in dependencies
5. `apps/web/package.json` does NOT list `@lustre/ui` or `@lustre/app` in dependencies
6. Running `grep -r "from '@lustre/app'" apps/ --include='*.ts' --include='*.tsx'` returns zero results
7. Running `grep -r "from '@lustre/ui'" apps/ --include='*.ts' --include='*.tsx'` returns zero results
8. `pnpm build` from monorepo root succeeds without building `packages/ui/` or `packages/app/`

## File Paths

- `packages/ui/package.json`
- `packages/app/package.json`
- `turbo.json`
- `apps/mobile/package.json`
- `apps/web/package.json`
