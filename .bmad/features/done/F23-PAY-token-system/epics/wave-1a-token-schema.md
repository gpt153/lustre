# Epic: wave-1a-token-schema

**Wave:** 1
**Model:** haiku
**Status:** NOT_STARTED

## Goal
Migrate UserBalance and TokenTransaction to DECIMAL(20,5) precision. Add description/serviceRef to TokenTransaction. Add SpreadConfig model.

## Context

### Existing schema (services/api/prisma/schema.prisma)
- `UserBalance.balance  Int  @default(0)` → must become `Decimal @default(0) @db.Decimal(20, 5)`
- `TokenTransaction.amount  Int` → must become `Decimal @db.Decimal(20, 5)`
- `TokenTransaction` has: id, userId, amount, type, referenceId, createdAt
- Last migration: `20260326230000_add_shop_cart`
- `TokenTransactionType` enum has: GATEKEEPER, TOPUP, REFUND, COACH_SESSION

### Existing tokens.ts (services/api/src/lib/tokens.ts)
Uses `balance.balance < amount` comparison — must still work with Prisma Decimal type (use `.toNumber()` or compare as Decimal).

## Acceptance Criteria
1. `UserBalance.balance` is `Decimal @db.Decimal(20, 5)` in schema.prisma
2. `TokenTransaction.amount` is `Decimal @db.Decimal(20, 5)` in schema.prisma
3. `TokenTransaction` has new fields: `description String? @map("description")` and `serviceRef String? @map("service_ref")`
4. New model `SpreadConfig` added with fields: id (uuid), segment (String, nullable), market (String, nullable), multiplier (Decimal @db.Decimal(10,5)), isDefault (Boolean @default(false)), createdAt, updatedAt
5. `SpreadConfig` has @@map("spread_configs"), @@unique([segment, market])
6. Migration SQL file created at `services/api/prisma/migrations/20260326240000_f23_token_decimal/migration.sql`
7. Migration changes existing INT columns to DECIMAL(20,5) and adds new columns and SpreadConfig table
8. `services/api/src/lib/tokens.ts` updated: balance comparison uses `.toNumber()`, function signatures accept `number` but store as Decimal
9. No TODO/FIXME in any file

## Files to Create/Modify
- `services/api/prisma/schema.prisma` — update UserBalance, TokenTransaction, add SpreadConfig
- `services/api/prisma/migrations/20260326240000_f23_token_decimal/migration.sql` — migration
- `services/api/src/lib/tokens.ts` — update for Decimal compatibility
