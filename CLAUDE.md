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

## Auth (F02-CORE-auth → corrected by F30-CORE-auth-fix)
⚠️ F02 was built with BankID — F30 replaces it with the correct flow below.
- **Registration:** Swish 10 SEK (`services/api/src/auth/swish.ts`) → Swish Handel API returns name + phone → SPAR lookup via Roaring.io (`services/api/src/auth/spar.ts`) → age 18+ check → account activated
- **Login:** Email/password OR OAuth (Google, Apple) (`services/api/src/auth/oauth.ts`)
- **JWT:** `jose` library, HS256, access (24h) + refresh (30d) tokens (`services/api/src/auth/jwt.ts`)
- **Anonymity:** AES-256-GCM encrypted PII in `encrypted_identities` table (`services/api/src/auth/crypto.ts`)
- **Auth store:** Zustand in `packages/app/src/stores/authStore.ts`, shared across mobile/web
- **One-person-one-account:** unique constraint on phone number (from Swish), released 90 days after account deletion
- **Env vars required:**
  - `JWT_SECRET` — signing key for JWT tokens
  - `ENCRYPTION_KEY` — 64 hex chars (32 bytes) for AES-256-GCM
  - `SWISH_MERCHANT_NUMBER`, `SWISH_API_URL`, `SWISH_CALLBACK_URL`, `SWISH_CERT_PATH`, `SWISH_CERT_PASSPHRASE`
  - `ROARING_API_KEY` — Roaring.io SPAR lookup
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google OAuth
  - `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` — Apple Sign In

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

## Matching (F08-CONNECT-matching)
- **Schema:** Swipe, Match, SeenProfile — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** SwipeAction (LIKE, PASS)
- **tRPC Router:** `match` — getDiscoveryStack (filtered, excludes seen/swiped), swipe (mutual match detection), getMatches, search (PostGIS ST_DWithin for radius)
- **PostGIS:** Profile.location field (`geography(Point,4326)`) with GIST index for distance-based search
- **Redis seen-list:** `services/api/src/lib/seen-list.ts` — `seen:{userId}` SET with 30-day TTL, DB warmup fallback
- **Shared components:** `packages/app/src/` — DiscoverScreen (PanResponder swipe cards), MatchesListScreen, SearchScreen, MatchAnimation, useDiscovery hook
- **Mobile:** Discover tab at `apps/mobile/app/(tabs)/discover.tsx` with sub-tabs (discover/matches/search)
- **Web:** `/discover` (profile grid + Like/Pass), `/discover/search` (filter sidebar + results), `/discover/matches` (matches grid)

## Chat (F09-CONNECT-chat)
- **Schema:** Conversation, ConversationParticipant, Message — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** MessageType (TEXT, IMAGE, VIDEO), MessageStatus (SENT, DELIVERED, READ)
- **Relation:** Match has one Conversation (auto-created in `match.swipe` transaction on mutual like)
- **Real-time service:** Elixir/Phoenix at `services/realtime/` — WebSocket at `/socket`, JWT HS256 auth (`PHX_JWT_SECRET`), channels `conversation:*` and `user:*`
- **Channel events:** `send_message` → NATS `chat.message.new` → Fastify consumer persists → broadcasts `new_message`; `typing_start`/`typing_stop` → broadcasts `user_typing`; `screenshot_taken` → broadcasts to other participants
- **NATS consumer:** `services/api/src/lib/chat-consumer.ts` — subscribes `chat.message.new`, persists Message via Prisma
- **Media upload:** `POST /api/chat/upload?conversationId=` — multipart image/video → R2 (`chat/<convId>/<userId>/<ts>.webp`), fire-and-forget Sightengine classification; `services/api/src/lib/chat-classifier.ts` applies NO_DICK_PICS filter (`isFiltered = true`)
- **tRPC Router:** `conversation` — list, getMessages (cursor-based, oldest-first), markRead, toggleReadReceipts, updateMessageStatus, revealFilteredMedia, deleteMessage
- **Shared components:** `packages/app/src/` — ConversationListScreen, ChatRoomScreen, useChat hook, useChatRoom hook (Phoenix WebSocket + tRPC)
- **Mobile:** Chat tab at `apps/mobile/app/(tabs)/chat/` — index (list) + `[conversationId]` (room); expo-screen-capture FLAG_SECURE prevents screenshots
- **Web:** 2-column layout at `/chat` and `/chat/[conversationId]`
- **Helm chart:** `infrastructure/helm/realtime/` — ingress `ws.lovelustre.com`, port 4001
- **Env vars required:**
  - `PHX_JWT_SECRET` — same value as `JWT_SECRET` (used by Phoenix to verify Fastify-issued JWTs)
  - `SECRET_KEY_BASE` — Phoenix secret key base (64-byte hex)
  - `NATS_URL` — used by both Fastify and Phoenix

