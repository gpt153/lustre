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
    helm/livekit/    # LiveKit WebRTC server (voice & video calls)
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
| `LIVEKIT_API_KEY` | — | LiveKit server API key (for token signing) |
| `LIVEKIT_API_SECRET` | — | LiveKit server API secret (for token signing) |
| `LIVEKIT_WS_URL` | `wss://livekit.lovelustre.com` | LiveKit WebSocket URL for clients |
| `ANTHROPIC_API_KEY` | — | Anthropic API key (article generation) |
| `ELEVENLABS_API_KEY` | — | ElevenLabs API key (podcast TTS generation) |
| `JWT_SECRET` | — | JWT signing secret (access 24h + refresh 30d tokens) |
| `ENCRYPTION_KEY` | — | 64 hex chars (32 bytes) for AES-256-GCM PII encryption |
| `SWISH_MERCHANT_NUMBER` | — | Swish Handel merchant number (registration verification + marketplace) |
| `SWISH_API_URL` | — | Swish API base URL |
| `SWISH_CALLBACK_URL` | — | Public URL for Swish payment callbacks |
| `SWISH_CERT_PATH` | — | Path to Swish mTLS .p12 certificate |
| `SWISH_CERT_PASSPHRASE` | — | Passphrase for Swish .p12 certificate |
| `ROARING_API_KEY` | — | Roaring.io API key for SPAR identity/age lookups (registration) |
| `GOOGLE_CLIENT_ID` | — | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | — | Google OAuth2 client secret |
| `APPLE_CLIENT_ID` | — | Apple Sign In service ID |
| `APPLE_TEAM_ID` | — | Apple Developer Team ID |
| `APPLE_KEY_ID` | — | Apple Sign In key ID |
| `APPLE_PRIVATE_KEY` | — | Apple Sign In private key (PEM) |

## API Endpoints

- `GET /health` — Health check (returns `{ status: "ok"|"degraded", postgres, redis, meilisearch, nats, timestamp }`)
- `POST /api/photos/upload` — Multipart photo upload (Bearer auth, max 20MB, WebP conversion + 3 thumbnail sizes to R2)
- `POST /api/posts/upload?postId=` — Multipart post media upload (Bearer auth, max 4 images per post, WebP + thumbnails to R2, auto-classification via Sightengine)
- `POST /api/call/token` — Generate LiveKit JWT for a call room (Bearer auth, body: `{ conversationId }`, returns `{ token, wsUrl, roomName, receiverId }`)
- `POST /api/marketplace/swish-callback` — Swish payment callback (buyer order payment confirmation)
- `POST /api/marketplace/payout-callback` — Swish payout callback (seller payout confirmation)
- `/trpc/*` — tRPC router (type-safe RPC via `@trpc/server`)
  - `profile.*` — Profile CRUD (create, update, get, getPublic)
  - `photo.*` — Photo management (list, delete, reorder)
  - `search.profiles` — Meilisearch-powered profile search with filters
  - `kink.*` — Kink tag listing, search, and assignment
  - `pair.*` — Pair/poly linking (invite, respond, leave, getMyLinks)
  - `post.*` — Post CRUD (create, get, list, delete), feed algorithm (feed), interactions (like, unlike, showLess)
  - `contentFilter.*` — User content filter preferences (get, update, applyPreset)
  - `group.*` — Interest groups (create, get, list, search, join, leave, approve, reject, members, ban, unban, removePost, update, addModerator, removeModerator, pendingMembers)
  - `org.*` — Organizations (create, get, list, update, join, leave, getMembers, addMember, removeMember, requestVerification)
  - `call.*` — Voice/video calls (initiate, accept, reject, end, getStatus)
  - `education.*` — Sexual health education (listTopics, listArticles, getArticle, listPodcasts, listQuizzes, getQuiz, submitQuiz, markArticleRead)
  - `auth.*` — Authentication: `completeRegistration`, `loginWithEmail`, `loginWithGoogle`, `loginWithApple`, `requestPasswordReset`, `resetPassword`, `logout`, `sessions`, `revokeSession`
  - `auth.swish.*` — Swish registration: `createPayment`, `checkStatus`, `registrationCallback`
  - `settings.*` — User mode settings (getMode, setMode — vanilla/spicy toggle backed by Profile.spicyModeEnabled)
  - `listing.*` — Marketplace listings (create, update, remove, list, getById, getByCategory, getMine)
  - `order.*` — Marketplace orders (create, markShipped, confirmDelivery, getStatus, getMyOrders, initiatePayment, checkPaymentStatus)
  - `seller.*` — Seller tools (registerSwishNumber, getSwishNumber)

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

F01 scaffolding, F03 database & infrastructure, F04 profiles, F05 social feed, F06 interest groups, F07 AI gatekeeper, F08 matching, F10 voice & video calls, F12 organizations, F14 ConsentVault, F15 coach engine, F17 spicy coaching, F18 gamification, F19 sexual health education, F20 marketplace, F25 dual mode (Vanilla/Spicy toggle), **F30 auth fix** (Swish+SPAR identity verification, email/password login, Google+Apple OAuth — BankID removed) complete. See `.bmad/STATUS.md` for full feature roadmap.
