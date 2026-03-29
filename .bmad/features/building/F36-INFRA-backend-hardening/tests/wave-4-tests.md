# Test Spec: Wave 4 — Durable NATS Consumers

## Scope

Verify that fire-and-forget async calls are replaced with NATS JetStream durable consumers, that retries work with exponential backoff, that dead-letter subjects receive permanently failed messages, and that classification failure flags media as `needs_review`.

---

## T4.1: Message Publishing

**Tool:** Vitest
**File:** `services/api/src/__tests__/nats-publishers.test.ts`

### Unit Tests

1. **Photo upload publishes to JetStream** — Given a successful photo upload handler, when the upload completes, then `js.publish('lustre.media.classify', { mediaId, url, type: 'photo' })` is called (mock JetStream)
2. **Post upload publishes to JetStream** — Given a successful post media upload, when it completes, then a message is published to `lustre.media.classify` with `type: 'post'`
3. **Chat upload publishes to JetStream** — Given a chat media upload, when it completes, then a message is published to `lustre.media.classify` with `type: 'chat'`, `messageId`, and `conversationId`
4. **Profile create publishes to JetStream** — Given a profile creation/update, when it completes, then `js.publish('lustre.search.index', { profileId })` is called
5. **Publish payload is valid JSON** — Given any publish call, when the payload is serialized, then it parses as valid JSON with all required fields

---

## T4.2: Durable Consumer Behavior

**Tool:** Vitest + NATS test server (nats-server embedded or docker)
**File:** `services/api/src/__tests__/nats-consumers.test.ts`

### Unit Tests

1. **Consumer subscribes as durable** — Given the media classifier consumer, when it starts, then it subscribes to `lustre.media.classify` with durable name `media-classifier` and ack policy `explicit`
2. **Successful classification acks** — Given a message with a valid media URL, when classification succeeds, then `msg.ack()` is called
3. **Failed classification naks** — Given a message where Sightengine returns 500, when classification fails, then `msg.nak()` is called (triggers redelivery)
4. **Conservative fallback on max retries** — Given a message with `msg.info.numDelivered === 5` (max deliver), when the handler runs, then the media record is updated with `needsReview: true` and the message is acked (preventing further redelivery)

### Integration Tests

5. **End-to-end: publish → consume → classify** — Publish a message to `lustre.media.classify` with a mock Sightengine that succeeds. Assert the media record gets content tags within 5 seconds
6. **Retry with backoff** — Publish a message, mock Sightengine to fail twice then succeed. Assert the message is delivered 3 times and the final classification succeeds
7. **Dead letter queue** — Publish a message, mock Sightengine to always fail. After 5 delivery attempts, assert the message appears on `lustre.media.classify.dlq`
8. **Search indexing consumer** — Publish to `lustre.search.index`. Assert Meilisearch `updateDocuments` is called with the profile data

---

## T4.3: NATS Reconnect Backoff

**Tool:** Vitest
**File:** `services/api/src/__tests__/nats-reconnect.test.ts`

### Unit Tests

1. **reconnectDelayHandler configured** — Given the NATS connection options in `nats.ts`, when inspected, then `reconnectDelayHandler` is a function that returns increasing delays
2. **Backoff schedule** — Given the `reconnectDelayHandler`, when called with attempt 1 through 10, then delays increase exponentially from 250ms to max 30s with jitter

### Manual Verification

- [ ] Start API with NATS running. Stop NATS. Verify API logs show reconnect attempts with increasing delays
- [ ] Restart NATS. Verify API reconnects and consumers resume processing
- [ ] Upload a photo while NATS is down. Verify classification happens after NATS reconnects (message buffered or retried)
- [ ] Check JetStream stream info via `nats stream info LUSTRE_MEDIA` — verify retention and max age settings
- [ ] Check consumer info via `nats consumer info LUSTRE_MEDIA media-classifier` — verify durable name, ack policy, max deliver, backoff
