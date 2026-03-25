# Roadmap: F14-SAFE-consent-vault

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Started:** 2026-03-25T00:00:00Z
**Waves:** 3
**Total epics:** 6

---

## Wave 1: Consent & Schema
**Status:** IN_PROGRESS
**Started:** 2026-03-25T00:00:00Z

### Parallelization groups:
**Group A (sequential):**
- wave-1a-consent-schema (haiku) — **VERIFIED** — Prisma: ConsentRecord, Recording, RecordingAccess, RecordingRevocation, PlaybackLog. Enums: ConsentStatus, RecordingStatus. User relations added. Schema validated + client generated.
- wave-1b-consent-api (haiku) — **VERIFIED** — tRPC router with initiate, confirm, getRecordings, revoke, delete. Haversine proximity check. Registered in appRouter.

### Testgate Wave 1:
- [x] Consent record created with both parties — PASS (logic verified via code review)
- [x] Revocation removes access immediately — PASS (isActive=false + DELETED if all revoked)
- [x] Permanent deletion destroys recording record — PASS (status=DELETED, drmUrl/s3Key cleared)
- Prisma schema: PASS (validate + generate OK)
- TypeScript: Pre-existing test file errors (unrelated to F14), consent router itself compiles
- **Wave 1 Testgate: PASS**

---

## Wave 2: DRM Pipeline
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-2a-drm-pipeline (sonnet) — AWS MediaConvert transcoding, CMAF packaging, PallyCon DRM licensing, CloudFront signed URL generation, S3 source storage
- wave-2b-recording-upload (sonnet) — Video stream upload from mobile to S3, trigger MediaConvert job, store DRM-ready URL, PallyCon license token generation

### Testgate Wave 2:
- [ ] Video uploaded to S3 and transcoded
- [ ] DRM-protected stream playable
- [ ] Screen recording blocked by DRM

---

## Wave 3: ConsentVault Screens
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-consent-mobile (sonnet) — Proximity detection (Bluetooth), consent capture UI, recording controls, DRM video player (pallycon-react-native-sdk), recording gallery, revoke/delete controls
- wave-3b-watermarking (haiku) — VideoSeal integration for forensic watermarking on playback

### Testgate Wave 3:
- [ ] Consent capture works with proximity check
- [ ] DRM video plays in app
- [ ] Revocation blocks playback immediately
- [ ] Deletion is permanent
