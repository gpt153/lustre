# Epic: wave-2a-ai-badge-selector

**Model:** haiku
**Wave:** 2
**Group:** A (sequential — must complete before 2b)

## Description

Build the AI-powered badge selection service. Given free-text input from the user and the available badge catalog, call OpenAI GPT-4o-mini to extract 2-4 matching badge IDs. The free text must never be persisted — it is passed directly to the AI and discarded. Add a tRPC procedure for the AI suggestion step.

## Acceptance Criteria

1. AI service in `services/api/src/lib/kudos-ai.ts` exports `suggestBadges(freeText: string, availableBadges: Badge[]): Promise<string[]>` returning 2-4 badge IDs.
2. System prompt instructs the AI to: (a) analyze the Swedish free-text description, (b) match it to the most relevant badges from the provided catalog, (c) return exactly 2-4 badge IDs as a JSON array.
3. tRPC procedure `kudos.suggestBadges` accepts `{ freeText: string }`, calls the AI service, and returns `{ suggestedBadgeIds: string[] }`. The freeText parameter is not logged or stored.
4. If the AI returns invalid badge IDs or fewer than 2, a fallback returns the top 3 most commonly given badges for the category.
5. OpenAI call uses GPT-4o-mini with temperature 0.3 for deterministic results.
6. Response time target: < 3 seconds. Timeout set to 5 seconds with graceful fallback.
7. SpicyOnly badges are only included in the available catalog passed to the AI if the caller is in Spicy mode.

## File Paths

- `services/api/src/lib/kudos-ai.ts`
- `services/api/src/trpc/kudos-router.ts` (add suggestBadges procedure)
- `services/api/src/__tests__/kudos-ai.test.ts`
