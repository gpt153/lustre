# Epic: wave-2b-org-screens-web
**Model:** haiku
**Wave:** 2 / Group A (parallel with wave-2a)

## Goal
Create Next.js web pages for org list, org detail, create org, and admin panel. Add Orgs link to nav.

## Files to create/modify
1. `apps/web/app/(app)/orgs/page.tsx` — new
2. `apps/web/app/(app)/orgs/create/page.tsx` — new
3. `apps/web/app/(app)/orgs/[orgId]/page.tsx` — new
4. `apps/web/app/(app)/orgs/[orgId]/admin/page.tsx` — new
5. `apps/web/app/(app)/layout.tsx` — add Orgs nav link

## Acceptance Criteria
1. `orgs/page.tsx` — lists orgs with infinite scroll (IntersectionObserver), search input, OrgCard inline component, link to create, 'use client'
2. `orgs/create/page.tsx` — form: name, description, type (select: CLUB/ASSOCIATION/BUSINESS/EVENT_COMPANY), locationName, contactEmail; calls trpc.org.create, redirects to /orgs/[id] on success
3. `orgs/[orgId]/page.tsx` — org detail: name, type badge, description, location, contactEmail, member count, verified badge; Join/Leave button; Admin button (if OWNER or ADMIN); links
4. `orgs/[orgId]/admin/page.tsx` — member list with pagination, "Request Verification" button (calls trpc.org.requestVerification, shows status), only accessible if caller is OWNER or ADMIN
5. `layout.tsx` Header — adds `<Link href="/orgs" ...>Orgs</Link>` next to Events link
6. All pages use `'use client'`, trpc hooks, Tamagui components
7. Loading states with `<Spinner color="$primary" />`
8. Error states shown gracefully

## Context
- Import: `import { trpc } from '@lustre/api'`
- UI: Tamagui — YStack, XStack, Text, Button, Spinner, Input
- Follow exact patterns from `apps/web/app/(app)/groups/page.tsx` and `apps/web/app/(app)/groups/[groupId]/page.tsx`
- Next.js routing: params via `use('params')` or `{ params }` prop
- `import Link from 'next/link'`, `import { useRouter } from 'next/navigation'`
- READ each file before editing it
- No TODOs — complete implementations
- Join/leave: trpc.org.join({orgId}) and trpc.org.leave({orgId})
- Inline OrgCard component is fine (like GroupCard in groups/page.tsx)
