# Epic: wave-2a-sightengine-classification

**Model:** sonnet
**Wave:** 2
**Group:** A (parallel with 2b)

## Description

Integrate Sightengine API to classify uploaded post images with multi-label tags across 5 dimensions. Call Sightengine after image upload, map API response to our ContentTag model, store tags per PostMedia.

## Acceptance Criteria

1. New lib file `services/api/src/lib/sightengine.ts` with `classifyImage(imageUrl: string)` function
2. Calls Sightengine `/check.json` endpoint with models: `nudity-2.1,face-attributes-3.0,type-1.0` (or relevant models)
3. Maps Sightengine response to our 5-dimension tag system: NudityLevel (from nudity scores), BodyPartTag (from detected body regions), ActivityTag (from image type/context), VibeTag (inferred from nudity+type combo), GenderPresentationTag (from face attributes)
4. Returns array of `{ dimension, value, confidence }` objects
5. `classifyAndTagMedia(postMediaId: string, imageUrl: string)` function that calls classify + creates ContentTag records in DB
6. Called from the post upload endpoint after images are uploaded to R2
7. Env vars: `SIGHTENGINE_API_USER`, `SIGHTENGINE_API_SECRET`
8. Graceful degradation: if Sightengine is down, post still succeeds but without tags (log warning)

## File Paths

- `services/api/src/lib/sightengine.ts` (new)
- `services/api/src/server.ts` (call classifyAndTagMedia after upload)