## Organizations (F12-MEET-organizations)
- **Schema:** Organization, OrgMember, OrgVerification — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** OrgType (CLUB, ASSOCIATION, BUSINESS, EVENT_COMPANY), OrgMemberRole (OWNER, ADMIN, MODERATOR, MEMBER), OrgVerificationStatus (PENDING, VERIFIED, REJECTED)
- **tRPC Router:** `org` — create, get, list, update, join, leave, getMembers, addMember, removeMember, requestVerification
- **Roles:** OWNER (full control), ADMIN (can manage members), MODERATOR/MEMBER (regular members)
- **Verification:** 500 SEK one-time fee; owner calls `org.requestVerification` → creates OrgVerification(PENDING) for manual review
- **Shared components:** `packages/app/src/` — OrgCard, OrgListScreen, OrgDetailScreen, OrgAdminScreen, CreateOrgScreen
- **Mobile:** Orgs tab at `apps/mobile/app/(tabs)/orgs.tsx`; detail at `/orgs/[orgId]`; admin at `/orgs/[orgId]/admin`
- **Web:** `/orgs`, `/orgs/create`, `/orgs/[orgId]`, `/orgs/[orgId]/admin`; Orgs nav link in layout

## ConsentVault (F14-SAFE-consent-vault)
- **Schema:** ConsentRecord, Recording, RecordingAccess, RecordingRevocation, PlaybackLog — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** ConsentStatus (PENDING, CONFIRMED, REVOKED), RecordingStatus (PROCESSING, READY, DELETED)
- **tRPC Router:** `consent` — initiate, confirm, getRecordings, revoke, delete, getUploadUrl, confirmUpload, getPlaybackToken, getStatus
- **Consent flow:** initiator calls `consent.initiate` (GPS + optional Bluetooth proof) → participant calls `consent.confirm` (Haversine GPS ≤100m check) → status=CONFIRMED → upload enabled
- **DRM pipeline:** `services/api/src/lib/drm.ts` — S3 presigned upload URL (SigV4), AWS MediaConvert CMAF+SPEKE job (Widevine + FairPlay via PallyCon), CloudFront signed streaming URL (24h)
- **Access control:** both parties must have active RecordingAccess to view; either party revoking removes their access; Recording marked DELETED when all accesses revoked
- **Forensic watermarking:** `services/api/src/lib/watermark.ts` — VideoSeal API embeds viewer ID + sessionId + timestamp; PlaybackLog records every playback session; graceful fallback on API failure
- **Webhook:** `POST /api/consent/mediaconvert-webhook` — SNS notification from MediaConvert; marks Recording READY + sets CloudFront drmUrl
- **Mobile screens:** `packages/app/src/` — ConsentVaultScreen, ConsentInitiateScreen, ConsentConfirmScreen, ConsentPlaybackScreen, useConsent hook
- **Mobile tab:** `apps/mobile/app/(tabs)/consent/` — "Vault" tab
- **Env vars required:**
  - `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
  - `S3_RECORDINGS_BUCKET` — S3 bucket for source uploads and packaged output
  - `MEDIACONVERT_ENDPOINT` — AWS MediaConvert account-specific endpoint
  - `MEDIACONVERT_ROLE_ARN` — IAM role ARN for MediaConvert
  - `PALLYCON_SITE_ID`, `PALLYCON_SITE_KEY` — PallyCon DRM credentials
  - `CLOUDFRONT_RECORDINGS_DOMAIN` — CloudFront domain for streaming
  - `CLOUDFRONT_KEY_PAIR_ID`, `CLOUDFRONT_PRIVATE_KEY` — CloudFront signing key
  - `VIDEOSEAL_API_URL`, `VIDEOSEAL_API_KEY` — VideoSeal forensic watermarking

## AI Coach Engine (F15-LEARN-coach-engine)
- **Python service:** `services/coach/` — LiveKit Agents worker (livekit-agents>=0.12), OpenAI Whisper-1 STT, GPT-4o-mini LLM, ElevenLabs TTS, Silero VAD
- **Personas:** `services/coach/personas.py` — `"coach"` (Axel, supportive older-brother coach, voice `ErXwobaYiN019PkySvjV`) and `"partner"` (Sophia, realistic Swedish practice partner, voice `21m00Tcm4TlvDq8ikWAM`); persona selected via room metadata `"coach_type"`
- **REST endpoint:** `POST /api/coach/token` — Bearer JWT auth, body `{ mode: 'voice'|'text', persona?: 'coach'|'partner' }`, returns `{ token, wsUrl, roomName, persona }`
- **Schema:** `CoachSession`, `SessionMessage` Prisma models; `CoachPersona`, `CoachMode`, `CoachSessionStatus` enums; `COACH_SESSION` added to `TokenTransactionType`
- **tRPC Router:** `coach` — `create`, `start`, `end`, `list`, `get`. Token billing: voice = 15 tokens/min, text = 2 tokens/min, minimum 1 min charged on `coach.end`
- **Shared components:** `packages/app/src/` — `CoachHistoryScreen`, `CoachStartScreen`, `CoachSessionScreen`, `useCoach` hook
- **Mobile:** Coach tab at `apps/mobile/app/(tabs)/coach/` — index (history), start, session
- **Web:** `/coach` (history), `/coach/start` (persona + mode select), `/coach/session` (active session with timer)
- **Env vars required:**
  - `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` — LiveKit server (coach service uses `LIVEKIT_URL`, API uses `LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET`/`LIVEKIT_WS_URL`)
  - `OPENAI_API_KEY` — Whisper STT + GPT-4o-mini LLM
  - `ELEVENLABS_API_KEY` — TTS voice synthesis

## Vanilla Coaching Modules (F16-LEARN-coach-vanilla)
- **Schema:** `LearnModule`, `Lesson`, `UserModuleProgress`, `UserLessonProgress` — Prisma models in `services/api/prisma/schema.prisma`
- **Module data:** 10 progressive modules (Overcome Fear → Masculine Leadership), orders 1-10; modules 1-3 unlocked by default (`isUnlocked: true`), 4-10 locked; each module has `badgeName` awarded on completion
- **Lesson data:** 35 lessons (3-4 per module) seeded via `services/api/prisma/seed.ts`; each lesson has `coachSystemPrompt` (Axel persona), `partnerSystemPrompt` (Sophia persona), `assessmentCriteria`
- **Unlock logic:** completing all lessons in a module (all `passed: true`) awards badge, sets `badgeAwardedAt`, and auto-unlocks the next module via `LearnModule.updateMany({ order: module.order + 1 })`
- **Migration:** `services/api/prisma/migrations/20260325100000_add_learn_modules/migration.sql`
- **tRPC Router:** `module` — `list` (all modules + user progress), `get` (module detail with lesson progress), `startLesson` (upsert UserLessonProgress), `completeLesson` (marks passed, awards badge if all done), `getProgress` (full user progress summary)
- **Shared components:** `packages/app/src/` — `LearnModuleListScreen`, `LearnModuleDetailScreen`, `LearnLessonScreen`, `useLearn` hook, `useLearnModule` hook
- **Mobile:** Learn tab at `apps/mobile/app/(tabs)/learn/` — index (module list), `[moduleId]` (detail), `[moduleId]/lesson/[lessonId]` (lesson + session launch)
- **Web:** `/learn` (module grid), `/learn/[moduleId]` (lesson table with Axel/Sophia action buttons), `/learn/[moduleId]/lesson/[lessonId]` (dual persona cards + assessment criteria)
- **Session integration:** lesson screens launch into existing F15 coach session — mobile via `router.push('/(tabs)/coach/start', { persona, lessonContext })`, web via `/coach/start?persona=X&context=Y`

## Spicy Coaching Modules (F17-LEARN-coach-spicy)
- **Gating:** Requires `Profile.spicyModeEnabled = true` AND completion of vanilla module 6 (badge awarded). Without both, spicy modules are hidden from `module.list` and `startLesson` throws FORBIDDEN.
- **Schema additions:** `Profile.spicyModeEnabled Boolean @default(false)` — `LearnModule.isSpicy Boolean @default(false)` — Migration: `services/api/prisma/migrations/20260325110000_add_spicy_mode/migration.sql`
- **Module data:** 8 spicy modules (orders 101-108, `isSpicy: true`, `isUnlocked: false`): Consent as Flirt, Dirty Talk (Basic + Advanced), Dominance with Respect, Physical Intimacy, BDSM Intro, Fantasy Communication, Giving Pleasure
- **Lesson data:** 19 lessons seeded — 3 per module for S1-S3 (full content with consent hesitation moments), 2 per module for S4-S8 (stub content); S6 lesson 2 includes full safeword drill ("röd" stops all roleplay; user must ask aftercare questions)
- **Consent integration:** S1-S3 partner prompts embed hesitation moments (Sophia pauses with "vänta lite", "hmm, jag vet inte"); Axel coach prompts evaluate whether user caught and responded to consent cues. Safeword drill in S6 requires immediate stop + two-question aftercare.
- **tRPC Router:** `module.list` filters isSpicy modules when spicyModeEnabled=false; `module.startLesson` checks spicy gating (not isUnlocked) for spicy modules; `profile.toggleSpicyMode` mutation enables/disables spicy mode
- **Shared components:** `SpicyGateBanner` (`packages/app/src/components/`) — shown when spicy is locked; `useLearn` hook updated with `vanillaModules`, `spicyModules`, `toggleSpicyMode`
- **Mobile:** `LearnModuleListScreen` has spicy section with gate banner or spicy module cards (🌶️ 18+ tag); `LearnLessonScreen` shows 18+ pill on spicy lessons; spicy toggle at `apps/mobile/app/(tabs)/profile/spicy-settings.tsx`
- **Web:** `/learn` spicy section with gate banner; `/learn/[moduleId]` and `/learn/.../lesson/[lessonId]` show 18+ badge when isSpicy; toggle at `/settings/spicy`; settings nav via `apps/web/app/(app)/settings/layout.tsx`

## Gamification (F18-LEARN-gamification)
- **Schema:** `Badge`, `Medal`, `UserBadge`, `UserMedal`, `UserStreak` — Prisma models in `services/api/prisma/schema.prisma`
- **Badge data:** 18 badges — one per module (10 vanilla orders 1-10, 8 spicy orders 101-108). Seeded via `services/api/prisma/seed.ts`. Badge keyed by `moduleOrder`.
- **Medal data:** 15 medals for individual merit achievements (streaks, volume, speed, behavioral). Keyed by `key` string (e.g. `brave_first_step`, `week_warrior`, `century_club`).
- **Award triggers:** `module.completeLesson` awards `UserBadge` on module completion (finds Badge by `moduleOrder`) and upserts `UserStreak` on every call (daysDiff=0 same day, daysDiff=1 increment, >1 reset).
- **tRPC Router:** `gamification` — `getBadges` (all badges + earned status), `getMedals` (all medals + earned status), `getLeaderboard` (anonymous percentile by badge count), `getStreak` (currentStreak, longestStreak, lastActivityAt)
- **Shared components:** `packages/app/src/` — `AchievementScreen`, `StreakWidget`, `useGamification` hook
- **Mobile:** Achievements page at `apps/mobile/app/(tabs)/learn/achievements.tsx`; trophy button in `LearnModuleListScreen` header navigates to it; streak widget shown on Learn tab
- **Web:** `/learn/achievements` — full achievements page; streak widget + link added to `/learn` page
- **Migration:** `services/api/prisma/migrations/20260326000000_add_gamification/migration.sql`

## Sexual Health Education (F19-LEARN-sexual-health)
- **Schema:** `EducationTopic`, `EducationArticle`, `EducationPodcast`, `EducationQuiz`, `UserArticleRead`, `UserQuizAttempt` — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** `EducationCategory` (8: ANATOMY, PLEASURE, STI_PREVENTION, MENTAL_HEALTH, RELATIONSHIPS, KINK_SAFETY, LGBTQ, AGING), `EducationAudience` (5: ALL, WOMEN, MEN, NON_BINARY, COUPLES)
- **Seed data:** 20 topics across all 8 categories seeded via `services/api/prisma/seed.ts` (Swedish titles/descriptions)
- **AI generation:** `services/api/src/lib/education-ai.ts` — Anthropic claude-sonnet-4-6 article generation; `services/api/scripts/generate-articles.ts` — batch-3 script, upserts by `topicId_audience_language`
- **Podcast generation:** `services/api/src/lib/podcast-generator.ts` — Claude script generation + ElevenLabs TTS (dual-voice, eleven_multilingual_v2) + R2 upload; `services/api/scripts/generate-podcasts.ts` — generates 1 test episode
- **tRPC Router:** `education` — `listTopics`, `listArticles`, `getArticle`, `listPodcasts`, `listQuizzes`, `getQuiz`, `submitQuiz` (score = correct/total × 100), `markArticleRead`
- **Shared components:** `packages/app/src/` — `EducationTopicListScreen`, `EducationArticleScreen`, `EducationPodcastScreen`, `EducationQuizScreen`, `useEducation` hook
- **Mobile:** Learn tab → `/learn/sexual-health` (topic browser with category filter); article at `/learn/article/[articleId]`
- **Web:** `/learn/sexual-health` (topic grid + category filter), `/learn/sexual-health/[topicSlug]` (articles + podcast tabs), `/learn/sexual-health/article/[articleId]` (reader), `/learn/sexual-health/quiz/[quizId]` (quiz); "Sexuell hälsa" card added to `/learn`
- **Migration:** `services/api/prisma/migrations/20260326120000_add_education_schema/migration.sql`
- **Env vars required:** `ANTHROPIC_API_KEY` — for article generation; `ELEVENLABS_API_KEY` — for podcast TTS

## Business Webshops (F21-SHOP-business)
- **Medusa.js v2:** Separate service at `services/medusa/` — headless e-commerce backend, admin dashboard at `shop-admin.lovelustre.com`
- **Helm chart:** `infrastructure/helm/medusa/` — deploys Medusa on k3s, port 9000, secrets from `lustre-secrets` (`database-url`, `redis-url`, `jwt-secret`)
- **Medusa client:** `services/api/src/lib/medusa-client.ts` — typed fetch wrapper calling `http://medusa:9000/store` with `x-publishable-api-key`
- **tRPC Router:** `shop` — `product.list` (public), `product.get` (public), `cart.add` (protected, upserts Medusa cart), `cart.checkout` (protected, completes Medusa cart)
- **Schema:** `ShopCart` model maps Lustre `userId` → Medusa `cartId` (one cart per user); migration `20260326230000_add_shop_cart`
- **Shared components:** `packages/app/src/` — `BusinessShopScreen` (product grid), `BusinessProductDetailScreen` (image gallery + add to cart), `useShop` hook (`useProducts`, `useProduct`, `useAddToCart`, `useCheckout`)
- **Mobile:** `apps/mobile/app/(tabs)/shop/business/` — `_layout.tsx` (Stack), `index.tsx` (grid), `[productId].tsx` (detail)
- **Web:** `apps/web/app/(app)/shop/business/` — `page.tsx` (grid + search), `[productId]/page.tsx` (detail), `layout.tsx` (floating cart button), `CartSidebar.tsx` (Swish checkout)
- **Env vars required:**
  - `MEDUSA_INTERNAL_URL` — internal URL for Medusa service (default: `http://medusa:9000`)
  - `MEDUSA_PUBLISHABLE_KEY` — Medusa publishable API key for storefront access
  - `MEDUSA_DATABASE_URL` — PostgreSQL connection string for Medusa schema

