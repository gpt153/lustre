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

## Events (F11-MEET-events)
- **Schema:** `Event`, `EventAttendee`, `EventTicket` — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** `EventType` (ONLINE, IRL, HYBRID), `EventStatus` (DRAFT, PUBLISHED, CANCELLED, COMPLETED), `AttendeeStatus` (GOING, WAITLIST, DECLINED), `TicketStatus` (VALID, USED, REFUNDED, CANCELLED)
- **PostGIS:** Event.location field (`geography(Point,4326)`) for proximity search via ST_DWithin
- **tRPC Router:** `event` — create, update, get, list, cancel, search (PostGIS), nearby (distance_km), calendar (grouped by date), listFiltered (type/date/location), recommended (AI scoring), rsvp, getAttendees, complete, purchaseTicket, checkTicketStatus, validateTicket, refundTicket
- **Targeting:** `matchesEventTargeting(profile, event)` — filters events by targetGenders, targetOrientations, targetAgeMin/Max; applied to all visibility queries
- **Ticketing:** `services/api/src/lib/event-tickets.ts` — Swish mTLS payment flow, creates EventTicket on purchase, auto-adds attendee on PAID callback
- **Discovery:** map-based proximity search, calendar view, AI scoring (IRL +3, 7-day recency +2, targeting match +1 per dimension)
- **Post-event suggestions:** `services/api/src/lib/post-event-suggestions.ts` — NATS `event.completed` consumer, suggests attendees to each other (opt-in via `Profile.allowPostEventSuggestions`)
- **Shared components:** `packages/app/src/` — EventCard, EventListScreen, EventDetailScreen, CreateEventScreen, useEvents hook
- **Mobile:** Events at `apps/mobile/app/(tabs)/events.tsx` and `apps/mobile/app/(tabs)/explore/events.tsx`
- **Web:** `/events` (list with type filters), `/events/[eventId]` (detail with RSVP/ticket), `/events/create` (creation form)

## Organizations (F12-MEET-organizations)
- **Schema:** Organization, OrgMember, OrgVerification — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** OrgType (CLUB, ASSOCIATION, BUSINESS, EVENT_COMPANY), OrgMemberRole (OWNER, ADMIN, MODERATOR, MEMBER), OrgVerificationStatus (PENDING, VERIFIED, REJECTED)
- **tRPC Router:** `org` — create, get, list, update, join, leave, getMembers, addMember, removeMember, requestVerification
- **Roles:** OWNER (full control), ADMIN (can manage members), MODERATOR/MEMBER (regular members)
- **Verification:** 500 SEK one-time fee; owner calls `org.requestVerification` → creates OrgVerification(PENDING) for manual review
- **Shared components:** `packages/app/src/` — OrgCard, OrgListScreen, OrgDetailScreen, OrgAdminScreen, CreateOrgScreen
- **Mobile:** Orgs tab at `apps/mobile/app/(tabs)/orgs.tsx`; detail at `/orgs/[orgId]`; admin at `/orgs/[orgId]/admin`
- **Web:** `/orgs`, `/orgs/create`, `/orgs/[orgId]`, `/orgs/[orgId]/admin`; Orgs nav link in layout

## SafeDate (F13-SAFE-safedate)
- **Schema:** `SafeDate`, `SafetyContact`, `GPSLog` — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** `SafeDateStatus` (ACTIVE, CHECKED_IN, ESCALATED, COMPLETED, CANCELLED)
- **tRPC Router:** `safedate` — activate, checkIn, cancel, complete, getActive, getHistory, logGPS, getLiveLocation, escalate
- **GPS encryption:** AES-256-GCM encrypted lat/lng at rest; `logGPS` stores IV as combined `"${ivLat}:${ivLng}"`; `getLiveLocation` uses full IV for both decrypts
- **Safety contacts:** Up to 3 per SafeDate; SMS escalation via Twilio when check-in missed after 5 min
- **Share token:** Unique token per SafeDate; safety contacts access live location at `/safe/[shareToken]` (public web view, no auth)
- **Rate limiting:** GPS log ingestion rate-limited to 1 per 5 seconds per SafeDate
- **Data retention:** GPS data scheduled for deletion 24h after SafeDate completion (unless escalated)
- **Free forever:** Zero token cost — safety features never charged
- **Shared components:** `packages/app/src/` — SafeDateActivateScreen, SafeDateActiveScreen, useSafeDate hook
- **Mobile:** SafeDate tab at `apps/mobile/app/(tabs)/safedate.tsx`; settings at `apps/mobile/app/(tabs)/profile/safedate.tsx`

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

