# Epic: wave-3c-documentation

**Model:** haiku
**Wave:** 3
**Group:** A (parallel)

## Description

Update project documentation to reflect the new architecture. The root README should describe the new package structure (`packages/tokens/`, `packages/hooks/`, `packages/api/`) and mark `packages/ui/` and `packages/app/` as deprecated. CLAUDE.md should update the "Key Directories" section. BMAD status files should reflect F34 completion.

## Acceptance Criteria

1. `README.md` "Key Directories" section lists `packages/tokens/`, `packages/hooks/`, `packages/api/` as active packages and marks `packages/ui/`, `packages/app/` as deprecated
2. `CLAUDE.md` "Key Directories" section updated to show the new architecture with `packages/tokens/`, `packages/hooks/` and their purposes
3. `CLAUDE.md` "Stack" section updated: remove "Solito 5 + Tamagui" from the monorepo line, note shared packages are `@lustre/tokens` + `@lustre/hooks` + `@lustre/api`
4. `.bmad/STATUS.md` updated with F34 completion status
5. `.bmad/MASTER-ROADMAP.md` updated to reflect F34 completion and dependency status for F32/F33
6. Root `README.md` build instructions remain accurate (`pnpm install`, `pnpm dev`, `pnpm build`, `pnpm test`)

## File Paths

- `README.md`
- `CLAUDE.md`
- `.bmad/STATUS.md`
- `.bmad/MASTER-ROADMAP.md`
