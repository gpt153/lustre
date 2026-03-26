# Roadmap: F22-SHOP-advertising

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Started:** 2026-03-26
**Waves:** 2
**Total epics:** 5

---

## Wave 1: Ad Backend
**Status:** IN_PROGRESS
**Started:** 2026-03-26T00:00:00Z

### Parallelization groups:
**Group A (sequential):**
- wave-1a-ad-schema (haiku) — Prisma: AdCampaign, AdCreative, AdImpression, AdClick, AdTargeting. Budget tracking. **Status: VERIFIED**
- wave-1b-ad-api (haiku) — tRPC: ad.createCampaign, ad.updateTargeting, ad.uploadCreative, ad.getAnalytics **Status: VERIFIED**
- wave-1c-ad-delivery (sonnet) — Ad selection engine: match targeting criteria against user profile, respect frequency caps, budget limits, insert into feed query **Status: VERIFIED**

### Testgate Wave 1: PASS
- [x] Campaign creation works — createCampaign procedure verified in ad-router.ts
- [x] Targeting criteria match correctly — selectAd in ad-engine.ts applies AND-logic for all targeting dimensions
- [x] Budget exhaustion stops delivery — dual-layer: pre-filter + atomic SQL debit

---

## Wave 2: Ad Screens
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-ad-manager-web (haiku) — Advertiser dashboard: campaign creation, targeting UI, creative upload, analytics charts
- wave-2b-ad-display (haiku) — Native feed ad component (mobile + web), "Sponsored" label, click tracking

### Testgate Wave 2:
- [ ] Campaign created via advertiser dashboard
- [ ] Ads appear in feed as native content
- [ ] Click tracking records correctly
