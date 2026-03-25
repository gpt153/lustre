# Epic: wave-1b-gatekeeper-config-api
**Model:** haiku
**Wave:** 1, Group A (sequential, second — depends on wave-1a)

## Description
Create tRPC router for Gatekeeper configuration management: get, update, and toggle endpoints.

## Acceptance Criteria
1. `gatekeeper.getConfig` query: returns current user's GatekeeperConfig (creates default if none exists)
2. `gatekeeper.updateConfig` mutation: updates strictness, customQuestions, dealbreakers, aiTone with Zod validation
3. `gatekeeper.toggle` mutation: toggles enabled field on/off
4. Strictness validation: only MILD, STANDARD, STRICT accepted
5. aiTone validation: only FORMAL, CASUAL, FLIRTY accepted
6. customQuestions limited to max 10 items, each max 500 chars
7. dealbreakers limited to max 10 items, each max 200 chars
8. Router registered in main app router
9. All procedures use protectedProcedure (auth required)
10. No TODO/FIXME comments

## File Paths
- services/api/src/trpc/gatekeeper-router.ts (new)
- services/api/src/trpc/router.ts (register new router)
