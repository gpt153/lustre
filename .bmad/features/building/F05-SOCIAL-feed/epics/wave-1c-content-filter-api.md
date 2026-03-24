# Epic: wave-1c-content-filter-api

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — after 1b)

## Description

Create tRPC router for user content filter CRUD. Users can get and update their content filter preferences across the 5 classification dimensions. Include preset mapping from ContentPreference enum to default filter values.

## Acceptance Criteria

1. `contentFilter.get` — protectedProcedure, returns the user's UserContentFilter, creates default from profile's contentPreference if none exists
2. `contentFilter.update` — protectedProcedure, input: partial filter fields (nudityLevel[], bodyPart[], activity[], vibe[], genderPresentation[]), updates the filter
3. `contentFilter.applyPreset` — protectedProcedure, input: preset (ContentPreference enum), applies default filter values: SOFT (only NONE nudity, all body parts except GENITALS), OPEN (NONE+IMPLIED+PARTIAL nudity), EXPLICIT (all nudity levels), NO_DICK_PICS (all except GENITALS with FULL nudity)
4. Default filter created on first `get` if none exists, based on user's profile contentPreference
5. `contentFilterRouter` registered in `appRouter` as `contentFilter`

## File Paths

- `services/api/src/trpc/content-filter-router.ts` (new)
- `services/api/src/trpc/router.ts` (add contentFilterRouter)
