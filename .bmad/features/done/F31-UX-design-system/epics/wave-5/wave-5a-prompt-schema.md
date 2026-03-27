# Epic: wave-5a-prompt-schema

**Model:** haiku
**Wave:** 5
**Group:** A (sequential — must complete before 5b)

## Description

Add the ProfilePrompt Prisma model for structured prompt-based bios (Hinge model). Define a set of curated prompt options in Swedish. Add tRPC procedures for getting and setting prompts. Users can select up to 3 prompts and write responses.

## Acceptance Criteria

1. `ProfilePrompt` model exists with fields: id (UUID), profileId (UUID, FK to Profile), promptKey (String), response (String, max 500 chars), order (Int, 1-3), createdAt, updatedAt. Unique constraint on [profileId, order]. Mapped to `profile_prompts`.
2. Profile model has new relation: `prompts ProfilePrompt[]`.
3. A `PROMPT_OPTIONS` constant is defined with at least 10 Swedish prompt keys: `seeking` ("Jag soker..."), `perfect_date` ("Min perfekta dejt..."), `unknown_fact` ("Vad folk inte vet om mig..."), `best_advice` ("Mitt basta radgivning..."), `guarantee` ("Jag garanterar att..."), `dealbreaker` ("En dealbreaker for mig ar..."), `passionate_about` ("Jag brinner for..."), `weekend` ("En perfekt helg for mig..."), `love_language` ("Mitt karlelkssprak ar..."), `unpopular_opinion` ("Min impopulara asikt...").
4. tRPC `profile.getPrompts` returns the user's prompts (or empty array).
5. tRPC `profile.setPrompts` accepts an array of up to 3 `{promptKey, response, order}` objects, validates promptKey against PROMPT_OPTIONS, upserts by [profileId, order].
6. Prisma migration generated and applies cleanly.
7. The existing `bio` field on Profile is NOT removed (backwards compatibility).

## File Paths

- `services/api/prisma/schema.prisma`
- `services/api/prisma/migrations/` (new migration)
- `services/api/src/trpc/profile-router.ts`
- `services/api/src/lib/prompt-options.ts` (new)
