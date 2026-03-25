# Epic: wave-2b-recording-upload
**Model:** sonnet
**Wave:** 2
**Group:** A (sequential second — depends on wave-2a)

## Goal
Add tRPC procedures for recording upload flow: get presigned URL, confirm upload complete (triggers MediaConvert), poll status. Add Fastify REST webhook for MediaConvert SNS notifications.

## Acceptance Criteria
1. `consent.getUploadUrl` (protected): input `{ consentRecordId: uuid }` — validates CONFIRMED consent, creates Recording(PROCESSING) record, calls `generateUploadPresignedUrl`, returns `{ recordingId, uploadUrl, expiresAt }`
2. `consent.confirmUpload` (protected): input `{ recordingId: uuid }` — validates caller is initiator/participant, calls `submitMediaConvertJob`, returns `{ jobId, status: 'PROCESSING' }`
3. `consent.getPlaybackToken` (protected): input `{ recordingId: uuid }` — validates active RecordingAccess for caller, calls `generateDrmLicenseToken` + `generateStreamingUrl`, returns `{ licenseToken, streamingUrl }`
4. `consent.getStatus` (protected): input `{ recordingId: uuid }` — returns Recording `{ id, status, drmUrl (null unless READY), createdAt }`
5. `POST /api/consent/mediaconvert-webhook` — Fastify REST route, validates SNS signature, on `COMPLETE` calls `handleMediaConvertComplete(recordingId, outputKey)`, returns 200
6. SNS signature validation uses AWS SNS SDK or manual HTTPS verification
7. Recording is only accessible (drmUrl returned) if status=READY AND caller has active RecordingAccess
8. `consentRouter` updated with new procedures (not a new file — edit existing)

## File Paths
- `services/api/src/trpc/consent-router.ts` — add getUploadUrl, confirmUpload, getPlaybackToken, getStatus procedures
- `services/api/src/routes/consent.ts` — new Fastify route file for webhook
- `services/api/src/server.ts` — register the consent routes

## Codebase Context
- DRM lib is at `services/api/src/lib/drm.ts` (created in wave-2a)
- Fastify route pattern: see `services/api/src/routes/call.ts`
- Server registration: see `services/api/src/server.ts` — routes registered with `fastify.register(...)`
- Consent router: `services/api/src/trpc/consent-router.ts`
- All imports use `.js` extension (ESM)
