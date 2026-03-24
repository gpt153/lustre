# Lustre — Development Guide

## Project
Lustre is a sex-positive social network & dating platform for the Swedish market with US expansion potential.

## Stack
- **Mobile:** Expo (React Native) + Expo Router
- **Web:** Next.js 16
- **Monorepo:** Turborepo + Solito 5 + Tamagui + tRPC + Zod
- **API:** Node.js + Fastify + TypeScript + Prisma
- **Real-time:** Elixir + Phoenix Channels
- **Video/Voice:** LiveKit (self-hosted)
- **DB:** PostgreSQL 17 + PostGIS + pgvector
- **Cache:** Redis 7
- **Search:** Meilisearch
- **Events:** NATS JetStream
- **Hosting:** Hetzner (Helsinki) + Cloudflare + AWS (DRM only)
- **K8s:** k3s

## Branch Strategy
- `main` is the primary branch (NOT master)
- Feature branches: `feature/<feature-name>`
- All PRs target main

## Build & Run
```bash
pnpm install          # Install all deps
pnpm dev              # Run all apps in dev mode
pnpm build            # Build everything
pnpm test             # Run tests
```

## Key Directories
```
lustre/
  apps/
    mobile/          # Expo (iOS + Android)
    web/             # Next.js
  packages/
    app/             # Shared screens, hooks, logic
    ui/              # Shared UI components (Tamagui)
    api/             # Shared API client, types (tRPC + Zod)
  services/
    api/             # Fastify backend
    realtime/        # Elixir/Phoenix
    livekit/         # LiveKit config
  infra/
    k8s/             # Kubernetes manifests
    docker/          # Dockerfiles
```

## BMAD Planning
All feature planning in: `~/bodycontact-recon/.bmad/features/planned/`
Master roadmap: `~/bodycontact-recon/.bmad/MASTER-ROADMAP.md`

## Database & Infrastructure (F03-CORE-database)
- **PostgreSQL 17:** Helm chart at `infrastructure/helm/postgresql/` — PostGIS + pgvector extensions, PgBouncer sidecar (port 6432), daily R2 backup CronJob
- **Redis 7:** Helm chart at `infrastructure/helm/redis/` — AOF persistence, Sentinel HA, headless service for StatefulSet DNS
- **Meilisearch:** Helm chart at `infrastructure/helm/meilisearch/` — v1.12, profile search index with displayName/status attributes
- **NATS JetStream:** Helm chart at `infrastructure/helm/nats/` — event bus with 256Mi mem / 5Gi storage
- **API data layer:** `services/api/src/lib/redis.ts`, `meilisearch.ts`, `nats.ts`, `events.ts`
- **Health endpoint:** `/health` checks PostgreSQL, Redis, Meilisearch, and NATS — returns `ok` or `degraded`
- **Prisma extensions:** `postgresqlExtensions` preview feature with `postgis` and `vector`
- **Env vars required:**
  - `DATABASE_URL` — PostgreSQL connection string
  - `REDIS_URL` — Redis connection (default: `redis://localhost:6379`)
  - `MEILI_URL` — Meilisearch host (default: `http://localhost:7700`)
  - `MEILI_MASTER_KEY` — Meilisearch API key
  - `NATS_URL` — NATS server (default: `nats://localhost:4222`)

## Auth (F02-CORE-auth)
- **BankID:** Criipto/Idura OIDC integration (`services/api/src/auth/bankid.ts`)
- **Swish:** Swish Handel API for 10 SEK registration payment (`services/api/src/auth/swish.ts`)
- **JWT:** `jose` library, HS256, access (24h) + refresh (30d) tokens (`services/api/src/auth/jwt.ts`)
- **Anonymity:** AES-256-GCM encrypted PII in `encrypted_identities` table (`services/api/src/auth/crypto.ts`)
- **Auth store:** Zustand in `packages/app/src/stores/authStore.ts`, shared across mobile/web
- **Env vars required:**
  - `JWT_SECRET` — signing key for JWT tokens
  - `ENCRYPTION_KEY` — 64 hex chars (32 bytes) for AES-256-GCM
  - `CRIIPTO_DOMAIN`, `CRIIPTO_CLIENT_ID`, `CRIIPTO_CLIENT_SECRET`, `CRIIPTO_REDIRECT_URI`
  - `SWISH_MERCHANT_NUMBER`, `SWISH_API_URL`, `SWISH_CALLBACK_URL`, `SWISH_CERT_PATH`, `SWISH_CERT_PASSPHRASE`

## Rules
- All users verified via BankID (Sweden) or Veriff (international)
- Real names NEVER shown in app — stored encrypted, released only via court order
- Pay-as-you-go token model — no subscriptions, no visible prices in app
- Safety features (SafeDate, Gatekeeper for recipients) are always FREE
- Stripe cannot be used (bans adult) — use Segpay/CCBill + Swish