## Advertising Platform (F22-SHOP-advertising)
- **Schema:** `AdCampaign`, `AdTargeting`, `AdCreative`, `AdImpression`, `AdClick` — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** `CampaignStatus` (DRAFT, ACTIVE, PAUSED, EXHAUSTED, COMPLETED), `AdFormat` (FEED, STORY, EVENT_SPONSOR), `BillingModel` (CPM, CPC)
- **tRPC Router:** `ad` — `createCampaign`, `updateTargeting`, `addCreative`, `activateCampaign`, `pauseCampaign`, `getCampaigns`, `getAnalytics`, `recordImpression`, `recordClick`
- **Ad engine:** `services/api/src/lib/ad-engine.ts` — `selectAd(prisma, userId)`: fetches ACTIVE campaigns, matches targeting (gender, orientation, age, relationship type, kink tags — all AND logic), enforces 30-min frequency cap per campaign+user, atomically debits CPM budget via raw SQL (`UPDATE ... WHERE spent_sek + cost <= daily_budget_sek`), returns one random eligible creative or null
- **Feed injection:** `post.feed` calls `selectAd` and injects a synthetic ad item at position 5 (index 4). Feed items are now typed as `{type: 'post', ...} | {type: 'ad', campaignId, creativeId, headline, body, imageUrl, ctaUrl, sponsor}`
- **Advertiser dashboard (web):** `apps/web/app/(app)/ads/` — campaign list (`/ads/`), 3-step creation wizard (`/ads/create/`), campaign detail + analytics (`/ads/[campaignId]/`); all Swedish UI
- **Shared components:** `packages/app/src/` — `AdsManagerScreen`, `AdCreateScreen` (3-step: campaign → targeting → creative), `FeedAdCard` (cross-platform, "Sponsrad" label, fires `onImpression` on mount, fires `onImpression`/`onClick` to record mutations)
- **Feed ad display:** `FeedAdCard` integrated into `FeedScreen` (mobile) and `apps/web/app/(app)/home/page.tsx` (web); handles null body/imageUrl gracefully
- **Budget model:** CPM costs are debited per impression atomically; CPC costs debited on click; delivery stops when `spentSEK >= dailyBudgetSEK`
- **useAds hook:** `packages/app/src/hooks/useAds.ts` — `useCampaigns`, `useCreateCampaign`, `useUpdateTargeting`, `useAddCreative`, `useActivateCampaign`, `usePauseCampaign`, `useAnalytics`

