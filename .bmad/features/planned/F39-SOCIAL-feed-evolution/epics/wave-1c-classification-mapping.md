# Epic: wave-1c-classification-mapping

**Model:** sonnet
**Wave:** 1
**Group:** A (sequential — after 1b)

## Description

Map Sightengine nudity classification scores to SpicyLevel thresholds and validate poster's self-tagged spicy level against ML classification. Block content where the self-tag doesn't match the actual content (e.g. explicit photo tagged as vanilla).

## Acceptance Criteria

1. Define SpicyLevel classification thresholds based on Sightengine nudity scores:
   - VANILLA: nudity_none > 0.8 (fully clothed, no suggestive posing)
   - SULTRY: nudity_partial > 0.3 AND nudity_raw < 0.3 (underwear, suggestive, more skin)
   - STEAMY: nudity_raw > 0.3 AND no sexual activity detected (nude but no sex acts)
   - EXPLICIT: nudity_raw > 0.5 AND/OR sexual activity indicators
2. New function `classifySpicyLevel(sightengineResult): SpicyLevel` that maps ML output to a level
3. Validation function `validateSpicyTag(selfTag: SpicyLevel, mlResult: SpicyLevel): { valid: boolean, suggestedLevel: SpicyLevel }`:
   - Under-tagging blocked: content classified as STEAMY but tagged VANILLA → rejected with suggested correct level
   - Over-tagging allowed: content classified as VANILLA but tagged SULTRY → accepted (conservative is fine)
   - One-level tolerance for borderline cases: SULTRY content tagged as VANILLA → warning but allowed
4. Integration into post.create flow: after Sightengine classification, validate spicy tag. If invalid, return error with suggested level
5. Existing ContentTag dimensions (NUDITY, BODY_PART, ACTIVITY, VIBE, GENDER_PRESENTATION) continue to be stored — SpicyLevel is an additional summary tag
6. Video classification: extract 3 frames (start, middle, end), classify each, use highest spicy level detected

## File Paths

- `services/api/src/lib/spicy-classifier.ts` (new)
- `services/api/src/lib/sightengine.ts` (update — add spicy level mapping)
- `services/api/src/trpc/post-router.ts` (update — add validation in create)
