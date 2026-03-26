# Roadmap: F20-SHOP-marketplace

**Status:** DONE — all waves implemented and tested
**Created:** 2026-03-24
**Waves:** 3
**Total epics:** 6

---

## Wave 1: Marketplace Backend
**Status:** IN_PROGRESS
**Started:** 2026-03-26T00:00:00Z

### Parallelization groups:
**Group A (sequential):**
- wave-1a-listing-schema (haiku) — Prisma: Listing, ListingImage, ListingCategory, Order, OrderStatus. Categories from PRD. **Status:** VERIFIED
- wave-1b-listing-api (haiku) — tRPC: listing.create, listing.update, listing.list, listing.search, listing.getByCategory **Status:** VERIFIED
- wave-1c-order-api (haiku) — tRPC: order.create, order.markShipped, order.confirmDelivery, order.getStatus. Auto-confirm CronJob (7 days). **Status:** VERIFIED

### Testgate Wave 1:
- [x] Listing CRUD works — PASS
- [x] Order lifecycle flows correctly — PASS
- [x] Auto-confirm after 7 days — PASS

**Wave 1 Status:** DONE — 2026-03-26

---

## Wave 2: Swish Escrow
**Status:** IN_PROGRESS
**Started:** 2026-03-26T00:00:00Z

### Parallelization groups:
**Group A (sequential):**
- wave-2a-escrow-payment (sonnet) — Swish Handel payment for order, hold funds in Lustre account, commission calculation (10-15%) **Status:** VERIFIED
- wave-2b-seller-payout (sonnet) — Swish Payout API to seller on delivery confirmation, minus commission **Status:** VERIFIED

### Testgate Wave 2:
- [x] Buyer payment via Swish works — PASS
- [x] Seller payout on confirmation works — PASS
- [x] Commission deducted correctly — PASS

**Wave 2 Status:** DONE — 2026-03-26

---

## Wave 3: Marketplace Screens
**Status:** IN_PROGRESS
**Started:** 2026-03-26T00:00:00Z

### Parallelization groups:
**Group A (parallel):**
- wave-3a-marketplace-mobile (haiku) — Browse listings, listing detail, create listing, order flow, order status **Status:** VERIFIED
- wave-3b-marketplace-web (haiku) — Same for web **Status:** VERIFIED

### Testgate Wave 3:
- [x] Listing creation works end-to-end — PASS
- [x] Purchase flow completes — PASS
- [x] Order status tracking works — PASS

**Wave 3 Status:** DONE — 2026-03-26
