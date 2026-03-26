# Epic: wave-1b-ad-api
**Model:** haiku
**Wave:** 1 / Group A (sequential, after 1a)

## Goal
Create the tRPC ad router with campaign creation, targeting, creative upload, and basic analytics procedures.

## Files to create/modify
- `services/api/src/trpc/ad-router.ts` (CREATE)
- `services/api/src/trpc/router.ts` (MODIFY — add ad router)

## Acceptance criteria (max 10)
1. `ad.createCampaign` — protectedProcedure: input {name: string, format: AdFormat, billingModel: BillingModel, dailyBudgetSEK: number (min 100), totalBudgetSEK?: number, startsAt?: Date, endsAt?: Date}. Creates AdCampaign with status=DRAFT, advertiserId=ctx.userId. Returns campaign.
2. `ad.updateTargeting` — protectedProcedure: input {campaignId: string (uuid), ageMin?: number, ageMax?: number, genders?: Gender[], orientations?: Orientation[], relationshipTypes?: RelationshipType[], kinkTagIds?: string[], radiusKm?: number}. Upserts AdTargeting for campaignId. Validates caller owns the campaign (throws FORBIDDEN if not). Returns targeting.
3. `ad.addCreative` — protectedProcedure: input {campaignId: string (uuid), headline: string (max 80), body?: string (max 200), imageUrl?: string, ctaUrl: string}. Validates caller owns campaign. Creates AdCreative. Returns creative.
4. `ad.activateCampaign` — protectedProcedure: input {campaignId: string (uuid)}. Validates caller owns campaign. Requires at least 1 active AdCreative. Sets status=ACTIVE. Returns {success: true}.
5. `ad.pauseCampaign` — protectedProcedure: input {campaignId: string (uuid)}. Validates caller owns campaign. Sets status=PAUSED. Returns {success: true}.
6. `ad.getCampaigns` — protectedProcedure. Returns user's campaigns with targeting and creatives included. Ordered by createdAt desc.
7. `ad.getAnalytics` — protectedProcedure: input {campaignId: string (uuid)}. Validates caller owns campaign. Returns {impressions: number, clicks: number, ctr: number (clicks/impressions×100 rounded 2dp), spentSEK: number}. Count AdImpression and AdClick records for the campaign.
8. Router wired: `import { adRouter } from './ad-router.js'` and `ad: adRouter` added to appRouter in `router.ts`
9. All procedures use `import { router, protectedProcedure } from './middleware.js'`
10. Ownership check pattern: `const campaign = await ctx.prisma.adCampaign.findUnique({ where: { id: input.campaignId } }); if (!campaign || campaign.advertiserId !== ctx.userId) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your campaign' })`

## Context
- Import pattern: `import { router, protectedProcedure } from './middleware.js'`
- `import { z } from 'zod'` and `import { TRPCError } from '@trpc/server'`
- Prisma models: `ctx.prisma.adCampaign`, `ctx.prisma.adTargeting`, `ctx.prisma.adCreative`, `ctx.prisma.adImpression`, `ctx.prisma.adClick`
- Enums from Prisma client: `import { AdFormat, BillingModel } from '@prisma/client'`
- READ `services/api/src/trpc/router.ts` before modifying (to add the import and router entry)
- READ an existing router like `services/api/src/trpc/listing-router.ts` for patterns before creating
