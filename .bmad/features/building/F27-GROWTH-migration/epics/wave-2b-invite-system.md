# Epic: wave-2b-invite-system
**Model:** haiku
**Wave:** 2, Group A

## Goal
Build an invite link system: users generate unique invite links, referred users get tracked, both parties receive token rewards when the referee completes registration.

## Context
- Prisma schema: `services/api/prisma/schema.prisma`
- Token system: `services/api/src/lib/tokens.ts` — `creditTokens(prisma, userId, amount, type, description)`
- `TokenTransactionType` enum in schema — add `REFERRAL` value
- Migration naming convention: `20260327100000_f27_invite_system`
- tRPC pattern: see `services/api/src/trpc/listing-router.ts`
- Main router: `services/api/src/trpc/router.ts`
- Auth registration flow: `services/api/src/trpc/router.ts` → `auth.completeRegistration`

## Acceptance Criteria
1. Prisma schema additions in `services/api/prisma/schema.prisma`:
   - Add `REFERRAL` to `TokenTransactionType` enum
   - New model `InviteLink`: `id String @id @default(cuid())`, `code String @unique`, `referrerId String`, `referrer User @relation(fields: [referrerId], references: [id])`, `createdAt DateTime @default(now())`, `usedCount Int @default(0)`, `@@map("invite_links")`
   - New model `ReferralReward`: `id String @id @default(cuid())`, `inviteLinkId String`, `inviteLink InviteLink @relation(fields: [inviteLinkId], references: [id])`, `referrerId String`, `refereeId String`, `referrerTokens Int`, `refereeTokens Int`, `createdAt DateTime @default(now())`, `@@map("referral_rewards")`
   - Add `inviteLinks InviteLink[]` and `referralRewardsGiven ReferralReward[] @relation("Referrer")` and `referralRewardsReceived ReferralReward[] @relation("Referee")` to `User` model
   - Add `referrer User @relation("Referrer", fields: [referrerId], references: [id])` and `referee User @relation("Referee", fields: [refereeId], references: [id])` to `ReferralReward`
2. New migration `services/api/prisma/migrations/20260327100000_f27_invite_system/migration.sql` with raw SQL creating `invite_links` and `referral_rewards` tables and adding `REFERRAL` to the enum
3. New tRPC router `services/api/src/trpc/invite-router.ts`:
   - `invite.generate` (protectedProcedure): creates `InviteLink` with `code = nanoid(8)` (use `nanoid` package). Returns `{ code, url: \`https://lovelustre.com/invite/\${code}\` }`
   - `invite.getMyLinks` (protectedProcedure): returns user's invite links with `usedCount`
   - `invite.claim` (protectedProcedure): input `{ code: string }`. Finds InviteLink by code, increments `usedCount`, creates `ReferralReward` (referrerTokens=100, refereeTokens=50), calls `creditTokens` for both referrer and referee, returns `{ success: true, tokensEarned: 50 }`. Throws `NOT_FOUND` if code invalid. Throws `BAD_REQUEST` if user already claimed or is the referrer.
   - `invite.getRewards` (protectedProcedure): returns `referralRewardsGiven` and `referralRewardsReceived` for current user
4. In `services/api/src/trpc/router.ts`: import and add `invite: inviteRouter`
5. `nanoid` added to `services/api/package.json` dependencies (version `^5.0.0`)
6. New screen `packages/app/src/screens/InviteScreen.tsx`: shows "Din inbjudningslänk" with a generated link displayed in a copyable box, a "Generera ny länk" button, stats (antal inbjudna, belönade tokens), and a list of rewards. Uses `useInvite` hook.
7. New hook `packages/app/src/hooks/useInvite.ts`: wraps `trpc.invite.generate`, `trpc.invite.getMyLinks`, `trpc.invite.getRewards`
8. New web page `apps/web/app/(app)/invite/page.tsx`: renders `InviteScreen`
9. New public page `apps/web/app/invite/[code]/page.tsx`: shows a landing page with text "Du har blivit inbjuden till Lustre!" and a "Gå med" button linking to `/auth/register?invite={code}`. This is a `'use client'` page that reads `params.code`.
10. In `apps/web/app/(app)/auth-guard.tsx` or registration completion: when user has `?invite=CODE` query param after registration, call `trpc.invite.claim` with the code
11. `packages/app/src/index.ts`: export `InviteScreen` and `useInvite`

## File Paths
- `services/api/prisma/schema.prisma` — EDIT (add models + enum value)
- `services/api/prisma/migrations/20260327100000_f27_invite_system/migration.sql` — NEW
- `services/api/src/trpc/invite-router.ts` — NEW
- `services/api/src/trpc/router.ts` — EDIT (add invite router)
- `services/api/package.json` — EDIT (add nanoid dep)
- `packages/app/src/screens/InviteScreen.tsx` — NEW
- `packages/app/src/hooks/useInvite.ts` — NEW
- `packages/app/src/index.ts` — EDIT (export new)
- `apps/web/app/(app)/invite/page.tsx` — NEW
- `apps/web/app/invite/[code]/page.tsx` — NEW
