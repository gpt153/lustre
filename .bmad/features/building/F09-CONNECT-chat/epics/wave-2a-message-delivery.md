# Epic: wave-2a-message-delivery
**Model:** haiku
**Wave:** 2 — Group A (parallel)

## Goal
Implement send/receive messages via Phoenix Channel: persist messages to PostgreSQL via Fastify (NATS consumer), message status tracking (sent/delivered/read), and basic Phoenix Presence for online tracking.

## Context

### Existing code
- `services/realtime/lib/realtime_web/channels/conversation_channel.ex` — handles `conversation:*` channels, broadcasts `new_message` in-memory
- `services/api/src/trpc/conversation-router.ts` — `list` and `getMessages` procedures exist
- `services/api/src/lib/nats.ts` — NATS client available
- `services/api/src/lib/events.ts` — event publishing patterns
- Prisma `Message` model: `{ id, conversationId, senderId, content, type, status, mediaUrl, deletedAt, createdAt }`
- `MessageStatus` enum: SENT, DELIVERED, READ

### NATS pattern (from existing events.ts)
Read `/home/samuel/lustre/services/api/src/lib/events.ts` for existing NATS publishing pattern.
Read `/home/samuel/lustre/services/api/src/lib/nats.ts` for NATS client setup.

### Phoenix Presence
Phoenix ships with `Phoenix.Presence` — use it for online/offline tracking per user.

## Acceptance Criteria

1. `services/realtime/lib/realtime_web/channels/conversation_channel.ex` — when client pushes `"send_message"` event with `%{"content" => content, "type" => type}`, Phoenix:
   - Publishes a NATS message to subject `"chat.message.new"` with JSON: `{ conversationId, senderId, content, type, clientMsgId }` (where clientMsgId is optional idempotency key from client)
   - Broadcasts `"new_message"` to channel with `{ id: <temp_id>, conversationId, senderId, content, type, status: "SENT", createdAt }` immediately (optimistic)
   - Replies `{:ok, %{status: "sent"}}` to the sender

2. `services/realtime/lib/realtime/nats_client.ex` — Elixir NATS publisher using `Gnat` library:
   - `publish(subject, payload)` — publishes JSON-encoded payload to NATS subject
   - Connects using `NATS_URL` env var (parsed from `nats://host:port`)

3. `services/realtime/mix.exs` — add `{:gnat, "~> 1.8"}` to deps

4. `services/api/src/lib/chat-consumer.ts` — NATS JetStream consumer for `"chat.message.new"`:
   - Subscribes to `chat.message.new`
   - Persists `Message` to PostgreSQL via Prisma with correct fields
   - Returns the persisted message id back via NATS reply (if reply-to present)

5. `services/api/src/server.ts` — starts the chat NATS consumer on app startup (read this file first to see how server is structured)

6. `services/realtime/lib/realtime/presence.ex` — `Realtime.Presence` module using `Phoenix.Presence`

7. `services/realtime/lib/realtime_web/channels/user_channel.ex` — on join, track user presence via `Realtime.Presence.track(socket, user_id, %{online_at: DateTime.utc_now()})`; broadcast `"presence_diff"` to `user:{id}` channel

8. `services/api/src/trpc/conversation-router.ts` — add `updateMessageStatus` mutation:
   - input: `{ messageId: z.string().uuid(), status: z.enum(['DELIVERED', 'READ']) }`
   - verify sender is conversation participant
   - update `Message.status` in DB

## Files to Edit
- `services/realtime/lib/realtime_web/channels/conversation_channel.ex`
- `services/realtime/lib/realtime_web/channels/user_channel.ex`
- `services/realtime/mix.exs`
- `services/api/src/trpc/conversation-router.ts`
- `services/api/src/server.ts`

## Files to Create
- `services/realtime/lib/realtime/nats_client.ex`
- `services/realtime/lib/realtime/presence.ex`
- `services/api/src/lib/chat-consumer.ts`
