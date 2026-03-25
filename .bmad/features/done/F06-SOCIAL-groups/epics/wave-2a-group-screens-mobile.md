# Epic: wave-2a-group-screens-mobile

**Model:** haiku
**Wave:** 2
**Group:** A (parallel with 2b)

## Description

Build mobile screens for groups: group list/discover, group detail with feed, create group, join flow, moderation panel. Uses shared components from packages/app/.

## Acceptance Criteria

1. Shared `GroupListScreen` in packages/app/src/screens/ — shows paginated list of groups with search bar, each card shows name, description snippet, member count, open/private badge
2. Shared `GroupDetailScreen` in packages/app/src/screens/ — shows group header (cover image, name, description, member count), join/leave button, and group posts feed (posts where groupId matches)
3. Shared `CreateGroupScreen` in packages/app/src/screens/ — form with name, description, category picker, visibility toggle (open/private)
4. Shared `GroupModerationScreen` in packages/app/src/screens/ — pending member approvals list, member list with ban action, group settings edit form. Only visible to moderators/owners.
5. Shared `GroupCard` component in packages/app/src/components/ — card for group list items
6. Shared `useGroups` hook in packages/app/src/hooks/ — wraps tRPC group queries (list, search, get, join, leave)
7. Mobile tab or navigation entry: add "Groups" tab at `apps/mobile/app/(tabs)/groups.tsx`
8. Mobile group detail route at `apps/mobile/app/(tabs)/groups/[groupId].tsx` or equivalent nested route

## File Paths

- `packages/app/src/screens/GroupListScreen.tsx` (new)
- `packages/app/src/screens/GroupDetailScreen.tsx` (new)
- `packages/app/src/screens/CreateGroupScreen.tsx` (new)
- `packages/app/src/screens/GroupModerationScreen.tsx` (new)
- `packages/app/src/components/GroupCard.tsx` (new)
- `packages/app/src/hooks/useGroups.ts` (new)
- `apps/mobile/app/(tabs)/groups.tsx` (new)
- `apps/mobile/app/(tabs)/_layout.tsx`
