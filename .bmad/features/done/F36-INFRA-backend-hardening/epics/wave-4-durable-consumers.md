# Epic: wave-4-durable-consumers

**Model:** sonnet
**Wave:** 4

## Description

Replace all fire-and-forget async calls (`fn().catch(() => {})`) with NATS JetStream durable consumers. Create JetStream streams for media classification and search indexing. Each consumer has exponential backoff retry (5 attempts: 1s, 5s, 30s, 120s, 600s) and a dead-letter subject for permanently failed messages. When content classification fails after all retries, media is flagged as `needs_review` (conservative fallback) instead of passing unfiltered. Also fix NATS reconnect to use `reconnectDelayHandler` with exponential backoff.

## Acceptance Criteria

1. Given a photo/post upload in `server.ts`, when `classifyAndTagMedia` was previously called as fire-and-forget, then it now publishes a message to `lustre.media.classify` JetStream subject with payload `{ mediaId, url, type: 'photo'|'post' }`
2. Given a chat media upload, when `classifyChatMedia` was previously called as fire-and-forget, then it now publishes to `lustre.media.classify` with payload `{ mediaId, url, type: 'chat', messageId, conversationId }`
3. Given a profile create/update, when `indexProfile` was previously called as fire-and-forget, then it now publishes to `lustre.search.index` with payload `{ profileId }`
4. Given a `media-classifier` durable consumer, when subscribed to `lustre.media.classify`, then it processes messages by calling the existing classification functions and acknowledges on success
5. Given a classification failure (Sightengine API timeout/error), when the consumer NAKs, then JetStream redelivers with backoff schedule: 1s, 5s, 30s, 120s, 600s (maxDeliver=5)
6. Given a message that fails all 5 delivery attempts, when maxDeliver is exceeded, then the message is republished to `lustre.media.classify.dlq` and the media record is updated with `needsReview: true`
7. Given the `ProfilePhoto` and `PostMedia` models, when a new `needsReview Boolean @default(false)` field is added, then media flagged as `needs_review` can be queried by admins
8. Given the NATS connection in `services/api/src/lib/nats.ts`, when `reconnectDelayHandler` is configured, then reconnect attempts use exponential backoff (starting at 250ms, max 30s, with jitter)
9. Given JetStream stream configuration, when the `LUSTRE_MEDIA` stream is created, then it covers subjects `lustre.media.>` with retention policy `Limits`, max age 7 days, and max bytes 1GB
10. Given JetStream stream configuration, when the `LUSTRE_SEARCH` stream is created, then it covers subjects `lustre.search.>` with the same retention policy

## File Paths

- `services/api/src/server.ts`
- `services/api/src/lib/nats.ts`
- `services/api/src/lib/sightengine.ts`
- `services/api/src/lib/chat-classifier.ts`
- `services/api/src/lib/meilisearch.ts`
- `services/api/prisma/schema.prisma`
