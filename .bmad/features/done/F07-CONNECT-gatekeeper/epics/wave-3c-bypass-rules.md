# Epic: wave-3c-bypass-rules
**Model:** haiku
**Wave:** 3, Group B (sequential, after Group A)

## Description
Implement bypass rules: mutual match bypass, pair profile qualification, no-purchase-bypass enforcement.

## Acceptance Criteria
1. Mutual match detection: if both users have liked each other (FeedInteraction or dedicated match model), Gatekeeper is bypassed completely
2. Pair profile handling: when a pair profile initiates contact, AI qualifies the pair as a unit (references pair profile data)
3. No-purchase-bypass: Gatekeeper cannot be bypassed by spending tokens/money — hard enforcement in the initiate flow
4. Bypass check runs before token deduction (no charge if bypassed)
5. Bypassed conversations logged with status BYPASSED for analytics
6. Add BYPASSED to GatekeeperStatus enum
7. No TODO/FIXME comments

## File Paths
- services/api/prisma/schema.prisma (add BYPASSED status)
- services/api/src/trpc/gatekeeper-router.ts (integrate bypass logic)
