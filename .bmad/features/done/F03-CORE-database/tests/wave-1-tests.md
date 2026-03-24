# Test Spec: Wave 1 — Core Data Services

## T1: PostgreSQL with PostGIS extension
- Deploy PostgreSQL helm chart
- Connect to the database and run `SELECT PostGIS_Version();`
- Expect: version string returned (not error)

## T2: pgvector extension enabled
- Connect to the database and run `SELECT extversion FROM pg_extension WHERE extname = 'vector';`
- Expect: version returned

## T3: Redis running with persistence
- Deploy Redis helm chart
- Run `redis-cli ping` → expect `PONG`
- Run `redis-cli CONFIG GET appendonly` → expect `yes`

## T4: API connects to both services
- Start the API service
- Curl `GET /health` → expect JSON with `postgres: "ok"` and `redis: "ok"`

## T5: Prisma migrations apply
- Run `npx prisma migrate deploy` in the API container
- Expect: exit code 0, no errors
