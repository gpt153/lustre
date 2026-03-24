# Lustre

Sex-positive social network & dating platform.

**Domain:** lovelustre.com
**Stack:** Expo (React Native) + Next.js + Fastify + Elixir/Phoenix + PostgreSQL + LiveKit

## Monorepo Structure

```
lustre/
  apps/
    mobile/          # Expo (iOS + Android) — Expo Router, Tamagui
    web/             # Next.js 15 — App Router, Tamagui, SSR
  packages/
    ui/              # Shared UI components (Tamagui) — @lustre/ui
    api/             # Shared API client, tRPC + Zod — @lustre/api
    app/             # Shared screens, hooks, logic — @lustre/app
  services/
    api/             # Fastify backend, tRPC, Prisma — @lustre/api-server
  infrastructure/
    hetzner-k3s.yaml # k3s cluster config (Hetzner Helsinki)
    helm/api/        # Helm chart for API deployment
    helm/web/        # Helm chart for web deployment
    helm/postgresql/ # PostgreSQL 17 + PostGIS + pgvector + PgBouncer
    helm/redis/      # Redis 7 + AOF + Sentinel
    helm/meilisearch/ # Meilisearch v1.12 full-text search
    helm/nats/       # NATS JetStream event bus
    k8s/             # Kubernetes manifests (namespace, cert-manager)
    deploy.sh        # Deploy script
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start all apps in dev mode
pnpm dev

# Start individual apps
pnpm dev --filter mobile    # Expo on :8081
pnpm dev --filter web       # Next.js on :3000
pnpm dev --filter @lustre/api-server  # Fastify on :4000

# Build everything
pnpm build

# Lint & typecheck
pnpm turbo lint typecheck
```

## Local Development with Docker

```bash
docker compose up        # Starts API, web, PostgreSQL, Redis, Meilisearch, NATS
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | API server port |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/lustre` | PostgreSQL connection |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `MEILI_URL` | `http://localhost:7700` | Meilisearch host |
| `MEILI_MASTER_KEY` | — | Meilisearch API key |
| `NATS_URL` | `nats://localhost:4222` | NATS JetStream server |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | API URL for web app |

## API Endpoints

- `GET /health` — Health check (returns `{ status: "ok"|"degraded", postgres, redis, meilisearch, nats, timestamp }`)
- `/trpc/*` — tRPC router (type-safe RPC via `@trpc/server`)

## CI/CD

GitHub Actions runs on push/PR to `main`:
1. Lint + Typecheck + Test (Turborepo)
2. Docker build API → `ghcr.io/gpt153/lustre-api`
3. Docker build Web → `ghcr.io/gpt153/lustre-web`

## Deployment

Production runs on a 3-node k3s cluster on Hetzner Cloud (Helsinki):
- `api.lovelustre.com` — API server
- `app.lovelustre.com` — Web app
- TLS via cert-manager + Let's Encrypt
- Helm-based deployments with rolling updates

```bash
# Deploy to k3s
./infrastructure/deploy.sh
```

## Status

F01 scaffolding, F03 database & infrastructure complete. See `.bmad/STATUS.md` for full feature roadmap.
