# Epic: wave-2b-gamification-web
**Model:** haiku
**Wave:** 2
**Group:** A (parallel with wave-2a)

## Goal
Add gamification UI to the web app: streak widget on the Learn page, achievements page (all badges + medals), leaderboard, and badge display on profile page.

## Codebase Context

### Web app structure
`apps/web/app/(app)/` — Next.js app router pages
`apps/web/app/(app)/learn/` — existing Learn pages (page.tsx, [moduleId]/ folder)

### Shared screens
`packages/app/src/screens/AchievementScreen.tsx` — this will be created by wave-2a. Reuse it or create a web-specific version.

### Next.js page pattern
```tsx
// apps/web/app/(app)/learn/achievements/page.tsx
'use client'
import { AchievementScreen } from 'app/screens/AchievementScreen'
export default function AchievementsPage() {
  return <AchievementScreen />
}
```

### tRPC in web
Uses same tRPC client as mobile. Check `apps/web/app/(app)/learn/page.tsx` for the import pattern.

### Tamagui components
Same as mobile: `YStack`, `XStack`, `Text`, `Spinner`, `ScrollView` from `tamagui`.

### Web learn page
`apps/web/app/(app)/learn/page.tsx` — add streak widget and achievements link at top.

### Streak widget
Use `packages/app/src/components/StreakWidget.tsx` (created by wave-2a). Import and render at top of Learn page.

## What to Build

### 1. `apps/web/app/(app)/learn/achievements/page.tsx`
Web achievements page that renders the shared `AchievementScreen` component.

### 2. Update `apps/web/app/(app)/learn/page.tsx`
- Import and render `<StreakWidget>` at the top
- Add link/button to `/learn/achievements` ("Se prestationer" or trophy icon button)

## Acceptance Criteria
1. `apps/web/app/(app)/learn/achievements/page.tsx` created and renders AchievementScreen
2. `apps/web/app/(app)/learn/page.tsx` shows StreakWidget at top
3. `/learn/achievements` route is accessible and shows achievements
4. Web page has navigation link to achievements from the learn page
5. No TODO/FIXME comments
6. Uses `'use client'` directive on client components

## Files to Create/Edit
- `apps/web/app/(app)/learn/achievements/page.tsx` (CREATE)
- `apps/web/app/(app)/learn/page.tsx` (EDIT — add StreakWidget + link)
