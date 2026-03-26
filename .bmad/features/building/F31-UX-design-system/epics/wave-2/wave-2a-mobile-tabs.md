# Epic: wave-2a-mobile-tabs

**Model:** haiku
**Wave:** 2
**Group:** A (parallel with 2b)

## Description

Restructure the Expo Router mobile app from 12 bottom tabs to 5 tabs (Discover, Connect, Explore, Learn, Profile). Each tab gets a nested Stack layout containing the screens that were previously separate tabs. Update tab icons to use the new copper/gold palette. All existing screens must remain accessible via the new nested structure.

## Acceptance Criteria

1. `apps/mobile/app/(tabs)/_layout.tsx` defines exactly 5 `Tabs.Screen` entries: Discover, Connect, Explore, Learn, Profile.
2. Tab bar uses `tabBarActiveTintColor: '#B87333'` (copper) and `tabBarInactiveTintColor: '#8B7E74'` (warmGray).
3. Discover tab (`(tabs)/discover/_layout.tsx`) contains a Stack with screens: index (feed/swipe), search, and sub-screens for swipe detail.
4. Connect tab (`(tabs)/connect/_layout.tsx`) contains a Stack with screens: index (chat list), `[conversationId]` (chat room), matches, gatekeeper settings.
5. Explore tab (`(tabs)/explore/_layout.tsx`) contains a Stack with screens: index (hub), groups, `groups/[groupId]`, orgs, `orgs/[orgId]`, events, shop.
6. Learn tab (`(tabs)/learn/_layout.tsx`) contains a Stack with screens: index (modules), `[moduleId]`, coach, sexual-health, achievements.
7. Profile tab (`(tabs)/profile/_layout.tsx`) contains a Stack with screens: index (profile view), edit, settings, safe-date (vault), spicy-settings.
8. All existing screen files are moved to their new nested locations without breaking imports.
9. Header styles use `backgroundColor: '$copper'` or appropriate theme token, not #E91E63.

## File Paths

- `apps/mobile/app/(tabs)/_layout.tsx`
- `apps/mobile/app/(tabs)/discover/_layout.tsx` (new)
- `apps/mobile/app/(tabs)/connect/_layout.tsx` (new)
- `apps/mobile/app/(tabs)/explore/_layout.tsx` (new)
- `apps/mobile/app/(tabs)/learn/_layout.tsx` (new)
- `apps/mobile/app/(tabs)/profile/_layout.tsx` (existing, restructured)