## Content Moderation (F24-MOD-content-moderation)
- **Schema:** `MessageContentTag`, `Report`, `ModerationAction` — Prisma models in `services/api/prisma/schema.prisma`; `User` extended with `filteredSentCount`, `warningCount`, `isBanned`, `bannedUntil`
- **Enums:** `ReportTargetType` (MESSAGE, POST, PROFILE), `ReportCategory` (HARASSMENT, SPAM, UNDERAGE, NON_CONSENSUAL, OTHER), `ReportStatus` (PENDING, REVIEWED, DISMISSED), `ModerationActionType` (WARNING, TEMP_BAN, PERMANENT_BAN)
- **Sightengine extensions:** `services/api/src/lib/sightengine.ts` — `classifyAndTagMessage(messageId, imageUrl)` stores tags in `MessageContentTag`; `classifyMessageAsync()` fire-and-forget wrapper; `isDickPic(tags)` returns true when GENITALS (confidence>0.3) + FULL/PARTIAL nudity detected
- **Dick-pic filter:** `services/api/src/lib/chat-classifier.ts` — now persists `MessageContentTag` records per chat image; increments `User.filteredSentCount` each time a message is filtered
- **Auto-enforcement:** After each `filteredSentCount` increment: count===3 → WARNING, count===5 → 7-day TEMP_BAN, count===10 → PERMANENT_BAN; each creates a `ModerationAction` audit record with `adminId='00000000-0000-0000-0000-000000000001'` (system)
- **tRPC Router:** `report` — `create` (any user), `list` (admin, paginated, filterable by status), `resolve` (admin, sets REVIEWED/DISMISSED), `getContext` (admin, returns full message/post/profile context), `takeAction` (admin, applies WARNING/TEMP_BAN/PERMANENT_BAN to a user)
- **Admin access:** Controlled by `ADMIN_USER_IDS` env var (comma-separated UUIDs); procedures throw FORBIDDEN if caller not in list
- **Migration:** `services/api/prisma/migrations/20260327000000_f24_content_moderation/migration.sql`
- **Env vars required:**
  - `ADMIN_USER_IDS` — comma-separated UUIDs of admin users who can access moderation queue

## Rules
- All users verified via Swish 10 SEK + SPAR (Sweden); international expansion TBD
- Real names NEVER shown in app — stored encrypted, released only via court order
- Pay-as-you-go token model — no subscriptions, no visible prices in app
- Safety features (SafeDate, Gatekeeper for recipients) are always FREE
- Stripe cannot be used (bans adult) — use Segpay/CCBill + Swish
