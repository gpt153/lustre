# Epic: wave-1c-spread-engine

**Wave:** 1
**Model:** haiku
**Status:** NOT_STARTED
**Depends on:** wave-1b-token-api (must be VERIFIED first)

## Goal
Create dynamic spread calculator: looks up spread for user segment/market from SpreadConfig, applies multiplier to base cost. Admin API for spread config CRUD.

## Context

### SpreadConfig model (added in wave-1a)
```
model SpreadConfig {
  id         String   @id @default(uuid()) @db.Uuid
  segment    String?
  market     String?
  multiplier Decimal  @db.Decimal(10, 5)
  isDefault  Boolean  @default(false)
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  @@unique([segment, market])
  @@map("spread_configs")
}
```

### Lookup priority (specific → general → default):
1. Match both segment AND market
2. Match segment only (market = null)
3. Match market only (segment = null)
4. isDefault = true
5. Fallback hardcoded: 3.0

### Router pattern
- Admin procedures: use `protectedProcedure` (no special admin role yet, just auth)
- Import from `./middleware.js`

### Where spread is applied
- `calculateTokenCost(baseCost: number, segment?: string, market?: string): Promise<number>`
- Returns `baseCost * multiplier` rounded to 5 decimal places

## Acceptance Criteria
1. New file `services/api/src/lib/spread-engine.ts` with `calculateTokenCost(prisma, baseCost, segment?, market?): Promise<number>` — looks up SpreadConfig, applies multiplier, returns rounded Decimal as number (5 places)
2. Fallback to 3.0x multiplier if no SpreadConfig matches
3. `token.getSpreadConfig` admin query: returns all SpreadConfig rows
4. `token.setSpreadConfig` admin mutation: accepts `{ segment?: string, market?: string, multiplier: number, isDefault?: boolean }` — upserts SpreadConfig
5. `token.deleteSpreadConfig` admin mutation: accepts `{ id: string }` — deletes SpreadConfig (cannot delete if it's the only isDefault)
6. Spread calculation uses Prisma Decimal — no floating-point arithmetic (multiply via JS Number is OK since we round to 5dp at output)
7. `spreadEngine` exported from `services/api/src/lib/spread-engine.ts`
8. `tokenRouter` in `token-router.ts` updated to include the 3 new admin procedures
9. No TODO/FIXME

## Files to Create/Modify
- `services/api/src/lib/spread-engine.ts` — new file, spread calculator
- `services/api/src/trpc/token-router.ts` — add 3 admin spread procedures
