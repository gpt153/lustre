# Roadmap: F20-SHOP-marketplace

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 3
**Total epics:** 6

---

## Wave 1: Marketplace Backend
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-listing-schema (haiku) — Prisma: Listing, ListingImage, ListingCategory, Order, OrderStatus. Categories from PRD.
- wave-1b-listing-api (haiku) — tRPC: listing.create, listing.update, listing.list, listing.search, listing.getByCategory
- wave-1c-order-api (haiku) — tRPC: order.create, order.markShipped, order.confirmDelivery, order.getStatus. Auto-confirm CronJob (7 days).

### Testgate Wave 1:
- [ ] Listing CRUD works
- [ ] Order lifecycle flows correctly
- [ ] Auto-confirm after 7 days

---

## Wave 2: Swish Escrow
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-2a-escrow-payment (sonnet) — Swish Handel payment for order, hold funds in Lustre account, commission calculation (10-15%)
- wave-2b-seller-payout (sonnet) — Swish Payout API to seller on delivery confirmation, minus commission

### Testgate Wave 2:
- [ ] Buyer payment via Swish works
- [ ] Seller payout on confirmation works
- [ ] Commission deducted correctly

---

## Wave 3: Marketplace Screens
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-marketplace-mobile (haiku) — Browse listings, listing detail, create listing, order flow, order status
- wave-3b-marketplace-web (haiku) — Same for web

### Testgate Wave 3:
- [ ] Listing creation works end-to-end
- [ ] Purchase flow completes
- [ ] Order status tracking works
