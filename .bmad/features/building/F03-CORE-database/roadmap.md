# Roadmap: F03-CORE-database

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Started:** 2026-03-24T16:30Z
**Waves:** 2
**Total epics:** 5

---

## Wave 1: Core Data Services
**Status:** IN_PROGRESS (started 2026-03-24T16:30Z)

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
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-meilisearch (haiku) — Meilisearch Helm chart, API integration, index configuration for profiles
- wave-2b-nats (haiku) — NATS JetStream Helm chart, TypeScript NATS client in API, sample pub/sub flow

### Parallelization rationale:
- Parallel: Meilisearch and NATS are independent services

### Testgate Wave 2:
- [ ] Meilisearch indexes a document and returns search results
- [ ] NATS publishes and receives events
- [ ] API can publish events to NATS from route handlers
