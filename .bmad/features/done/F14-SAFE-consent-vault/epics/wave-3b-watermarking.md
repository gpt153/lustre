# Epic: wave-3b-watermarking
**Model:** haiku
**Wave:** 3
**Group:** A (parallel with wave-3a)

## Goal
VideoSeal integration for forensic watermarking on playback — embed invisible watermark containing viewer ID, session ID, and timestamp into the video stream.

## Acceptance Criteria
1. `src/lib/watermark.ts` exports `embedWatermark(userId: string, recordingId: string, sessionId: string): Promise<{ watermarkedUrl: string }>` — calls VideoSeal API to create a personalized variant
2. `consent.getPlaybackToken` (in consent-router.ts) updated to call `embedWatermark` before returning streamingUrl — returns watermarked URL instead of raw CloudFront URL
3. `WatermarkPayload` type: `{ userId, recordingId, sessionId, timestamp }` serialized as JSON then base64 encoded
4. VideoSeal API call: POST to `VIDEOSEAL_API_URL` with `{ source_url, watermark_data, output_key }` — returns `{ output_url }`
5. Fallback: if VideoSeal API fails, log warning and return original streamingUrl (watermarking non-blocking)
6. Env vars required: `VIDEOSEAL_API_URL`, `VIDEOSEAL_API_KEY`
7. `sessionId` = `crypto.randomUUID()` generated per playback request
8. Watermark data stored in a `PlaybackLog` Prisma model: id, recordingId, userId, sessionId, watermarkedUrl, createdAt — for forensic lookup

## File Paths
- `services/api/src/lib/watermark.ts` — new file
- `services/api/src/trpc/consent-router.ts` — update getPlaybackToken
- `services/api/prisma/schema.prisma` — add PlaybackLog model
- `services/api/prisma/migrations/` — auto-generated

## Codebase Context
- Pattern: async function with try/catch, fallback on error
- HTTP calls: use `fetch` (Node.js 18+)
- Prisma schema style: uuid PKs, snake_case maps, created_at
- DRM lib: `services/api/src/lib/drm.ts`
- All imports use `.js` extension (ESM)
