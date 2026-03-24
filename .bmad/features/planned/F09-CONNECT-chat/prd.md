# PRD: Chat — E2E Encrypted Messaging, Ephemeral, Screenshot Blocking

## Overview

Real-time messaging using Elixir Phoenix Channels for WebSocket transport. E2E encryption for private messages, ephemeral message mode (auto-delete after timer), screenshot blocking (Android FLAG_SECURE, iOS detection), read receipts, typing indicators, and image/video sharing with content filters applied.

## Target Audience

All Lustre users communicating with matches/contacts

## Functional Requirements (FR)

### FR-1: Real-time Text Chat
- Priority: Must
- Acceptance criteria:
  - Given two matched users, when one sends a message, then the other receives it in real-time (< 500ms)
  - Given messages, then they are E2E encrypted (Signal protocol or simplified variant)

### FR-2: Typing Indicators & Read Receipts
- Priority: Must
- Acceptance criteria:
  - Given a user typing, then the other sees "typing..." indicator
  - Given read receipts enabled (both users), then message shows read timestamp

### FR-3: Media Messages
- Priority: Must
- Acceptance criteria:
  - Given image/video sent in chat, then content classification runs before delivery
  - Given recipient's dick-pic filter active, then matching images are blurred with opt-in reveal

### FR-4: Ephemeral Messages
- Priority: Should
- Acceptance criteria:
  - Given ephemeral mode enabled, when timer expires, then messages are deleted from both devices and server

### FR-5: Screenshot Blocking
- Priority: Should
- Acceptance criteria:
  - Given Android, when viewing chat, then FLAG_SECURE prevents screenshots/recording
  - Given iOS, when a screenshot is taken, then the other user is notified

## Non-Functional Requirements (NFR)

- Message delivery: < 500ms P95
- Phoenix Channels: handle 10K+ concurrent connections per node
- Messages retained 90 days after deletion (legal requirement), then purged

## MVP Scope

FR-1, FR-2, FR-3 are MVP. FR-4 and FR-5 are Phase 2.

## Risks and Dependencies

- Depends on F03 (Redis, NATS), F04 (profiles), F08 (matching for conversation creation)
- Elixir Phoenix service must be deployed alongside Fastify API
- E2E encryption adds complexity; can start with TLS + server-side encryption and add E2E later
