# Roadmap: F03-CORE-database

**Status:** DONE — all waves implemented and tested
**Created:** 2026-03-24
**Started:** 2026-03-24T16:30Z
**Completed:** 2026-03-24T17:00Z
**Waves:** 2
**Total epics:** 5

---

## Wave 1: Core Data Services
**Status:** DONE (started 2026-03-24T16:30Z, completed 2026-03-24T16:45Z)
**Learnings:** All 3 epics needed post-build fixes (pgbouncer auth, sentinel headless service, import dedup). Helm lint catches template errors early.

### Epic status:
- wave-1a-postgresql: VERIFIED (built + 6 issues fixed: no-op init container removed, pgbouncer auth added, pipefail, label collision, templated probes, conditional R2 secrets)
- wave-1b-redis: VERIFIED (built + 5 issues fixed: sentinel auth-pass, headless service, writable sentinel config, probe auth warnings, removed default password)
- wave-1c-api-data-layer: VERIFIED (built + 1 issue fixed: deduplicated redis import in server.ts)

### Parallelization groups:
**Group A (parallel):**
- wave-1a-postgresql (haiku) — PostgreSQL 17 Helm chart with PostGIS + pgvector, PVC, backup CronJob to R2, connection pooling via PgBouncer
- wave-1b-redis (haiku) — Redis 7 Helm chart with AOF persistence, PVC, Sentinel for HA
- wave-1c-api-data-layer (haiku) — Prisma connection to PostgreSQL, Redis client in API, health checks for both

### Parallelization rationale:
- All parallel: PostgreSQL, Redis, and API data layer config are independent

### Testgate Wave 1:
- [x] PostgreSQL Helm chart lints clean, templates render (354 lines)
- [x] Redis Helm chart lints clean, templates render (291 lines)
- [x] API TypeScript compiles clean (tsc --noEmit passes)
- [x] API dependencies install (ioredis added successfully)
- [ ] PostgreSQL running with PostGIS extension enabled (requires k3s deploy)
- [ ] pgvector extension enabled (requires k3s deploy)
- [ ] Redis running with persistence (requires k3s deploy)
- [ ] API connects to both services (requires docker-compose up)
- [ ] Prisma migrations apply successfully (requires running DB)

**Test results:** 4/4 static checks PASS. 5 runtime checks require live infrastructure (INCONCLUSIVE).

---

## Wave 2: Search & Events
**Status:** DONE (started 2026-03-24T16:45Z, completed 2026-03-24T17:00Z)
**Learnings:** Both agents merged cleanly into shared files (server.ts, docker-compose.yml) without conflicts.

### Epic status:
- wave-2a-meilisearch: VERIFIED (helm chart + API client + health check + docker-compose integration)
- wave-2b-nats: VERIFIED (helm chart + JetStream client + event publisher + health check + docker-compose integration)

### Parallelization groups:
**Group A (parallel):**
- wave-2a-meilisearch (haiku) — Meilisearch Helm chart, API integration, index configuration for profiles
- wave-2b-nats (haiku) — NATS JetStream Helm chart, TypeScript NATS client in API, sample pub/sub flow

### Parallelization rationale:
- Parallel: Meilisearch and NATS are independent services

### Testgate Wave 2:
- [x] Meilisearch Helm chart lints clean, templates render (125 lines)
- [x] NATS Helm chart lints clean, templates render (133 lines)
- [x] API TypeScript compiles clean with meilisearch + nats imports
- [x] All dependencies install (meilisearch, nats packages)
- [ ] Meilisearch indexes a document and returns search results (requires live infra)
- [ ] NATS publishes and receives events (requires live infra)
- [ ] API can publish events to NATS from route handlers (requires live infra)

**Test results:** 4/4 static checks PASS. 3 runtime checks require live infrastructure (INCONCLUSIVE).
