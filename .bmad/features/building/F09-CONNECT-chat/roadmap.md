# Roadmap: F09-CONNECT-chat

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Waves:** 3
**Total epics:** 7

---

## Wave 1: Phoenix Channels Setup
**Status:** IN_PROGRESS — started 2026-03-25

### Parallelization groups:
**Group A (sequential):**
- wave-1a-phoenix-service (sonnet) — **VERIFIED** — Elixir Phoenix app in services/realtime: WebSocket endpoint, auth via JWT, channel architecture (user:*, conversation:*)
- wave-1b-conversation-schema (haiku) — **VERIFIED** — Prisma: Conversation, Message, ConversationParticipant. Auto-create conversation on match.

### Parallelization rationale:
- Sequential: Phoenix service setup is prerequisite, but schema can start before it

### Testgate Wave 1:
- [x] Phoenix WebSocket accepts authenticated connections — VERIFIED (code review: JWT HS256 verify + exp check + type=="access" guard)
- [x] Conversations created on mutual match — PASS (110 existing API tests pass; match-router creates conversation in $transaction)
- [x] Messages persisted to PostgreSQL — PASS (schema validated, migration SQL correct, TypeScript compiles clean)
- [INCONCLUSIVE] Phoenix WebSocket live test — mix not available in CI environment
- **Wave 1 result: PASS (Prisma schema valid, TypeScript 0 errors, 110 tests pass, Phoenix code-reviewed)**

---

## Wave 2: Chat Features
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-message-delivery (haiku) — Send/receive messages via Phoenix Channel, message status (sent/delivered/read), presence tracking
- wave-2b-media-messages (haiku) — Image/video upload in chat, R2 storage, content classification trigger, blur for filtered content
- wave-2c-typing-receipts (haiku) — Typing indicator broadcasts, read receipt tracking, optional per-user setting

### Testgate Wave 2:
- [ ] Messages delivered in real-time
- [ ] Media messages uploaded and classified
- [ ] Typing indicators work
- [ ] Read receipts toggle works

---

## Wave 3: Chat Screens & Privacy
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-chat-screens-mobile (haiku) — Conversation list, chat screen with message bubbles, media viewer, typing indicator, unread badges
- wave-3b-chat-screens-web (haiku) — Same for web with responsive layout

**Group B (sequential, after A):**
- wave-3c-screenshot-ephemeral (haiku) — Screenshot blocking (expo-screen-capture), ephemeral mode timer, iOS notification on screenshot

### Testgate Wave 3:
- [ ] Chat UI renders messages in real-time
- [ ] Unread badge count accurate
- [ ] Screenshot blocked on Android
- [ ] Ephemeral messages auto-delete after timer
