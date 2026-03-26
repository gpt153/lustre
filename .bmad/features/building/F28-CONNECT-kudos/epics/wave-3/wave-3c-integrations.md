# Epic: wave-3c-integrations

**Model:** haiku
**Wave:** 3
**Group:** B (sequential — after 3a and 3b)

## Description

Wire kudos score into the AI Gatekeeper (F07) qualification context so that high-kudos users get more favorable gatekeeper outcomes. Emit NATS events for kudos milestones (1, 10, 50 received) so the Gamification system (F18) can award achievements when built.

## Acceptance Criteria

1. `getKudosScore(userId)` utility in `services/api/src/lib/kudos.ts` returns a normalized score (0-100) based on total kudos count and badge diversity.
2. Gatekeeper AI service (`services/api/src/lib/gatekeeper-ai.ts`) includes the sender's kudos score in the system prompt context when building qualification prompts. High score (>50) noted as "trusted community member".
3. `gatekeeper.checkRequired` procedure returns `kudosScore` in its response so clients can display trust indicators.
4. NATS events emitted on kudos milestones: `kudos.milestone.first` (1 kudos received), `kudos.milestone.10`, `kudos.milestone.50`. Events include `{ userId, milestone, totalCount }`.
5. Milestone events are idempotent — emitted once per user per milestone (tracked via a `KudosMilestone` record or simple check against totalCount).
6. Profile model (or a computed field) exposes `isTrustedMember: boolean` when kudos count exceeds the threshold (default: 50).

## File Paths

- `services/api/src/lib/kudos.ts` (add getKudosScore, milestone emission)
- `services/api/src/lib/gatekeeper-ai.ts` (integrate kudos score)
- `services/api/src/trpc/gatekeeper-router.ts` (expose kudosScore in checkRequired)
- `services/api/src/lib/events.ts` (add kudos milestone event types)
