# Epic: API Data Layer (Prisma + Redis Client)

**Wave:** 1 | **Group:** A (parallel)
**Model:** haiku

## Description

Add Redis client (ioredis) to the API service alongside existing Prisma client. Add health check endpoints for both PostgreSQL and Redis. Update Prisma schema to enable PostGIS extensions. Update docker-compose.yml to add PostGIS image and enable extensions.

## Acceptance Criteria

1. `ioredis` package added to `services/api/package.json`
2. Redis client module at `services/api/src/lib/redis.ts` with singleton pattern (like existing Prisma)
3. Redis client available in tRPC context via `services/api/src/trpc/context.ts`
4. Health endpoint (`/health`) updated to check both PostgreSQL and Redis connectivity
5. Prisma schema updated: `previewFeatures = ["postgresqlExtensions"]` and `extensions = [postgis, vector]`
6. Prisma migration created for enabling extensions
7. `docker-compose.yml` updated: postgres image changed to `postgis/postgis:17-3.5-alpine`, init script for pgvector
8. Environment variables documented: `REDIS_URL` added to docker-compose for api service

## File Paths

- `services/api/package.json`
- `services/api/src/lib/redis.ts`
- `services/api/src/trpc/context.ts`
- `services/api/src/server.ts`
- `services/api/prisma/schema.prisma`
- `docker-compose.yml`
