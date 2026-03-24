# Roadmap: F01-CORE-scaffolding

**Status:** DONE — all waves implemented and tested
**Created:** 2026-03-24
**Started:** 2026-03-24T18:15Z
**Completed:** 2026-03-24T19:10Z
**Waves:** 3
**Total epics:** 7

---

## Wave 1: Monorepo & App Shells
**Status:** DONE (2026-03-24T18:15Z → 2026-03-24T18:45Z)

### Epic status:
- wave-1a-monorepo-init: VERIFIED
- wave-1b-shared-packages: VERIFIED
- wave-1c-expo-shell: VERIFIED
- wave-1d-nextjs-shell: VERIFIED

### Parallelization groups:
**Group A (parallel):**
- wave-1a-monorepo-init (haiku) — Initialize Turborepo with pnpm workspaces, configure base tsconfig, eslint, prettier
- wave-1b-shared-packages (haiku) — Create packages/ui (Tamagui), packages/api (tRPC + Zod), packages/app (shared logic)

**Group B (sequential, after A):**
- wave-1c-expo-shell (haiku) — Expo app with Expo Router, Tamagui, splash screen, placeholder screens
- wave-1d-nextjs-shell (haiku) — Next.js 16 app with SSR, Tamagui, Solito navigation bridge

### Parallelization rationale:
- A is parallel: monorepo init and shared packages can be scaffolded independently
- B is sequential: app shells depend on shared packages existing

### Testgate Wave 1: PASS
- [x] `pnpm install` succeeds — 1192 packages installed
- [x] `pnpm build` compiles all packages — Next.js built 7 pages, Turbo cached
- [x] Expo dev server launches on :8081 — Metro bundler started
- [x] Next.js builds and runs on :3000 — 5 routes statically prerendered
- [x] Tamagui components render on both platforms — typecheck + build pass

**Fixes during testing:** Added missing @tamagui/font-inter and @tamagui/shorthands deps to packages/ui, created eslint.config.js for ESLint 9 flat config, fixed mobile lint script

---

## Wave 2: Backend & API
**Status:** DONE (2026-03-24T18:45Z → 2026-03-24T18:55Z)

### Epic status:
- wave-2a-fastify-api: VERIFIED
- wave-2b-trpc-integration: VERIFIED
- fix-wave-2-type-portability: VERIFIED

### Parallelization groups:
**Group A (sequential):**
- wave-2a-fastify-api (haiku) — Fastify + TypeScript server with health endpoint, tRPC router, Prisma client setup
- wave-2b-trpc-integration (haiku) — Connect tRPC client in packages/api to Fastify backend, test from both apps

### Parallelization rationale:
- Sequential: tRPC integration depends on Fastify server existing

### Testgate Wave 2: PASS
- [x] GET /health returns 200 — {"status":"ok","timestamp":"..."}
- [x] tRPC health.check callable — valid superjson response with Date serialization
- [x] TypeScript typecheck passes all packages
- [x] Prisma client generated successfully (v6.19.2)

**Fixes during testing:** Added explicit type annotations in trpc-client.ts and useHealthCheck.ts to fix TS2742 portability errors, added fastify + @types/react as devDeps

---

## Wave 3: Infrastructure & CI/CD
**Status:** DONE (2026-03-24T18:55Z → 2026-03-24T19:10Z)

### Epic status:
- wave-3a-ci-pipeline: VERIFIED
- wave-3b-k3s-infra: VERIFIED
- fix-wave-3-web-dockerfile: VERIFIED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-ci-pipeline (haiku) — GitHub Actions: lint, typecheck, test, Docker build for API + web
- wave-3b-k3s-infra (sonnet) — hetzner-k3s cluster config, Traefik ingress, Cloudflare DNS, Helm charts

### Parallelization rationale:
- A is parallel: CI pipeline and infrastructure are independent concerns

### Testgate Wave 3: PASS
- [x] CI workflow valid YAML, correct structure with lint/typecheck/test + Docker jobs
- [x] Docker API image builds successfully (lustre-api:test)
- [x] Docker Web image builds successfully (lustre-web:test, standalone output)
- [x] docker-compose.yml validated (api, web, postgres, redis, meilisearch)
- [x] Helm charts lint clean (api + web)
- [ ] k3s cluster deployment — INCONCLUSIVE (requires Hetzner credentials, manual step)
- [ ] HTTPS termination — INCONCLUSIVE (requires live cluster)

**Fixes during testing:** Rewrote web Dockerfile to single-stage install (pnpm store version mismatch), added Next.js standalone output mode
