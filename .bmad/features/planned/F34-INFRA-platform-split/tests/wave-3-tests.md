# Test Spec: Wave 3 — Cleanup & Verification

## Scope

Verify that deprecated packages are removed from the build pipeline, CI runs correctly, and documentation is updated.

---

## T3.1: Deprecation Verification

**Tool:** Shell commands + jq
**Scope:** `packages/ui/`, `packages/app/`, `apps/`

### Package Deprecation

1. **ui deprecated field** — `jq -r '.deprecated' packages/ui/package.json` returns a non-null deprecation message
2. **app deprecated field** — `jq -r '.deprecated' packages/app/package.json` returns a non-null deprecation message

### Pipeline Exclusion

3. **Turbo build skips ui** — `turbo build --dry-run` output does NOT include `@lustre/ui#build`
4. **Turbo build skips app** — `turbo build --dry-run` output does NOT include `@lustre/app#build`

### Import Verification (final)

5. **No @lustre/app in apps/** — `grep -r "from '@lustre/app'" apps/ --include='*.ts' --include='*.tsx' | wc -l` equals 0
6. **No @lustre/ui in apps/** — `grep -r "from '@lustre/ui'" apps/ --include='*.ts' --include='*.tsx' | wc -l` equals 0
7. **No @lustre/app in packages/hooks/** — `grep -r "from '@lustre/app'" packages/hooks/ --include='*.ts' --include='*.tsx' | wc -l` equals 0

### Dependency Removal

8. **Mobile no deprecated deps** — `jq '.dependencies["@lustre/ui"] // .dependencies["@lustre/app"]' apps/mobile/package.json` returns null
9. **Web no deprecated deps** — `jq '.dependencies["@lustre/ui"] // .dependencies["@lustre/app"]' apps/web/package.json` returns null

---

## T3.2: CI Pipeline Verification

**Tool:** CI run or `act` local run

1. **CI workflow exists** — `.github/workflows/ci.yml` exists and is valid YAML
2. **CI build order** — tokens builds before hooks (verified by build log timestamps or Turborepo graph)
3. **CI test — tokens** — `pnpm test --filter @lustre/tokens` passes in CI
4. **CI test — hooks** — `pnpm test --filter @lustre/hooks` passes in CI
5. **CI test — api** — `pnpm test --filter @lustre/api` passes in CI
6. **CI build — mobile** — `pnpm build --filter apps/mobile` succeeds in CI
7. **CI build — web** — `pnpm build --filter apps/web` succeeds in CI
8. **CI excludes deprecated** — CI log does NOT show `@lustre/ui` or `@lustre/app` being built/tested

---

## T3.3: Documentation Verification

**Tool:** Manual review + grep

1. **README architecture** — `README.md` contains `packages/tokens/` and `packages/hooks/` in the directory listing
2. **README deprecated** — `README.md` marks `packages/ui/` and `packages/app/` as deprecated
3. **CLAUDE.md updated** — `CLAUDE.md` Key Directories section lists `packages/tokens/`, `packages/hooks/`
4. **CLAUDE.md stack** — `CLAUDE.md` Stack section does NOT reference "Solito" or "Tamagui" as active
5. **BMAD status** — `.bmad/STATUS.md` shows F34 as complete

---

## T3.4: Full System Verification

**Tool:** Shell commands

1. **Root build** — `pnpm build` exits 0
2. **Root test** — `pnpm test` exits 0
3. **Root typecheck** — `pnpm typecheck` exits 0
4. **Package count** — `pnpm ls --filter './packages/*' --depth 0` shows tokens, hooks, api as active (ui and app may still appear but are not built)
