# Epic: wave-4a-video-upload-pipeline

**Model:** sonnet
**Wave:** 4
**Group:** A (sequential — first)

## Description

Video upload pipeline for shorts: upload to R2, transcode to HLS for streaming, auto-generate thumbnail. No raw video download — streaming only.

## Acceptance Criteria

1. REST endpoint `POST /api/posts/upload-video?postId=` — multipart video upload (max 60s, max 100MB)
2. Video stored in R2 at `posts/<postId>/source.<ext>`
3. Transcoding options (choose one, document decision):
   - **Option A: Cloudflare Stream** — upload to Stream API, get HLS manifest URL, automatic thumbnail
   - **Option B: Self-hosted FFmpeg** — k8s Job runs FFmpeg, outputs HLS segments to R2, generates thumbnail
4. PostMedia extended with: `duration Int?` (seconds), `videoUrl String?` (HLS manifest), `isVideo Boolean @default(false)`
5. Thumbnail auto-extracted from first frame, stored as WebP in R2 at `posts/<postId>/thumb.webp` (3 sizes like photos)
6. Webhook/callback on transcode completion: updates PostMedia with videoUrl and thumbnail URLs
7. Video classification: extract 3 frames (0%, 50%, 100%), run Sightengine on each, store highest SpicyLevel detected
8. Max duration enforced server-side: reject uploads > 60 seconds
9. Upload progress: endpoint returns upload ID, client can poll status (UPLOADING → TRANSCODING → READY)

## File Paths

- `services/api/src/routes/video-upload.ts` (new)
- `services/api/src/lib/video-transcode.ts` (new)
- `services/api/prisma/schema.prisma` (update PostMedia)
- `services/api/prisma/migrations/[timestamp]_f39_video_support/migration.sql`