## Token Payment System (F23-PAY-token-system)
- **Schema:** `UserBalance`, `TokenTransaction`, `SpreadConfig`, `SwishRecurringAgreement`, `SegpayCard`, `SegpayTransaction` — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** `TokenTransactionType` (GATEKEEPER, TOPUP, REFUND, COACH_SESSION, REFERRAL)
- **Token service:** `services/api/src/lib/tokens.ts` — `checkBalance`, `debitTokens` (atomic Prisma transaction), `creditTokens`. Balance stored as `Decimal(20,5)` for precision
- **tRPC Router:** `token` — `getBalance`, `getTransactions`, `topup`, `deduct`, `getSpreadConfig`, `setAutoTopup`
- **Spread pricing:** Default 3x markup on AI/hosting costs; configurable per user segment via `SpreadConfig` model (admin-only)
- **Auto-topup:** User sets threshold + amount; triggers Swish Recurring or Segpay charge when balance drops below threshold
- **Payment methods:** Swish Recurring (Swedish market, `SwishRecurringAgreement`), Segpay/CCBill (international, `SegpayCard` + `SegpayTransaction`)
- **Payment page:** Separate domain `pay.lovelustre.com` — balance display, topup, transaction history, payment settings
- **Web pages:** `apps/web/app/(pay)/pay/` — `page.tsx` (balance + history), `topup/page.tsx` (topup flow), `settings/page.tsx` (auto-topup + card management)
- **Service integration:** Gatekeeper (20 tokens), Coach (15 tokens/min voice, 2/min text), sender always pays
- **Design principle:** No prices visible in main app — "invisible" billing model

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

## Dual Mode — Vanilla/Spicy (F25-UX-dual-mode)
- **Mode field:** `Profile.spicyModeEnabled Boolean @default(false)` — source of truth (no separate model)
- **tRPC Router:** `settings` — `getMode` (query, returns `{ mode: 'vanilla' | 'spicy' }`), `setMode` (mutation, input `{ mode }`) — both protectedProcedure, reads/writes `Profile.spicyModeEnabled`
- **Zustand store:** `packages/app/src/stores/modeStore.ts` — `useModeStore` with `mode: 'vanilla' | 'spicy'` (default `'vanilla'`), persisted to `localStorage` via `'lustre-mode'` key
- **Hook:** `packages/app/src/hooks/useMode.ts` — `useMode()` returns `{ mode, setMode, isSpicy, isLoading }`; syncs remote→store on load; optimistic store update before tRPC mutation
- **API-level filtering:** Vanilla callers get SFW content only:
  - `post.feed` — excludes posts with any media having `nudityLevel IN (MEDIUM, HIGH)` via raw SQL
  - `match.getDiscoveryStack` — excludes profiles where `spicyModeEnabled = true` from discovery stack
  - `profile.getPublic` — returns `kinkTags: []` (hides kink tags) for vanilla callers
- **UI components:** `packages/app/src/components/ModeToggle.tsx` — pill toggle (🌿 Vanilla / 🌶️ Spicy, green/pink); `ModeWrapper.tsx` — conditional render by mode (uses `useModeStore` directly)
- **Mobile:** Mode toggle at `apps/mobile/app/(tabs)/profile/spicy-settings.tsx`
- **Web:** Mode settings at `apps/web/app/(app)/settings/spicy/page.tsx`; mode badge in `settings/layout.tsx`; learn page gates spicy section via `isSpicy`

