# Epic: wave-1c-ad-delivery
**Model:** sonnet
**Wave:** 1 / Group A (sequential, after 1b)

## Goal
Build the ad selection engine that matches ads to users based on targeting criteria, enforces frequency caps and budget limits, and injects ads into the feed query via a new tRPC procedure.

## Files to create/modify
- `services/api/src/lib/ad-engine.ts` (CREATE)
- `services/api/src/trpc/post-router.ts` (MODIFY — integrate ad injection into feed)
- `services/api/src/trpc/ad-router.ts` (MODIFY — add recordImpression and recordClick procedures)

## Acceptance criteria (max 10)
1. `ad-engine.ts` exports `selectAd(prisma, userId): Promise<AdWithCreative | null>` — fetches user profile (age, gender, orientation, relationshipType, kinkTagIds), then queries ACTIVE campaigns with budget remaining (spentSEK < dailyBudgetSEK), evaluates targeting criteria, excludes campaigns the user saw in last 30 minutes (AdImpression within 30min window), returns one matching campaign+creative (random among eligible), or null if none match.
2. Targeting match logic: if targeting.genders is non-empty, user's gender must be in the array. If targeting.orientations is non-empty, user's orientation must be in the array. If targeting.ageMin set, user's age >= ageMin. If targeting.ageMax set, user's age <= ageMax. Empty arrays mean "no filter" (match all). kinkTagIds: if non-empty, user must have at least 1 matching kink tag (via ProfileKinkTag). All criteria ANDed.
3. Budget exhaustion: after serving an ad, debit cost from campaign: for CPM, cost = ceil(dailyBudgetSEK/1000) SEK (1 SEK per 1000 impressions budget rate, so cost per impression = dailyBudgetSEK/1000 SEK rounded up, min 1); for CPC, cost debited only on click. Use atomic Prisma update: `$executeRaw` UPDATE ad_campaigns SET spent_sek = spent_sek + ${cost} WHERE id = ${campaignId} AND spent_sek + ${cost} <= daily_budget_sek. If update affects 0 rows (budget exceeded), skip this campaign and return null.
4. `post.feed` response is extended: after fetching feedPosts, call `selectAd(ctx.prisma, userId)` to get an ad. If ad returned, insert a synthetic feed item `{type: 'ad', ad: {campaignId, creativeId, headline, body, imageUrl, ctaUrl, sponsor: campaign.advertiser.displayName}}` at position 5 (index 4) of the feedPosts array (or append if fewer than 5 posts). If no ad, feed is unchanged. The item has `type: 'post'` for regular posts (add `type: 'post'` field to existing feedPosts map).
5. `ad.recordImpression` — protectedProcedure: input {campaignId: string (uuid), creativeId: string (uuid)}. Creates AdImpression record. Returns {success: true}.
6. `ad.recordClick` — protectedProcedure: input {campaignId: string (uuid), creativeId: string (uuid)}. Creates AdClick record. If campaign.billingModel === 'CPC', debit 1 SEK from campaign budget (same atomic update as above). Returns {success: true}.
7. Frequency cap: selectAd checks AdImpression within 30 minutes for the user + campaign pair. If the user has seen this campaign in the last 30 minutes, exclude it from candidates.
8. Campaigns with status != ACTIVE are excluded. Campaigns where endsAt < now() are excluded (checked in selectAd).
9. `selectAd` returns `null` if: no ACTIVE campaigns exist, no campaigns match targeting, all matching campaigns are frequency-capped, or all matching campaigns have exhausted budget.
10. `ad-engine.ts` imports: `import { PrismaClient } from '@prisma/client'`. Function signature: `export async function selectAd(prisma: PrismaClient, userId: string): Promise<{ campaignId: string; creativeId: string; headline: string; body: string | null; imageUrl: string | null; ctaUrl: string; sponsor: string | null } | null>`

## Context
- Prisma models: `prisma.adCampaign`, `prisma.adTargeting`, `prisma.adCreative`, `prisma.adImpression`, `prisma.adClick`, `prisma.profile`, `prisma.profileKinkTag`
- Profile model has fields: `age`, `gender`, `orientation`, `relationshipType`
- ProfileKinkTag model: `{ profileId, kinkTagId }` — filter by `profileId = profile.id`
- Feed is in `services/api/src/trpc/post-router.ts`, `feed` procedure, returns `{ posts: feedPosts, nextCursor }`
- Import in post-router: `import { selectAd } from '../lib/ad-engine.js'`
- READ `services/api/src/trpc/post-router.ts` (feed procedure lines 97-255) before modifying
- READ `services/api/src/trpc/ad-router.ts` before modifying (add new procedures to existing file)
- Atomic budget debit: `await prisma.$executeRaw\`UPDATE ad_campaigns SET spent_sek = spent_sek + ${cost} WHERE id = ${campaignId}::uuid AND spent_sek + ${cost} <= daily_budget_sek\``
