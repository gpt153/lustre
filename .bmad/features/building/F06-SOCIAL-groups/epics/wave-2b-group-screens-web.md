# Epic: wave-2b-group-screens-web

**Model:** haiku
**Wave:** 2
**Group:** A (parallel with 2a)

## Description

Build web pages for groups using the shared screens from packages/app/. Add Next.js routes for group list, group detail, create group, and moderation.

## Acceptance Criteria

1. Web groups page at `apps/web/app/(app)/groups/page.tsx` — renders shared GroupListScreen
2. Web group detail page at `apps/web/app/(app)/groups/[groupId]/page.tsx` — renders shared GroupDetailScreen
3. Web create group page at `apps/web/app/(app)/groups/create/page.tsx` — renders shared CreateGroupScreen
4. Web group moderation page at `apps/web/app/(app)/groups/[groupId]/moderation/page.tsx` — renders shared GroupModerationScreen
5. Add "Groups" link to web app navigation/layout
6. All pages are client components that use the shared hooks and screens

## File Paths

- `apps/web/app/(app)/groups/page.tsx` (new)
- `apps/web/app/(app)/groups/[groupId]/page.tsx` (new)
- `apps/web/app/(app)/groups/create/page.tsx` (new)
- `apps/web/app/(app)/groups/[groupId]/moderation/page.tsx` (new)
- `apps/web/app/(app)/layout.tsx`
