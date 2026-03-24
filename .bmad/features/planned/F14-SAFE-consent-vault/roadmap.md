# Roadmap: F14-SAFE-consent-vault

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 3
**Total epics:** 6

---

## Wave 1: Consent & Schema
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-consent-schema (haiku) — Prisma: ConsentRecord, Recording, RecordingAccess, RecordingRevocation. Consent fields: both party IDs, GPS, timestamp, Bluetooth proximity proof.
- wave-1b-consent-api (haiku) — tRPC: consent.initiate, consent.confirm, consent.getRecordings, consent.revoke, consent.delete. Proximity verification endpoint.

### Testgate Wave 1:
- [ ] Consent record created with both parties
- [ ] Revocation removes access immediately
- [ ] Permanent deletion destroys recording record

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
