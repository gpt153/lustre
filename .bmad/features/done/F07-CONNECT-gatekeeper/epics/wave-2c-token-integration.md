# Epic: wave-2c-token-integration
**Model:** haiku
**Wave:** 2, Group A (sequential, third — depends on wave-2b)

## Description
Connect Gatekeeper to a token balance system: check balance before conversation starts, debit on completion, handle insufficient balance. Creates minimal token balance models if not yet present.

## Acceptance Criteria
1. UserBalance model in Prisma: userId (unique), balance (Int, default 0), updatedAt — if not already present
2. TokenTransaction model: id, userId, amount (Int, negative for debit), type (enum: GATEKEEPER/TOPUP/REFUND), referenceId (optional, links to GatekeeperConversation), createdAt — if not already present
3. Token helper at services/api/src/lib/tokens.ts: checkBalance(userId), debitTokens(userId, amount, type, referenceId), creditTokens(userId, amount, type)
4. Gatekeeper initiate checks sender balance >= gatekeeper cost (configurable, default 20 tokens ≈ 2 SEK)
5. Returns 402 with message "Insufficient tokens" if balance too low
6. Tokens debited atomically when conversation completes (PASS or FAIL)
7. Recipient balance NEVER modified by Gatekeeper operations
8. Migration generated for new models
9. No TODO/FIXME comments

## File Paths
- services/api/prisma/schema.prisma (add UserBalance, TokenTransaction if needed)
- services/api/src/lib/tokens.ts (new)
- services/api/src/trpc/gatekeeper-router.ts (integrate token checks)
