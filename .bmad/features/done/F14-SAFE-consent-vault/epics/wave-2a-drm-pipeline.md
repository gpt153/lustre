# Epic: wave-2a-drm-pipeline
**Model:** sonnet
**Wave:** 2
**Group:** A (sequential first)

## Goal
Create AWS integration library for DRM video pipeline: S3 presigned upload URLs, MediaConvert job submission, PallyCon DRM license token generation, CloudFront signed URL generation.

## Acceptance Criteria
1. `src/lib/drm.ts` exports `generateUploadPresignedUrl(recordingId: string): Promise<{ uploadUrl: string, s3Key: string }>` — generates S3 presigned PUT URL (15min expiry) for `recordings/<recordingId>/source.mp4`
2. `src/lib/drm.ts` exports `submitMediaConvertJob(recordingId: string, s3Key: string): Promise<{ jobId: string }>` — creates MediaConvert job: CMAF output, Widevine + FairPlay DRM via PallyCon, output to `recordings/<recordingId>/packaged/`
3. `src/lib/drm.ts` exports `generateDrmLicenseToken(userId: string, recordingId: string): Promise<string>` — generates PallyCon license token (JWT) for user+content pair, 1h expiry
4. `src/lib/drm.ts` exports `generateStreamingUrl(recordingId: string): Promise<string>` — CloudFront signed URL for the packaged manifest (24h expiry)
5. `src/lib/drm.ts` exports `handleMediaConvertComplete(recordingId: string, outputKey: string): Promise<void>` — updates Recording.status=READY, Recording.drmUrl=streamingUrl in DB
6. AWS clients use `@aws-sdk/client-s3`, `@aws-sdk/client-mediaconvert`, `@aws-sdk/cloudfront-signer`
7. PallyCon token uses `jsonwebtoken` — HS256 with PALLYCON_SITE_KEY env var
8. All env vars: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_RECORDINGS_BUCKET`, `MEDIACONVERT_ENDPOINT`, `MEDIACONVERT_ROLE_ARN`, `PALLYCON_SITE_ID`, `PALLYCON_SITE_KEY`, `CLOUDFRONT_RECORDINGS_DOMAIN`, `CLOUDFRONT_KEY_PAIR_ID`, `CLOUDFRONT_PRIVATE_KEY`
9. MediaConvert job config includes SPEKE key provider pointing to PallyCon
10. All functions throw descriptive errors on AWS/PallyCon failures

## File Paths
- `services/api/src/lib/drm.ts` — new file

## Codebase Context
- Project uses TypeScript ESM with `.js` imports
- Existing AWS-style lib: `services/api/src/lib/r2.ts` (uses `@aws-sdk/client-s3`)
- See r2.ts for S3 client initialization pattern
- PallyCon SPEKE endpoint: `https://kms.pallycon.com/v2/cpix/pallycon/getKey/<SITE_ID>`
- PallyCon license token format: JWT `{ site_id, user_id, content_id, timestamp, hash }` where hash = SHA256(site_id+user_id+timestamp+site_key)
