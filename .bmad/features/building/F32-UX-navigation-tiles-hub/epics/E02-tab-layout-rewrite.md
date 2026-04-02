# Epic: E02 — Tab Layout Rewrite

## Stitch Source
Convert: `html/bottom-nav-spec.html`
Reference: `screenshots/stitch-reference/bottom-nav-spec.png`

## Description
Completely rewrite `(tabs)/_layout.tsx` to use the new 5-tab structure with BottomNavBar. Remove all 10+ hidden routes from the tab bar. Reorganize route structure: Upptäck (discover), Community (new tab), Chatt (existing chat), Jag (profile). Center FAB is a special tab that opens the QuickCreateMenu instead of navigating.

## Acceptance Criteria
1. Tabs component uses BottomNavBar as custom tabBar
2. Five tab screens defined: discover, community, (center-action), chat, profile
3. Center tab intercepts tabPress and opens QuickCreateMenu (placeholder in W1)
4. No hidden routes rendered — coach, consent, shop, events, groups, orgs, safedate, polaroid-test removed from tabs
5. Previously hidden routes accessible as stack screens within appropriate parent tabs
6. headerShown: false on all tabs (custom headers per screen)
7. sceneStyle background matches surface token (#fff8f6)
8. Chat tab shows unread badge count from useChat hook
9. Existing discover sub-routes (search) preserved under discover stack

## File Paths
- `apps/mobile/app/(tabs)/_layout.tsx`
- `apps/mobile/app/(tabs)/community/_layout.tsx`
- `apps/mobile/app/(tabs)/community/index.tsx` (placeholder)
- `apps/mobile/app/(tabs)/discover/_layout.tsx` (update)

## Design Tokens (from Stitch)
- Scene background: `#fff8f6` (surface)
- Tab order: discover → community → center-action → chat → profile
- Tab labels: UPPTÄCK, COMMUNITY, (no label), CHATT, JAG
- Badge: primary-container bg (#894D0D), white text, 20px circle
