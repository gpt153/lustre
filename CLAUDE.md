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

## Profiles (F04-SOCIAL-profiles)
- **Schema:** Profile, ProfilePhoto, KinkTag, ProfileKinkTag, PairInvitation, PairLink, PairLinkMember — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** Gender (11), Orientation (9), RelationshipType (6), Seeking (7), ContentPreference (4), KinkInterestLevel (3), InvitationStatus (4)
- **tRPC Routers:** `profile` (CRUD), `photo` (delete/reorder/list), `search` (Meilisearch), `kink` (tags), `pair` (linking)
- **REST endpoint:** `POST /api/photos/upload` — multipart photo upload with sharp WebP conversion + 3 thumbnail sizes to Cloudflare R2
- **Meilisearch:** Profile indexing on create/update, search with filters (gender, orientation, age, seeking, verified), sortable by createdAt/age
- **Kink tags:** 113 predefined tags in 9 categories, seed via `npx prisma db seed`
- **Pair linking:** Invitation (48h expiry), accept/decline, max 5 members, leave flow
- **Shared components:** `packages/app/src/` — OnboardingWizard, ProfileViewScreen, ProfileEditScreen, PhotoGallery, ProfileCard, PairLinkCard, useProfile hook, profileStore
- **Mobile:** Onboarding at `apps/mobile/app/(auth)/onboarding/`, profile tab updated
- **Web:** Onboarding at `/onboarding`, profile view/edit at `/profile`, public profile at `/profile/[userId]`
- **Env vars required:**
  - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

## Social Feed (F05-SOCIAL-feed)
- **Schema:** Post, PostMedia, ContentTag, UserContentFilter, FeedInteraction — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** NudityLevel (4), BodyPartTag (8), ActivityTag (8), VibeTag (6), GenderPresentationTag (4), ContentTagDimension (5), FeedInteractionType (2)
- **tRPC Routers:** `post` (create, get, list, delete, feed, like, unlike, showLess), `contentFilter` (get, update, applyPreset)
- **REST endpoint:** `POST /api/posts/upload?postId=` — multipart image upload with sharp WebP conversion + 3 thumbnails to R2
- **Feed algorithm:** SQL-based scoring (recency decay 24h half-life, show-less penalty 50%), content filter matching via NOT EXISTS subquery
- **Content classification:** Sightengine API (`nudity-2.1`, `face-attributes-3.0`, `type-1.0`), 5-dimension tag mapping, fire-and-forget after upload
- **Content filters:** 4 presets (SOFT, OPEN, EXPLICIT, NO_DICK_PICS) with per-dimension customization
- **Shared components:** `packages/app/src/` — FeedScreen, CreatePostScreen, PostCard, PostImageGallery, useFeed hook
- **Mobile:** Feed replaces home tab at `apps/mobile/app/(tabs)/index.tsx`
- **Web:** Feed at `apps/web/app/(app)/home/page.tsx` with IntersectionObserver infinite scroll
- **Env vars required:**
  - `SIGHTENGINE_API_USER`, `SIGHTENGINE_API_SECRET`

## Interest Groups (F06-SOCIAL-groups)
- **Schema:** Group, GroupMember, GroupModerator — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** GroupVisibility (OPEN, PRIVATE), MembershipStatus (PENDING, ACTIVE, BANNED), ModeratorRole (MODERATOR, OWNER)
- **tRPC Router:** `group` — create, get, list, search, join, leave, approve, reject, members, ban, unban, removePost, update, addModerator, removeModerator, pendingMembers
- **Post.groupId:** Optional field on Post model for group-scoped posts
- **Moderation:** `assertGroupModerator` helper enforces moderator/owner permissions; OWNER required for settings, adding/removing moderators
- **Shared components:** `packages/app/src/` — GroupListScreen, GroupDetailScreen, CreateGroupScreen, GroupModerationScreen, GroupCard, useGroups hook
- **Mobile:** Groups tab at `apps/mobile/app/(tabs)/groups.tsx`
- **Web:** `/groups`, `/groups/create`, `/groups/[groupId]`, `/groups/[groupId]/moderation`

## AI Gatekeeper (F07-CONNECT-gatekeeper)
- **Schema:** GatekeeperConfig, GatekeeperConversation, GatekeeperMessage, UserBalance, TokenTransaction — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** GatekeeperStrictness (MILD, STANDARD, STRICT), GatekeeperTone (FORMAL, CASUAL, FLIRTY), GatekeeperStatus (ACTIVE, PASSED, FAILED, EXPIRED, BYPASSED), GatekeeperMessageRole (USER, AI, SYSTEM), TokenTransactionType (GATEKEEPER, TOPUP, REFUND)
- **tRPC Router:** `gatekeeper` — getConfig, updateConfig, toggle, checkRequired, initiate, respond, getConversation
- **AI service:** `services/api/src/lib/gatekeeper-ai.ts` — OpenAI GPT-4o-mini integration, system prompt builder (dealbreakers anonymized via keyword mapping), multi-turn conversation manager, JSON response parsing with fallback
- **Token system:** `services/api/src/lib/tokens.ts` — checkBalance, debitTokens (atomic via Prisma transaction), creditTokens. Gatekeeper costs 20 tokens (~2 SEK). Sender pays on conversation completion (PASS or FAIL), recipient never charged
- **Bypass rules:** Mutual match (both liked each other's posts) bypasses Gatekeeper entirely; no-purchase-bypass enforced by design (no endpoint exists)
- **Shared components:** `packages/app/src/` — GatekeeperConversationScreen, GatekeeperSettingsScreen, AiQualifiedBadge, useGatekeeper hook
- **Mobile:** Gatekeeper settings at `apps/mobile/app/(tabs)/profile/gatekeeper.tsx`
- **Web:** Settings at `/settings/gatekeeper`, conversation view at `/gatekeeper/[conversationId]`
- **Env vars required:**
  - `OPENAI_API_KEY` — OpenAI API key for GPT-4o-mini

## Rules
- All users verified via BankID (Sweden) or Veriff (international)
- Real names NEVER shown in app — stored encrypted, released only via court order
- Pay-as-you-go token model — no subscriptions, no visible prices in app
- Safety features (SafeDate, Gatekeeper for recipients) are always FREE
- Stripe cannot be used (bans adult) — use Segpay/CCBill + Swish
