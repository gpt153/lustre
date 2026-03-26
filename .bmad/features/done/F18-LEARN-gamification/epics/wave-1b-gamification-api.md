# Epic: wave-1b-gamification-api
**Model:** haiku
**Wave:** 1
**Group:** A (sequential, runs AFTER wave-1a is verified)

## Goal
Create the `gamification` tRPC router with getBadges, getMedals, getLeaderboard, getStreak. Integrate badge awarding and streak incrementing into the existing `module-router.ts` `completeLesson` mutation. Register router in `router.ts`.

## Codebase Context

### tRPC middleware
`services/api/src/trpc/middleware.ts` — exports `router`, `protectedProcedure`, `publicProcedure`

### Existing module-router.ts
`services/api/src/trpc/module-router.ts` — the `completeLesson` mutation already:
1. Updates `UserLessonProgress`
2. Checks if all lessons passed → updates `UserModuleProgress` with `badgeAwardedAt`
3. Unlocks the next module

You need to extend `completeLesson` to also:
- After setting `badgeAwardedAt`: find the Badge by `moduleOrder` matching `lesson.module.order`, create UserBadge (upsert to be safe)
- Always (every `completeLesson` call): upsert UserStreak — set `lastActivityAt = now()`, increment `currentStreak` if `lastActivityAt` was yesterday (or null/older → reset to 1 for older, keep for today), update `longestStreak` if `currentStreak > longestStreak`

### Router registration
`services/api/src/trpc/router.ts` — add `import { gamificationRouter }` and `gamification: gamificationRouter` to `appRouter`

### Leaderboard logic
Count total completed modules (with `badgeAwardedAt != null`) per user → rank all users → return requesting user's percentile. Use raw SQL or Prisma groupBy. Return: `{ percentile: number, totalUsers: number, rank: number }`.

### Streak logic (in completeLesson)
```
const now = new Date()
const streak = await ctx.prisma.userStreak.findUnique({ where: { userId: ctx.userId } })
let currentStreak = 1
if (streak?.lastActivityAt) {
  const daysDiff = Math.floor((now.getTime() - streak.lastActivityAt.getTime()) / 86400000)
  if (daysDiff === 0) currentStreak = streak.currentStreak  // same day, no change
  else if (daysDiff === 1) currentStreak = streak.currentStreak + 1  // consecutive
  else currentStreak = 1  // broke streak
}
const longestStreak = Math.max(currentStreak, streak?.longestStreak ?? 0)
await ctx.prisma.userStreak.upsert({
  where: { userId: ctx.userId },
  update: { currentStreak, longestStreak, lastActivityAt: now },
  create: { userId: ctx.userId, currentStreak, longestStreak, lastActivityAt: now },
})
```

## Acceptance Criteria
1. `services/api/src/trpc/gamification-router.ts` created with procedures: `getBadges`, `getMedals`, `getLeaderboard`, `getStreak`
2. `getBadges` returns all badges with `earned: boolean` and `earnedAt: Date | null` per badge for the requesting user
3. `getMedals` returns all medals with `earned: boolean` and `earnedAt: Date | null` per medal
4. `getLeaderboard` returns `{ percentile: number, rank: number, totalUsers: number }` — no usernames exposed
5. `getStreak` returns `{ currentStreak: number, longestStreak: number, lastActivityAt: Date | null }`
6. `module-router.ts` `completeLesson` creates UserBadge when module is completed (badge found by moduleOrder)
7. `module-router.ts` `completeLesson` upserts UserStreak on every call with correct streak logic
8. `router.ts` registers `gamification: gamificationRouter`
9. All procedures use `protectedProcedure` (auth required)
10. No TODO/FIXME comments

## Files to Create/Edit
- `services/api/src/trpc/gamification-router.ts` (CREATE)
- `services/api/src/trpc/module-router.ts` (EDIT — extend completeLesson)
- `services/api/src/trpc/router.ts` (EDIT — register gamificationRouter)
