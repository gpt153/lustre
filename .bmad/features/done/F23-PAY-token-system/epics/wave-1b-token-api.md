# Epic: wave-1b-token-api

**Wave:** 1
**Model:** haiku
**Status:** NOT_STARTED
**Depends on:** wave-1a-token-schema (must be VERIFIED first)

## Goal
Create tRPC token router with getBalance, deduct (internal/service-to-service), and getHistory procedures.

## Context

### Router pattern (from existing routers)
- File: `services/api/src/trpc/token-router.ts`
- Import: `import { router, protectedProcedure } from './middleware.js'`
- Import prisma via `ctx.prisma`, userId via `ctx.userId`
- Must be registered in `services/api/src/trpc/router.ts` as `token: tokenRouter`

### tokens.ts (after wave-1a update)
- `checkBalance(prisma, userId): Promise<Decimal>` (returns Decimal)
- `debitTokens(prisma, userId, amount, type, referenceId?, description?, serviceRef?)`
- `creditTokens(prisma, userId, amount, type, referenceId?)`

### TokenTransaction fields (after wave-1a)
- id, userId, amount (Decimal), type (TokenTransactionType), referenceId, description, serviceRef, createdAt

### Error codes
- Insufficient balance → throw TRPCError code 'PRECONDITION_FAILED' message 'Insufficient tokens'

## Acceptance Criteria
1. `token.getBalance` query returns `{ balance: number, balanceDecimal: string }` for authenticated user
2. `token.deduct` mutation accepts `{ amount: number, type: TokenTransactionType, description?: string, serviceRef?: string, referenceId?: string }` — atomically deducts via `debitTokens`, returns `{ success: true, newBalance: number }`
3. `token.deduct` throws PRECONDITION_FAILED with code 402 equivalent when balance < amount
4. `token.getHistory` query accepts optional `{ limit?: number, cursor?: string }` and returns paginated list of transactions (newest first), each with `{ id, amount, type, description, serviceRef, createdAt }`
5. All three procedures require authentication (protectedProcedure)
6. `tokenRouter` exported and registered in `router.ts` under key `token`
7. `tokens.ts` `debitTokens` signature extended to accept `description` and `serviceRef` optional params — stored in TokenTransaction
8. No TODO/FIXME

## Files to Create/Modify
- `services/api/src/trpc/token-router.ts` — new file, token router
- `services/api/src/trpc/router.ts` — import and register tokenRouter
- `services/api/src/lib/tokens.ts` — extend debitTokens signature with description/serviceRef
