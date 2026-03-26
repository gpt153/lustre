# Epic: wave-2a-admin-app
**Wave:** 2
**Model:** sonnet
**Status:** NOT_STARTED

## Goal
Create a new Next.js 15 app at `apps/admin/` — the internal admin dashboard at admin.lovelustre.com. Simple HTML/CSS (no Tamagui), uses `@lustre/api` tRPC client. Pages: login, users, reports/moderation, analytics.

## Context
- Monorepo: Turborepo + pnpm workspaces — `pnpm-workspace.yaml` includes `apps/*`
- `apps/web/` is the consumer Next.js app — mirror its package.json structure (Next.js 15, React 18, TS)
- `@lustre/api` package: `packages/api/src/index.ts` exports `trpc`, `createTRPCClient`, `TRPCProvider`
- `trpc-client.ts` in `@lustre/api` imports `AppRouter` from `services/api/src/trpc/router` — admin app reuses this
- Admin auth: email/password login via `trpc.auth.loginWithEmail` (existing endpoint), JWT stored in localStorage
- tRPC admin endpoints (from wave-1b + wave-1c):
  - `trpc.admin.searchUsers({ query, cursor, limit })`
  - `trpc.admin.getUser({ userId })`
  - `trpc.admin.suspendUser({ userId, durationDays, reason })`
  - `trpc.admin.banUser({ userId, reason })`
  - `trpc.admin.getReports({ status, cursor, limit })`
  - `trpc.admin.resolveReport({ reportId, status })`
  - `trpc.admin.getOverview()`
  - `trpc.admin.getRegistrations({ days })`
  - `trpc.admin.getGenderRatio()`
  - `trpc.admin.getRevenue({ days })`
  - `trpc.admin.getAiCosts({ days })`
- Also uses: `trpc.report.getContext({ reportId })` and `trpc.report.takeAction({ userId, actionType, reason, durationDays })`

## Acceptance Criteria
1. `apps/admin/package.json` created — name `@lustre/admin`, depends on `next@^15.1`, `react@^18.3`, `react-dom@^18.3`, `@lustre/api: workspace:*`, `@tanstack/react-query@^5`, `@trpc/react-query@^11`, `superjson@^2`
2. `apps/admin/next.config.ts` created — sets `NEXT_PUBLIC_API_URL` proxy via rewrites (`/trpc/:path* → API_URL/trpc/:path*`), output standalone
3. `apps/admin/tsconfig.json` — extends `../../tsconfig.json` if it exists, or standalone config targeting ES2022
4. `apps/admin/app/layout.tsx` — root layout with basic admin styling (dark sidebar nav), imports Inter font, wraps in `AdminProviders`
5. `apps/admin/app/providers.tsx` — `AdminProviders` component: TRPCProvider + QueryClientProvider, reads JWT from `localStorage.getItem('admin_token')`, NO TamaguiProvider
6. `apps/admin/app/page.tsx` — redirects to `/login` if no token, else to `/users`
7. `apps/admin/app/login/page.tsx` — email+password form, calls `trpc.auth.loginWithEmail`, stores accessToken in `localStorage.getItem('admin_token')`, redirects to `/users`
8. `apps/admin/app/users/page.tsx` — user management table: search input, table with columns (ID, displayName, email, status, banned, warnings, createdAt), suspend/ban action buttons; uses `trpc.admin.searchUsers` with debounced search
9. `apps/admin/app/users/[userId]/page.tsx` — user detail: profile info, moderation history, suspend/ban forms
10. `apps/admin/app/reports/page.tsx` — moderation queue table: filter by status (PENDING/REVIEWED/DISMISSED), shows reportId, targetType, category, createdAt, reporter; resolve buttons (REVIEWED/DISMISSED)
11. `apps/admin/app/analytics/page.tsx` — analytics dashboard: overview stats cards (DAU, MAU, total users, pending reports), registrations chart (last 30 days using a simple SVG bar chart or HTML table), gender ratio, revenue summary, AI costs
12. `apps/admin/app/admin-guard.tsx` — client component that checks `localStorage.getItem('admin_token')`, redirects to `/login` if missing; wraps `/users`, `/reports`, `/analytics` layouts
13. All pages use plain HTML/CSS (no Tamagui) with inline styles — dark admin theme (#1a1a2e background, #16213e sidebar)

## File Paths
- `apps/admin/package.json` (CREATE)
- `apps/admin/next.config.ts` (CREATE)
- `apps/admin/tsconfig.json` (CREATE)
- `apps/admin/app/layout.tsx` (CREATE)
- `apps/admin/app/providers.tsx` (CREATE)
- `apps/admin/app/page.tsx` (CREATE)
- `apps/admin/app/login/page.tsx` (CREATE)
- `apps/admin/app/users/page.tsx` (CREATE)
- `apps/admin/app/users/[userId]/page.tsx` (CREATE)
- `apps/admin/app/reports/page.tsx` (CREATE)
- `apps/admin/app/analytics/page.tsx` (CREATE)
- `apps/admin/app/admin-guard.tsx` (CREATE)
