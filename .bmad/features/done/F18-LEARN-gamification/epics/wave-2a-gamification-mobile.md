# Epic: wave-2a-gamification-mobile
**Model:** haiku
**Wave:** 2
**Group:** A (parallel with wave-2b)

## Goal
Add gamification UI to the mobile app: streak widget on the Learn tab, achievement screen (all badges + medals), leaderboard view, and badge display on profile.

## Codebase Context

### Shared hooks/screens go in `packages/app/src/`
- Screens: `packages/app/src/screens/`
- Hooks: `packages/app/src/hooks/`
- Components: `packages/app/src/components/`
- Index exports: `packages/app/src/index.ts`

### tRPC client in shared hooks
Look at `packages/app/src/hooks/useLearn.ts` for the pattern of using tRPC in shared hooks. The tRPC client is accessed via a hook like `useTRPC()` or similar — check the existing hook files.

### Mobile tab for Learn
`apps/mobile/app/(tabs)/learn/index.tsx` — this is where the streak widget should appear at the top.

### Mobile tab for Profile
`apps/mobile/app/(tabs)/profile/` — look at existing files for profile tab pattern.

### Tamagui components used in project
`YStack`, `XStack`, `Text`, `Spinner`, `Separator`, `ScrollView` from `tamagui`
`TouchableOpacity` from `react-native`

### Existing screen pattern example
```tsx
import { ScrollView, YStack, XStack, Text, Spinner } from 'tamagui'
import { TouchableOpacity } from 'react-native'
import { useMyHook } from '../hooks/useMyHook'

export function MyScreen({ onPress }: { onPress: () => void }) {
  const { data, isLoading } = useMyHook()
  if (isLoading) return <YStack flex={1} alignItems="center" justifyContent="center"><Spinner /></YStack>
  return (
    <YStack flex={1} backgroundColor="$background">
      ...
    </YStack>
  )
}
```

### Mobile Expo Router pattern
Navigation file exports a default component that renders a screen from packages/app:
```tsx
// apps/mobile/app/(tabs)/learn/achievements.tsx
import { AchievementScreen } from 'app/screens/AchievementScreen'
export default function AchievementsPage() {
  return <AchievementScreen />
}
```

## What to Build

### 1. `packages/app/src/hooks/useGamification.ts`
Hook that calls:
- `trpc.gamification.getBadges.useQuery()`
- `trpc.gamification.getMedals.useQuery()`
- `trpc.gamification.getLeaderboard.useQuery()`
- `trpc.gamification.getStreak.useQuery()`
Returns all four datasets + isLoading.

### 2. `packages/app/src/components/StreakWidget.tsx`
Small widget showing current streak with flame icon and day count.
Props: `{ currentStreak: number, longestStreak: number }`
Design: flame emoji + "X days" text, grey if streak=0.

### 3. `packages/app/src/screens/AchievementScreen.tsx`
Full achievement screen:
- Header "Prestationer"
- Leaderboard section: "Du är i topp X% denna månad" with trophy icon
- Streak section: current + longest streak
- Badges section: grid of all 18 badges (earned = full color, unearned = greyed out), each shows icon + name
- Medals section: grid/list of 15 medals (earned = full color, unearned = greyed out), each shows icon + name + criteria

### 4. Update `apps/mobile/app/(tabs)/learn/index.tsx`
Import and render `<StreakWidget>` at the top of the Learn screen (above the module list).

### 5. Create `apps/mobile/app/(tabs)/learn/achievements.tsx`
New page that renders `<AchievementScreen />`.

### 6. Add achievements navigation button to Learn screen
In `packages/app/src/screens/LearnModuleListScreen.tsx`, add a trophy button in the header that calls an `onAchievementsPress` prop. Update the mobile index.tsx to pass this prop with navigation to `/learn/achievements`.

## Acceptance Criteria
1. `packages/app/src/hooks/useGamification.ts` created, exports `useGamification` hook
2. `packages/app/src/components/StreakWidget.tsx` created, shows current streak visually
3. `packages/app/src/screens/AchievementScreen.tsx` created with badges, medals, streak, leaderboard
4. `apps/mobile/app/(tabs)/learn/achievements.tsx` page file created
5. `apps/mobile/app/(tabs)/learn/index.tsx` shows StreakWidget at top
6. `packages/app/src/screens/LearnModuleListScreen.tsx` has achievements navigation trigger
7. Unearned badges/medals show greyed out (opacity 0.4 or similar)
8. Badges show icon + name; medals show icon + name + criteria text
9. All text in Swedish (Prestationer, badges section: "Märken", medals: "Medaljer", streak: "Streak")
10. No TODO/FIXME comments

## Files to Create/Edit
- `packages/app/src/hooks/useGamification.ts` (CREATE)
- `packages/app/src/components/StreakWidget.tsx` (CREATE)
- `packages/app/src/screens/AchievementScreen.tsx` (CREATE)
- `apps/mobile/app/(tabs)/learn/achievements.tsx` (CREATE)
- `apps/mobile/app/(tabs)/learn/index.tsx` (EDIT — add StreakWidget)
- `packages/app/src/screens/LearnModuleListScreen.tsx` (EDIT — add achievements nav)
- `packages/app/src/index.ts` (EDIT — export new screen/hook/component)
