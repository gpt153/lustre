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
| `R2_ACCOUNT_ID` | — | Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | — | R2 access key |
| `R2_SECRET_ACCESS_KEY` | — | R2 secret key |
| `R2_BUCKET_NAME` | `lustre-photos` | R2 bucket for photo storage |
| `R2_PUBLIC_URL` | — | Public URL for R2 bucket |
| `SIGHTENGINE_API_USER` | — | Sightengine API user (content classification) |
| `SIGHTENGINE_API_SECRET` | — | Sightengine API secret |

## API Endpoints

- `GET /health` — Health check (returns `{ status: "ok"|"degraded", postgres, redis, meilisearch, nats, timestamp }`)
- `POST /api/photos/upload` — Multipart photo upload (Bearer auth, max 20MB, WebP conversion + 3 thumbnail sizes to R2)
- `POST /api/posts/upload?postId=` — Multipart post media upload (Bearer auth, max 4 images per post, WebP + thumbnails to R2, auto-classification via Sightengine)
- `/trpc/*` — tRPC router (type-safe RPC via `@trpc/server`)
  - `profile.*` — Profile CRUD (create, update, get, getPublic)
  - `photo.*` — Photo management (list, delete, reorder)
  - `search.profiles` — Meilisearch-powered profile search with filters
  - `kink.*` — Kink tag listing, search, and assignment
  - `pair.*` — Pair/poly linking (invite, respond, leave, getMyLinks)
  - `post.*` — Post CRUD (create, get, list, delete), feed algorithm (feed), interactions (like, unlike, showLess)
  - `contentFilter.*` — User content filter preferences (get, update, applyPreset)
  - `group.*` — Interest groups (create, get, list, search, join, leave, approve, reject, members, ban, unban, removePost, update, addModerator, removeModerator, pendingMembers)

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

F01 scaffolding, F02 auth, F03 database & infrastructure, F04 profiles, F05 social feed, F06 interest groups complete. See `.bmad/STATUS.md` for full feature roadmap.