## Admin Dashboard (F26-ADMIN-dashboard)
- **Admin app:** Separate Next.js 15 app at `apps/admin/` — runs on port 3001, deployed at `admin.lovelustre.com`
- **Auth:** Email/password login via `trpc.auth.loginWithEmail`; JWT stored in `localStorage('admin_token')`; `AdminGuard` redirects to `/login` if missing
- **Admin identity:** Controlled by `ADMIN_USER_IDS` env var (comma-separated UUIDs) — no DB role; `adminProcedure` middleware in `services/api/src/trpc/middleware.ts` enforces this
- **tRPC router:** `admin` namespace in `services/api/src/trpc/admin-router.ts`:
  - User management: `searchUsers` (raw SQL, joins profiles), `getUser`, `suspendUser` (TEMP_BAN), `banUser` (PERMANENT_BAN)
  - Moderation: `getReports`, `resolveReport`
  - Analytics: `getOverview` (DAU/MAU/totalUsers/pendingReports), `getRegistrations`, `getGenderRatio`, `getRevenue`, `getAiCosts`
- **Admin pages:** `/login`, `/users` (search + suspend/ban), `/users/[userId]` (detail + history), `/reports` (filter by status + resolve), `/analytics` (stats cards, tables, 7/30/90d selector)
- **Admin seed:** `services/api/prisma/seed.ts` — seeds admin user via raw SQL (id `00000000-0000-0000-0000-000000000001`, email `admin@lovelustre.com`, password `admin123`)
- **Umami analytics:** Self-hosted at `umami.lovelustre.com`; Helm chart at `infrastructure/helm/umami/`; tracking script in `apps/web/app/layout.tsx` (env: `NEXT_PUBLIC_UMAMI_URL`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID`)
- **Note:** `report-router.ts` uses `adminProcedure` from middleware (refactored from local `assertAdmin` helper in F26)
- **Env vars required:**
  - `ADMIN_USER_IDS` — comma-separated UUIDs of admin users

## Growth & Migration (F27-GROWTH-migration)
- **Landing page:** `apps/web/app/(landing)/` — existing page with hero, email signup (waitlist), vanilla/spicy mode toggle. `countdown.tsx` adds countdown timer to 2026-05-01T12:00:00Z with Swedish labels; renders above `WaitlistForm` in the hero section
- **Waitlist API:** `apps/web/app/api/waitlist/route.ts` — Next.js route handler, POSTs `{ email, mode }` to raw PostgreSQL `waitlist` table, returns `{ position }`
- **Onboarding tracking:** `packages/app/src/components/OnboardingWizard.tsx` — accepts optional `onStep?: (step: number, stepName: string) => void` callback (steps: 1=basics, 2=identity, 3=preferences, 4=photos, 5=bio, 6=complete). Web onboarding page (`apps/web/app/(app)/onboarding/page.tsx`) fires `window.umami?.track('onboarding_step', { step, stepName })` and `window.umami?.track('onboarding_complete')` via this callback
- **BodyContact import:** `services/api/src/trpc/migration-router.ts` — `migration.previewBodyContact` (query): fetches `https://www.bodycontact.com/profiles/{username}` with cheerio HTML parsing, returns `{ username, bio, photoUrls[] }`. `migration.importBodyContact` (mutation, requires `consent: true`): updates `Profile.bio`, fetches photos, converts via sharp to WebP (800×800 max), uploads to R2 at `profiles/{userId}/imported-{n}.webp`, creates `ProfilePhoto` records. Web UI at `/settings/migration`
- **Invite system:** `services/api/src/trpc/invite-router.ts` — `invite.generate` creates `InviteLink` with nanoid(8) code; `invite.claim` credits 100 tokens to referrer + 50 to referee via `creditTokens(…, 'REFERRAL')`; `invite.getMyLinks` + `invite.getRewards` for stats. Schema: `InviteLink`, `ReferralReward` models + `REFERRAL` added to `TokenTransactionType` enum. Migration: `20260327100000_f27_invite_system`. Web: `/invite` (protected), `/invite/[code]` (public landing → `/auth/register?invite=CODE`)
- **Shared components:** `packages/app/src/` — `MigrationScreen`, `useMigration`, `InviteScreen`, `useInvite`
- **Deps added:** `cheerio ^1.0.0`, `nanoid ^5.0.0` in `services/api/package.json`

## Kudos / Reputation (F28-CONNECT-kudos)
- **Schema:** `KudosBadgeCategory`, `KudosBadge`, `Kudos`, `KudosBadgeSelection`, `KudosPrompt` — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** `KudosPromptStatus` (PENDING, COMPLETED, DISMISSED)
- **Badge data:** 24 badges across 5 categories (Kommunikation, Respekt & trygghet, IRL-möten, Generellt, Spicy) seeded via `services/api/prisma/seed-badges.ts`. Spicy badges have `spicyOnly: true`
- **tRPC Router:** `kudos` — `listBadges` (cached in Redis, spicy-filtered), `give` (rate-limited 10/24h, deduplicated per interaction), `getProfileKudos` (aggregated badge counts), `suggestBadges` (AI-powered), `getPendingPrompts`, `dismissPrompt`
- **AI badge suggestion:** `services/api/src/lib/kudos-ai.ts` — OpenAI GPT-4o-mini, Swedish prompt, returns 2-4 badge IDs from free text. Free text NEVER persisted
- **NATS trigger:** `services/api/src/lib/kudos-consumer.ts` — subscribes `match.conversation.archived`, creates bidirectional KudosPrompt records (7-day expiry)
- **Redis:** Badge catalog cache (`kudos:badges:catalog`, 1h TTL), rate limiting (`kudos:ratelimit:{userId}`, 24h window)
- **Gatekeeper integration:** `gatekeeper-ai.ts` `buildSystemPrompt()` accepts `kudosScore` — users with score >50 noted as "trusted community member"
- **Milestone events:** NATS events `lustre.kudos.milestone.first`, `.10`, `.50` emitted on kudos receipt (idempotent)
- **Shared components:** `packages/app/src/` — `KudosPromptSheet`, `BadgeSelectionScreen`, `ProfileKudosSection`, `useKudos` hook
- **Shared UI:** `packages/ui/src/KudosBadgeTag.tsx`
- **Mobile:** KudosPromptSheet appears on chat tab; BadgeSelectionScreen for badge picking; ProfileKudosSection integrated into profile view
- **Web:** `/kudos/give/[recipientId]` (badge selection page), kudos modal in `/chat`, kudos section in `/profile/[userId]`
- **Migrations:** `20260326230000_add_kudos_schema`, `20260327110000_add_kudos_prompts`

## Intentions-based Discovery (F29-CONNECT-intentions)
- **Schema:** `Intention`, `IntentionKinkTag` — Prisma models in `services/api/prisma/schema.prisma`
- **Enums:** `IntentionStatus` (ACTIVE, PAUSED, EXPIRED, DELETED), `IntentionSeeking` (CASUAL, RELATIONSHIP, FRIENDSHIP, EXPLORATION, EVENT, OTHER), `IntentionAvailability` (WEEKDAYS, WEEKENDS, FLEXIBLE)
- **tRPC Router:** `intention` — create, update, pause, resume, delete, list, get, getFeed. Max 3 active per user. 30-day expiry with lazy expiry check. Kink tags gated on spicyModeEnabled.
- **Scoring engine:** `services/api/src/lib/intention-scoring.ts` — 6-factor weighted score (seeking 25%, gender/orientation 20%, age 15%, distance 15%, availability 10%, kink 15%). Mutual boost 1.2x. Final ranking: 70% intention + 15% gatekeeper + 15% kudos.
- **Redis indexing:** `services/api/src/lib/intention-index.ts` — sorted sets keyed by `intentions:seeking:{type}:gender:{gender}`, score = expiresAt timestamp. Updated on create/update/pause/resume/delete.
- **Feed generation:** `services/api/src/lib/intention-feed.ts` — per-Intention feed with Redis index lookup, Kvinnor-forst enforcement (males must have reciprocal active Intention), seen-list exclusion, cursor pagination, cold-start fallback (isFallback=true from swipe pool when <5 results).
- **Shared components:** `packages/app/src/` — CreateIntentionScreen, IntentionListScreen, IntentionFeedScreen, IntentionProfileCard, useIntentions hook
- **Mobile:** Discover tab at `apps/mobile/app/(tabs)/discover.tsx` — Intentions is default tab, with sub-views (list, create, feed). Also Swipe, Matchningar, Sök tabs.
- **Web:** `/discover/intentions` (dashboard), `/discover/intentions/new` (create), `/discover/intentions/[intentionId]` (feed), `/discover/intentions/[intentionId]/edit` (edit)
- **Shared UI:** `packages/ui/src/IntentionProfileCard.tsx` — intent-first card (score badge → tags → bio → photo)

## Design System (F31-UX-design-system)
- **Design tokens:** `packages/ui/src/tokens.ts` — 12 brand colors (copper #B87333, gold #D4A843, warmWhite #FDF8F3, charcoal #2C2421, etc.), shadow tokens
- **Themes:** `packages/ui/src/themes.ts` — 4 variants: light_vanilla, light_spicy, dark_vanilla, dark_spicy. Copper/gold accents throughout.
- **Typography:** `packages/ui/src/fonts/` — General Sans (headings), Inter (body). Expo loader (`expo-loader.ts`), Next.js loader (`next-loader.ts`)
- **Logo:** `packages/ui/src/LustreLogo.tsx`, `LogoBrand.tsx` — PNG assets with brand text
- **Core components:** `packages/ui/src/` — CardBase (copper shadow), LustreButton (gold/copper/ember variants), LustreInput (copper focus glow), ModalBase (spring animation), BottomSheetBase (slide-up spring)
- **Tamagui config:** `packages/ui/src/tamagui.config.ts` — all tokens and themes wired
- **Mobile nav:** `apps/mobile/app/(tabs)/_layout.tsx` — 5 bottom tabs (Discover, Connect, Explore, Learn, Profile) with copper active tint
- **Web header:** `apps/web/app/(app)/components/Header.tsx` — glassmorphism styling with backdrop-filter blur
- **Swipe mechanics:** `packages/app/src/hooks/useSwipeGesture.ts` — Reanimated 3 gesture handling with spring physics
- **Profile redesign:** `ProfilePrompt` Prisma model, scrollable photo+prompt layout, prompt CRUD in profile router
- **Haptics:** `packages/app/src/hooks/useHaptics.ts` — expo-haptics with Platform detection and web fallback
- **Match animation:** `packages/app/src/components/MatchAnimation.tsx` — Lottie animation with scale+opacity fallback

## UX Design Excellence — Native Mobile (F32-UX-design-excellence)
- **Platform:** Expo/React Native only (web is F33)
- **Design tokens (native):** `packages/tokens/` — `spacing.ts` (xs=4, sm=8, md=16, lg=24, xl=32, xxl=48), `colors.ts` (copper, gold, warmWhite, charcoal + 4 mode-specific palettes), `shadows.ts` (sm/md/lg/xl with iOS shadow + Android elevation). Re-exported at `apps/mobile/constants/tokens.ts`
- **Animation constants:** `apps/mobile/constants/animations.ts` — SPRING configs (default, snappy, gentle, bouncy, stiff, rubber), TIMING, INTERACTION, REDUCED_MOTION fallbacks
- **Skeleton loaders:** `apps/mobile/components/Skeleton.tsx` (Box, Text, Circle with Reanimated shimmer via MaskedView + expo-linear-gradient). Screen-specific: `skeletons/DiscoverSkeleton.tsx`, `ChatListSkeleton.tsx`, `ProfileSkeleton.tsx`, `FeedSkeleton.tsx`
- **Toast system:** `apps/mobile/components/Toast.tsx` + `ToastContainer.tsx` — Reanimated spring enter, Gesture.Pan swipe-to-dismiss, 4 variants. Store: `packages/app/src/stores/toastStore.ts` (Zustand, callable outside React)
- **Empty states:** `apps/mobile/components/EmptyState.tsx` — centered layout with illustration + CTA. 8 SVG illustrations in `components/illustrations/`
- **Form validation:** `apps/mobile/components/LustreInput.tsx` (interpolateColor border), `ValidatedForm.tsx` (react-hook-form + zod), `hooks/useFormShake.ts`
- **Icons:** `apps/mobile/components/LustreIcon.tsx` — phosphor-react-native wrapper (sm:16, md:20, lg:24, xl:32)
- **Accessibility:** `apps/mobile/components/AnimatedPressable.tsx` (required a11y props, 44pt touch targets, spring scale + optional liftOnPress), `AccessibleModal.tsx` (focus management), `hooks/useAccessibility.ts` (reducedMotion, screenReaderEnabled, getSpring)
- **Profile Card Story:** `apps/mobile/components/ProfileCardStory.tsx` — story-format with Gesture.Race(Tap, Pan, LongPress), Ken Burns zoom, progress bar. Hooks: `useStoryNavigation.ts`, `useKenBurns.ts`
- **Mode Transformation:** `apps/mobile/components/ModeTransition.tsx` + `ModeToggle.tsx` — Reanimated interpolateColor vanilla↔spicy full-UI morph. Hook: `hooks/useModeTransform.ts`
- **Match Ceremony:** `apps/mobile/components/MatchCeremony.tsx` — Skia particles (`SkiaParticles.tsx`), glassmorphism frames (`GlassmorphismFrame.tsx`), haptic sequence. Hooks: `useMatchCeremony.ts`, `useParticles.ts`
- **Copper Pick:** `apps/mobile/components/CopperPick.tsx` + `CopperPickBadge.tsx` — cinematic daily recommendation, Ken Burns, no swipe. Hook: `useCopperPick.ts`
- **Consent Ceremony:** `apps/mobile/components/ConsentCeremony.tsx` + `ConsentItem.tsx` + `ConsentRing.tsx` + `SafeDateShield.tsx` — Skia ring, staggered items, partner sync. Hook: `useConsentCeremony.ts`
- **Micro-interactions:** `hooks/usePressAnimation.ts`, `hooks/useLongPress.ts` (Gesture.LongPress + haptic), `hooks/useDoubleTap.ts` (Gesture.Tap×2 + haptic)
- **Parallax:** `hooks/useParallax.ts` (scroll-driven via useAnimatedScrollHandler), `components/ParallaxHeader.tsx` (Ken Burns + gradient overlay)
- **Haptics:** `constants/haptics.ts` — 9 patterns (tap, impact, heavy, success, warning, error, selection, doublePulse, risingSequence). `hooks/useLustreHaptics.ts` — auto-disabled on reducedMotion
- **Ambient animations:** `hooks/useAmbientAnimation.ts` (looping progress SharedValue), `components/AmbientGradient.tsx` (Skia breathing gradient), `ParticleField.tsx` (drifting particles), `PaperGrain.tsx` (Skia fractal noise texture)
- **Sound design:** `constants/sounds.ts` (5 keys: match, like, message, modeSwitch, ceremony), `hooks/useSound.ts` (lazy-load, iOS mute respect, volume control). Assets: `assets/sounds/`
- **Key deps:** react-native-reanimated 3, react-native-gesture-handler 2, @shopify/react-native-skia, phosphor-react-native, expo-blur, expo-haptics, expo-linear-gradient, react-native-svg, expo-av

## Web App — Next.js (F33-WEB-webapp)
- **Platform:** Next.js 15 App Router, CSS Modules (no Tamagui on web)
- **Design tokens:** `apps/web/styles/tokens.css` — CSS custom properties: copper (#B87333), gold (#D4A843), warmWhite (#FDF8F3), charcoal (#2C2421), sage (#7A9E7E), ember (#C85A3A). 4 theme variants (light/dark × vanilla/spicy) via `data-theme` and `data-mode` attributes on `<html>`
- **Spring animations:** `--spring` and `--spring-soft` CSS `linear()` functions for physical spring easing
- **Layout:** Three-zone CSS Grid (72px nav rail + flexible main 720px max + 320px context panel), responsive breakpoints at 1440/1200/900/600px
- **Typography:** `apps/web/styles/typography.css` — 5 type classes: text-hero (48px), text-section (28px), text-card-title (18px), text-body (15px), text-muted (13px)
- **Components:** `apps/web/components/common/` — Card, Button, Input, Modal, Toast, Skeleton, EmptyState, CommandPalette, ShortcutOverlay, ModeSwitch, ThemeSwitch, AppOnlyPrompt
- **Layout components:** `apps/web/components/layout/` — AppShell, Header (glassmorphism), NavRail, ContextPanel, BottomNav, KeyboardShortcutsProvider, PageTransition
- **Page components:** `apps/web/components/` — discover/ (DiscoverGrid, ProfileCard, FilterSidebar), chat/ (ChatLayout, ConversationList, ChatRoom, MessageBubble, MessageInput), profile/ (ProfileView, ProfileEdit, PhotoGrid, PromptCard), feed/ (FeedList, PostCard, PostComposer, CommentSection), events/ (EventCard), groups/ (GroupCard), learn/ (ModuleCard), achievements/ (AchievementBadge, StreakCounter), marketplace/ (ProductCard, ProductDetail, ListingForm), settings/ (SettingsSidebar, Toggle, sections/*)
- **Hooks:** `apps/web/hooks/` — useKeyboardShortcuts, useCommandPalette, useBreakpoint, useDiscoverKeyboard, useTheme, useSound, useCallGate
- **Lib:** `apps/web/lib/` — sound-manager.ts (Web Audio API), app-store-links.ts (platform detection), analytics.ts (Umami tracking)
- **Warm UI:** Paper grain texture, breathing copper gradient, noise overlay on elevated surfaces, nav micro-interactions, button press pulse, sound effects (like/match/message/send)
- **Mode switch:** CSS `@property` registration for `--accent-h/s/l` enables 600ms smooth HSL interpolation between vanilla (sage) and spicy (ember)
- **App-only features:** ConsentVault, SafeDate, spicy MEDIUM/HIGH content, voice/video calls show "Öppna i appen" prompts
- **tsconfig paths:** `@/*` → `./app/*`, `@/components/*` → `./components/*`, `@/hooks/*` → `./hooks/*`, `@/styles/*` → `./styles/*`, `@/lib/*` → `./lib/*`
- **Import pattern:** Always use EXPLICIT file imports (e.g. `from '@/components/common/Button'`), never barrel imports
- **First-load JS:** 102KB shared (budget <200KB)

## Rules
- All users verified via Swish 10 SEK + SPAR (Sweden); international expansion TBD
- Real names NEVER shown in app — stored encrypted, released only via court order
- Pay-as-you-go token model — no subscriptions, no visible prices in app
- Safety features (SafeDate, Gatekeeper for recipients) are always FREE
- Stripe cannot be used (bans adult) — use Segpay/CCBill + Swish

## Snotra Webhook Integration — APK-leverans & Build-notifikationer

Snotra HQ (https://snotra.153.se) är Samuels kommandocentral. **ALLA build-notifikationer och APK-leveranser går via Snotra.**

### APK-leverans (VIKTIGAST)
När en APK byggts, skicka den till Snotra som SCP:ar filen och gör den nedladdningsbar på Samuels telefon:

```bash
~/bin/notify-snotra.sh apk_ready <feature> --apk /home/samuel/lustre/apps/mobile/android/app/build/outputs/apk/release/app-release.apk --message "Lustre APK v0.1.0 — <beskrivning>"
```

**Vad händer:** Snotra kopierar APK:n (SCP), genererar en publik nedladdningslänk (https://snotra.153.se/api/artifacts/...) och postar den som klickbar länk i Lustre-rummet på Snotra HQ. Samuel öppnar länken på mobilen → Android installerar.

**DU BEHÖVER INTE:**
- Sätta upp egna nedladdningslänkar
- Föreslå USB/ADB/Cloudflare tunnel
- Fråga hur Samuel vill ha APK:n

**BARA KÖR:** `~/bin/notify-snotra.sh apk_ready ...` med rätt `--apk` sökväg. Snotra sköter resten.

### Build-notifikationer
```bash
# Efter varje wave i /bygg:
~/bin/notify-snotra.sh wave_complete <feature> --wave 3 --total 5 --message "Alla tester OK"

# När hela bygget är klart:
~/bin/notify-snotra.sh build_complete <feature> --message "Feature X klar"

# Vid deploy:
~/bin/notify-snotra.sh deploy_complete <feature> --message "Deployed"

# Vid fel:
~/bin/notify-snotra.sh error <feature> --status failed --message "Build failed: ..."
```

### Regler
- **ALLTID** kör notify-snotra.sh efter varje wave, deploy, APK-build eller fel
- **ALLTID** inkludera `--apk <sökväg>` vid apk_ready — utan den finns ingen nedladdningslänk
- APK-sökvägen för detta projekt: `/home/samuel/lustre/apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
- Allt hamnar i Lustre-rummet på Snotra HQ automatiskt

## Google Stitch — AI Design Workflow

### Vad ar Stitch?
Google Stitch (stitch.withgoogle.com) ar ett gratis AI-designverktyg som genererar high-fidelity UI fran text, bilder eller rost. Det ar kopplat till detta projekt via MCP-server och SDK.

### Setup
- **MCP-server:** `stitch-mcp` — konfigurerad i `~/.claude/settings.json`, startar automatiskt
- **SDK:** `@google/stitch-sdk` installerat i `/home/samuel/stitch-workspace/`
- **API-nyckel:** Env var `STITCH_API_KEY` (satt i `.bashrc`)
- **Kommando:** `/stitch` — fullstandig guide for Stitch-arbetsflode

### Workflow: Design med Stitch

**Ny skarm:**
1. Anvandaren beskriver vad de vill ha (t.ex. "profil-skarmen med match-procent")
2. Generera i Stitch via MCP (`build_site` eller `get_screen_code`)
3. Konvertera Stitch HTML -> Tamagui-komponenter (ALDRIG anvand ratt HTML i mobilappen)
4. Mappa Stitch-farger -> Lustre-tokens (Copper, Gold, Warmwhite, etc.)
5. Placera: shared screens i `packages/app/src/`, UI i `packages/ui/`

**Forbattra befintlig skarm:**
1. Ta screenshot av nuvarande skarm
2. Skicka till Stitch som bild -> fa forbattrad design
3. Valj variant: REFINE (smajustering) / EXPLORE (nya riktningar) / REIMAGINE (helt nytt)
4. Konvertera vald design till Tamagui-kod

**DESIGN.md-export:**
1. Exportera DESIGN.md fran Stitch (designsystem som markdown)
2. Jamfor med Lustres designsystem
3. Mappa tokens: Stitch -> Tamagui theme tokens
4. Implementera konsistent over alla skarmar

### Regler
- **Mobile-first:** Generera ALLTID for `MOBILE` device type forst
- **Tamagui-konvertering:** Stitch ger HTML/CSS — konvertera till Tamagui-komponenter for mobilappen
- **Fargmappning:** Behall Lustres fargpalett, mappa Stitch-output till befintliga tokens
- **Accessibility:** Kolla WCAG-kontrast efter konvertering (Stitch missar ofta detta)
- **Guida anvandaren:** Nar anvandaren vill designa, foreslA att anvanda Stitch-workflowen. Forklara stegen, fraga vad de vill designa, och kor flodet. Anvandaren ska inte behova komma ihag hur Stitch funkar — du guider.
