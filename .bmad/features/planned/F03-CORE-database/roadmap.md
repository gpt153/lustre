# Roadmap: F03-CORE-database

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 5

---

## Wave 1: Core Data Services
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-1a-postgresql (haiku) — PostgreSQL 17 Helm chart with PostGIS + pgvector, PVC, backup CronJob to R2, connection pooling via PgBouncer
- wave-1b-redis (haiku) — Redis 7 Helm chart with AOF persistence, PVC, Sentinel for HA
- wave-1c-api-data-layer (haiku) — Prisma connection to PostgreSQL, Redis client in API, health checks for both

### Parallelization rationale:
- All parallel: PostgreSQL, Redis, and API data layer config are independent

### Testgate Wave 1:
- [ ] PostgreSQL running with PostGIS extension enabled
- [ ] pgvector extension enabled
- [ ] Redis running with persistence
- [ ] API connects to both services
- [ ] Prisma migrations apply successfully

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
