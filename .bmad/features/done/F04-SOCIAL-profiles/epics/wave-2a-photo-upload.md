# Epic: wave-2a-photo-upload
**Model:** haiku
**Wave:** 2, Group A (parallel)

## Description
Implement photo upload to Cloudflare R2 with WebP conversion, thumbnail generation (3 sizes), and ProfilePhoto CRUD.

## Acceptance Criteria
1. R2 client configured using @aws-sdk/client-s3 (R2 is S3-compatible) with env vars: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
2. Photo upload endpoint accepts multipart form data (max 20MB) via Fastify multipart plugin
3. Uploaded images converted to WebP using `sharp` library
4. Three thumbnail sizes generated: small (150x150), medium (400x400), large (800x800) — all WebP, aspect-ratio preserved with cover fit
5. All 4 versions (original + 3 thumbs) uploaded to R2 with paths: `profiles/{profileId}/photos/{photoId}/{size}.webp`
6. `profile.uploadPhoto` protectedProcedure — handles upload, creates ProfilePhoto record with all URLs, returns the photo record
7. `profile.deletePhoto` protectedProcedure — deletes from R2 and database, reorders remaining photos
8. `profile.reorderPhotos` protectedProcedure — updates position field for photos
9. Max 10 photos per profile enforced
10. Profile must have at least 1 photo (enforce on delete, not on create — photo added during onboarding)

## File Paths
1. `services/api/src/lib/r2.ts` — R2 client setup and upload/delete helpers
2. `services/api/src/lib/image.ts` — sharp-based WebP conversion and thumbnail generation
3. `services/api/src/trpc/photo-router.ts` — tRPC procedures for photo CRUD
4. `services/api/src/trpc/router.ts` — register photo router
5. `services/api/package.json` — add sharp, @aws-sdk/client-s3, @fastify/multipart deps

## Context
- Fastify server is in `services/api/src/server.ts`
- Register @fastify/multipart plugin in server.ts
- R2 endpoint format: `https://{ACCOUNT_ID}.r2.cloudflarestorage.com`
- For the upload procedure, use a REST endpoint registered in server.ts (not tRPC) since tRPC doesn't handle multipart well. The tRPC router can have delete/reorder.
- Return public URLs via R2 custom domain or presigned URLs (use env var R2_PUBLIC_URL)
