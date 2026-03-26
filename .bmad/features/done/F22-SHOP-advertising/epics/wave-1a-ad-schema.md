# Epic: wave-1a-ad-schema
**Model:** haiku
**Wave:** 1 / Group A (sequential, first)

## Goal
Add advertising Prisma models to `services/api/prisma/schema.prisma` and create the migration SQL.

## Files to modify
- `services/api/prisma/schema.prisma`

## Acceptance criteria (max 10)
1. New enum `CampaignStatus` with values: DRAFT, ACTIVE, PAUSED, EXHAUSTED, COMPLETED
2. New enum `AdFormat` with values: FEED, STORY, EVENT_SPONSOR
3. New enum `BillingModel` with values: CPM, CPC
4. New model `AdCampaign` with fields: id (uuid pk), advertiserId (uuid FK→User cascade), name (String), status (CampaignStatus default DRAFT), format (AdFormat default FEED), billingModel (BillingModel default CPM), dailyBudgetSEK (Int), totalBudgetSEK (Int?), spentSEK (Int default 0), startsAt (DateTime?), endsAt (DateTime?), createdAt, updatedAt. @@map("ad_campaigns")
5. New model `AdTargeting` with fields: id (uuid pk), campaignId (uuid FK→AdCampaign unique cascade), ageMin (Int? default 18), ageMax (Int?), genders (Gender[] default []), orientations (Orientation[] default []), relationshipTypes (RelationshipType[] default []), kinkTagIds (String[] default []), radiusKm (Int?), createdAt, updatedAt. @@map("ad_targetings")
6. New model `AdCreative` with fields: id (uuid pk), campaignId (uuid FK→AdCampaign cascade), headline (String max 80), body (String? max 200), imageUrl (String?), ctaUrl (String), isActive (Boolean default true), createdAt, updatedAt. @@map("ad_creatives")
7. New model `AdImpression` with fields: id (uuid pk), campaignId (uuid FK→AdCampaign cascade), creativeId (uuid FK→AdCreative cascade), userId (uuid FK→User cascade), recordedAt (DateTime default now()). @@map("ad_impressions"). @@index([campaignId, recordedAt])
8. New model `AdClick` with fields: id (uuid pk), campaignId (uuid FK→AdCampaign cascade), creativeId (uuid FK→AdCreative cascade), userId (uuid FK→User cascade), clickedAt (DateTime default now()). @@map("ad_clicks"). @@index([campaignId, clickedAt])
9. User model gets relations: `campaigns AdCampaign[]`, `adImpressions AdImpression[]`, `adClicks AdClick[]`
10. All new models use `@db.Uuid` on UUID fields, `@map("snake_case")` on all camelCase field names, and `@@map("snake_case_plural")`

## Context
- Existing schema path: `services/api/prisma/schema.prisma`
- Pattern for UUID PK: `id String @id @default(uuid()) @db.Uuid`
- Pattern for FK: `advertiserId String @map("advertiser_id") @db.Uuid`
- Pattern for arrays: `genders Gender[]` (PostgreSQL native array)
- `Gender`, `Orientation`, `RelationshipType` enums already exist in schema
- Append new models after the last model in the file (ShopCart)
- READ the existing schema first before editing
