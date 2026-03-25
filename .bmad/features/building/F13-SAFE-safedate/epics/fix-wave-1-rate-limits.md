# Fix Epic: fix-wave-1-rate-limits

## RCA
Two rate-limit issues in safedate-router.ts:
1. `activate` has no check for max 3 concurrent active SafeDates per user
2. `logGPS` rate limit is 3s; spec requires minimum 5s between GPS updates

## File to modify
- `services/api/src/trpc/safedate-router.ts`

## Fix 1 — activate: add max-3-active-SafeDates check
In the `activate` mutation, before creating the SafeDate, add:
```ts
const activeCount = await ctx.prisma.safeDate.count({
  where: { userId: ctx.userId, status: { in: ['ACTIVE', 'CHECKED_IN'] } },
})
if (activeCount >= 3) {
  throw new TRPCError({ code: 'BAD_REQUEST', message: 'Maximum 3 active SafeDates allowed' })
}
```

## Fix 2 — logGPS: change rate limit from 3s to 5s
Change the condition from `Date.now() - 3000` to `Date.now() - 5000`.
