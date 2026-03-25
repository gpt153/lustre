# Epic: wave-2b-media-messages
**Model:** haiku
**Wave:** 2 — Group A (parallel)

## Goal
Support image/video upload in chat. Files go to Cloudflare R2, content classification is triggered (Sightengine), and images matching the recipient's dick-pic filter are flagged/blurred.

## Context

### Existing upload patterns
- `services/api/src/lib/r2.ts` — R2 upload client (read for patterns)
- `services/api/src/lib/sightengine.ts` — Sightengine classification (read for patterns)
- `services/api/src/lib/image.ts` — sharp image processing (read for patterns)
- `POST /api/posts/upload` in `services/api/src/server.ts` — existing multipart upload example (read)
- `UserContentFilter` model in Prisma — dick-pic filter stored here; `ContentPreference.NO_DICK_PICS` means block
- `ContentTag` model — used for posts; reuse classification logic

### Existing R2 pattern
R2 files stored with key pattern: `uploads/<userId>/<timestamp>-<filename>`
For chat: use `chat/<conversationId>/<userId>/<timestamp>-<filename>`

### Message model
`Message` has: `mediaUrl String? @map("media_url")`, `type MessageType` (TEXT, IMAGE, VIDEO)

## Acceptance Criteria

1. `services/api/src/server.ts` — add `POST /api/chat/upload` Fastify route:
   - Auth: Bearer JWT required (use existing auth pattern)
   - Multipart: accepts `file` field (image/jpeg, image/png, image/webp, video/mp4 — max 50MB)
   - For images: convert to WebP via sharp, generate thumbnails (small 100px, medium 400px, large 800px), upload all to R2 at `chat/<conversationId>/<userId>/<timestamp>-<name>.webp`
   - For videos: upload as-is to R2 (no transcoding)
   - Creates `Message` record with `type: IMAGE|VIDEO`, `mediaUrl: <r2_url>`, `status: SENT`
   - Triggers Sightengine classification fire-and-forget (don't await)
   - Returns `{ messageId, mediaUrl, type }`

2. `services/api/src/lib/chat-classifier.ts` — classification + filter application:
   - `classifyChatMedia(messageId: string, mediaUrl: string, conversationId: string)`:
     - Calls Sightengine with same nudity-2.1 / face-attributes-3.0 model
     - If nudity detected AND recipient has `ContentPreference.NO_DICK_PICS` filter:
       - Set `Message.mediaUrl` to a blurred placeholder flag (add boolean field or use a flagging approach)
       - Actually: add a `isFiltered Boolean @default(false) @map("is_filtered")` field to Message model in schema
     - Store classification result (just update the message metadata, no need for ContentTag here — keep it simple)

3. `services/api/prisma/schema.prisma` — add `isFiltered Boolean @default(false) @map("is_filtered")` to `Message` model

4. `services/api/prisma/migrations/<timestamp>_add_message_is_filtered/migration.sql` — migration adding the column

5. `services/api/src/trpc/conversation-router.ts` — add `revealFilteredMedia` mutation:
   - input: `{ messageId: z.string().uuid() }`
   - Sets `Message.isFiltered = false` for that message (opt-in reveal)
   - Only the recipient can call this (verify they're a participant and NOT the sender)

## Files to Edit
- `services/api/src/server.ts`
- `services/api/prisma/schema.prisma`
- `services/api/src/trpc/conversation-router.ts`

## Files to Create
- `services/api/src/lib/chat-classifier.ts`
- `services/api/prisma/migrations/<use timestamp 20260325000100>_add_message_is_filtered/migration.sql`
