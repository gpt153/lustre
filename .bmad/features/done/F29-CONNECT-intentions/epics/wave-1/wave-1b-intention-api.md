# Epic: wave-1b-intention-api

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — depends on 1a)

## Description

Create the tRPC router for Intention CRUD operations. Endpoints for creating, updating, pausing, resuming, deleting, and listing Intentions. Enforce max 3 active Intentions per user. Handle 30-day expiry logic. Validate all fields with Zod.

## Acceptance Criteria

1. tRPC router `intention` registered in `services/api/src/trpc/router.ts` with procedures: `create`, `update`, `pause`, `resume`, `delete`, `list`, `get`.
2. `intention.create` validates all fields via Zod, checks that user has < 3 active Intentions, sets expiresAt to 30 days from now, and returns the created Intention. Kink tags only accepted if user is in Spicy mode.
3. `intention.update` allows updating all fields except userId and status. Revalidates field constraints.
4. `intention.pause` sets status to PAUSED. `intention.resume` sets status back to ACTIVE (only if not expired).
5. `intention.delete` sets status to DELETED (soft delete).
6. `intention.list` returns all user's Intentions (excluding DELETED), with status and days remaining until expiry.
7. Expired Intentions (expiresAt < now) are automatically set to EXPIRED status when queried (lazy expiry).
8. All inputs validated with Zod. Gender/orientation arrays must have at least one element. ageMin < ageMax. distanceRadiusKm between 1 and 500.

## File Paths

- `services/api/src/trpc/intention-router.ts`
- `services/api/src/trpc/router.ts` (register new router)
- `services/api/src/__tests__/intention.test.ts`
