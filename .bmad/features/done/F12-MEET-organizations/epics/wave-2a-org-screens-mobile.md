# Epic: wave-2a-org-screens-mobile
**Model:** haiku
**Wave:** 2 / Group A (parallel with wave-2b)

## Goal
Create shared org screens in packages/app and Expo mobile routes for org browsing, detail, admin panel, and create flow.

## Files to create/modify
1. `packages/app/src/components/OrgCard.tsx` — new
2. `packages/app/src/screens/OrgListScreen.tsx` — new
3. `packages/app/src/screens/OrgDetailScreen.tsx` — new
4. `packages/app/src/screens/OrgAdminScreen.tsx` — new
5. `packages/app/src/screens/CreateOrgScreen.tsx` — new
6. `apps/mobile/app/(tabs)/orgs.tsx` — new
7. `apps/mobile/app/(tabs)/_layout.tsx` — add Orgs tab
8. `apps/mobile/app/orgs/[orgId].tsx` — new (dynamic route)

## Acceptance Criteria
1. `OrgCard` renders org name, description snippet (max 100 chars), type badge, member count, verified badge if verified
2. `OrgListScreen` — scrollable list of orgs via `trpc.org.list.useInfiniteQuery`, FlatList with OrgCard items, props: `onOrgPress(orgId)`, `onCreatePress()`
3. `OrgDetailScreen` — shows org name, type, description, location, contact info, member count, verified badge; Join/Leave button (uses trpc.org.addMember/removeMember with ctx.userId); Admin button visible if memberRole is OWNER or ADMIN, props: `orgId`, `onAdminPress()`
4. `OrgAdminScreen` — shows member list via trpc.org.getMembers, allows requesting verification (trpc.org.requestVerification), props: `orgId`
5. `CreateOrgScreen` — form with name, description, type dropdown (CLUB/ASSOCIATION/BUSINESS/EVENT_COMPANY), locationName, contactEmail; submits via trpc.org.create; props: `onSuccess(orgId)`
6. `apps/mobile/app/(tabs)/orgs.tsx` — renders OrgListScreen, navigates to /orgs/[orgId] and /orgs/create
7. `_layout.tsx` — adds `<Tabs.Screen name="orgs" options={{ title: 'Orgs' }} />` between Events and Chat tabs
8. `apps/mobile/app/orgs/[orgId].tsx` — renders OrgDetailScreen with orgId from params, navigates to /orgs/[orgId]/admin

## Context
- Import: `import { trpc } from '@lustre/api'`
- UI: Tamagui components — YStack, XStack, Text, Button, H2, Spinner, ScrollView, Input
- Follow patterns in `packages/app/src/screens/GroupDetailScreen.tsx` and `GroupListScreen.tsx`
- Mobile routing uses expo-router: `useRouter()`, `useLocalSearchParams()`
- `@lustre/app` exports screens and components from `packages/app/src/`
- No TODOs, no half-implementations — full working screens
- READ existing files before editing them
- The trpc.org.addMember takes {orgId, userId} — for join, pass ctx.userId (from trpc.user.me or store)
  - Simpler: use a `trpc.org.join` pattern — but since the API has addMember with userId, use `useAuth` or just note that the mobile join button calls `trpc.org.addMember.useMutation()` with the current user's ID
  - Actually, to keep it simple: create a dedicated join endpoint or pass the current user from ctx. Looking at group-router, join uses ctx.userId directly. So wave-1b-org-api should have an `org.join` and `org.leave` in addition to addMember/removeMember (for admin use). Update the OrgDetailScreen to use trpc.org.join and trpc.org.leave if those exist, otherwise addMember/removeMember with userId from auth store.
  - Use `trpc.org.join` (input: {orgId}) and `trpc.org.leave` (input: {orgId}) — these are self-service. The addMember/removeMember are admin-only. Reference the authStore: `import { useAuthStore } from '@lustre/app/src/stores/authStore'`
