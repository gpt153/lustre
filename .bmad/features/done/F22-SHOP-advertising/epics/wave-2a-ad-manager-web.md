# Epic: wave-2a-ad-manager-web
**Model:** haiku
**Wave:** 2 / Group A (parallel)

## Goal
Build the advertiser dashboard on web: campaign creation wizard, targeting UI, basic analytics charts.

## Files to create/modify
- `apps/web/app/(app)/ads/page.tsx` (CREATE — campaign list)
- `apps/web/app/(app)/ads/create/page.tsx` (CREATE — campaign creation wizard)
- `apps/web/app/(app)/ads/[campaignId]/page.tsx` (CREATE — campaign detail + analytics)
- `apps/web/app/(app)/ads/layout.tsx` (CREATE — layout with nav)
- `packages/app/src/screens/AdsManagerScreen.tsx` (CREATE — shared campaign list screen)
- `packages/app/src/screens/AdCreateScreen.tsx` (CREATE — shared campaign create screen)
- `packages/app/src/hooks/useAds.ts` (CREATE — tRPC hooks for ads)

## Acceptance criteria (max 10)
1. `useAds` hook exports: `useCampaigns()` (calls `ad.getCampaigns`), `useCreateCampaign()` (mutation), `useUpdateTargeting()` (mutation), `useAddCreative()` (mutation), `useActivateCampaign()` (mutation), `useAnalytics(campaignId)` (calls `ad.getAnalytics`)
2. `AdsManagerScreen` shows: header "Mina kampanjer", list of campaigns with name, status badge (DRAFT=gray, ACTIVE=green, PAUSED=yellow, EXHAUSTED=red), dailyBudgetSEK, spentSEK. "Skapa kampanj" button navigates to create screen.
3. `AdCreateScreen` step 1: form fields for name (text), format (select: FEED/STORY/EVENT_SPONSOR), billingModel (CPM/CPC), dailyBudgetSEK (number input, min 100 SEK), totalBudgetSEK (optional). "Nästa" button.
4. `AdCreateScreen` step 2 (targeting): age range (min/max sliders), gender checkboxes (using Gender enum values), orientation checkboxes, relationship type checkboxes. "Spara inriktning" calls updateTargeting mutation.
5. `AdCreateScreen` step 3 (creative): headline (80 char limit), body (200 char limit), imageUrl (optional text field), ctaUrl (required). "Lägg till annons" calls addCreative mutation.
6. Campaign detail page `/ads/[campaignId]`: shows campaign name, status, budget progress bar (spentSEK / dailyBudgetSEK). Analytics section: Impressions count, Clicks count, CTR percentage. "Aktivera" button (calls activateCampaign) shown when status=DRAFT. "Pausa" button shown when status=ACTIVE.
7. Web `ads/page.tsx` renders `<AdsManagerScreen />`, `ads/create/page.tsx` renders `<AdCreateScreen />`, `ads/[campaignId]/page.tsx` renders campaign detail inline (no shared screen needed for detail).
8. `ads/layout.tsx` wraps children with a simple container with heading "Annonsportal" and breadcrumb nav.
9. All tRPC calls use the existing trpc client pattern from the web app (check existing pages for import pattern).
10. All text in Swedish. Status labels in Swedish: DRAFT="Utkast", ACTIVE="Aktiv", PAUSED="Pausad", EXHAUSTED="Budget slut", COMPLETED="Avslutad".

## Context
- tRPC client pattern: look at existing web pages e.g. `apps/web/app/(app)/shop/business/page.tsx` for import pattern
- Tamagui is available for shared components in `packages/app/` screens
- For pure web pages, use Tailwind CSS or inline styles (check what existing web pages use)
- `useAds` hook should follow the pattern of `packages/app/src/hooks/useShop.ts` or similar
- READ an existing hook like `packages/app/src/hooks/useShop.ts` for tRPC patterns before creating
- READ an existing web page like `apps/web/app/(app)/shop/business/page.tsx` before creating web pages
- The ad router is at `ad.*` procedures (created in wave 1b)
