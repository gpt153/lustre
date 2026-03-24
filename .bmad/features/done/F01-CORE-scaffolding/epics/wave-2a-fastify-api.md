# Epic: Fastify API Server | Wave-2a

**Wave:** 2
**Model:** haiku
**Dependencies:** wave-1a

## Description

Create the Fastify backend API server in services/api with TypeScript, tRPC integration, Prisma ORM setup (schema only, no database yet), structured logging with pino, CORS configuration, and health endpoint. The server should start on port 4000, expose a /health REST endpoint and a tRPC router at /trpc. Prisma schema should define the initial User model as a starting point.

## File paths
1. services/api/package.json
2. services/api/src/server.ts
3. services/api/src/trpc/router.ts
4. services/api/src/trpc/context.ts
5. services/api/prisma/schema.prisma
6. services/api/tsconfig.json
7. services/api/Dockerfile

## Implementation steps
1. Create services/api/package.json with dependencies: fastify, @fastify/cors, @fastify/helmet, @trpc/server, @trpc/server/adapters/fastify, prisma, @prisma/client, zod, superjson, pino-pretty
2. Create services/api/src/server.ts: initialize Fastify with logger (pino), register CORS (allow apps origins), register Helmet, register /health route, register tRPC adapter at /trpc, start on PORT env or 4000
3. Create services/api/src/trpc/context.ts with createContext function (request, prisma client placeholder)
4. Create services/api/src/trpc/router.ts with appRouter containing health.check procedure returning { status: "ok", timestamp }
5. Create services/api/prisma/schema.prisma with PostgreSQL datasource (DATABASE_URL env), generator client, and User model (id UUID, displayName, email, createdAt, updatedAt)
6. Create Dockerfile: Node 22 alpine, copy package.json, install, copy source, build, expose 4000
7. Add scripts to package.json: dev (tsx watch), build (tsc), start (node dist/server.js), db:generate (prisma generate)
8. Run prisma generate to create client types
9. Export AppRouter type from services/api for packages/api to import

## Acceptance Criteria
1. `pnpm dev --filter @lustre/api-server` starts Fastify on :4000
2. GET /health returns { status: "ok", timestamp: "..." }
3. tRPC health.check procedure returns valid response
4. Prisma schema validates (prisma validate passes)
5. Docker build produces runnable image
