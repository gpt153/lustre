# Roadmap: F21-SHOP-business

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 4

---

## Wave 1: Medusa Integration
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-medusa-setup (sonnet) — Medusa.js v2 deployment on k3s, PostgreSQL database, admin dashboard, API integration with Lustre auth
- wave-1b-shop-api (haiku) — Bridge between Medusa API and Lustre tRPC: product.list, product.get, cart.add, cart.checkout

### Testgate Wave 1:
- [ ] Medusa admin accessible
- [ ] Products created via admin visible via tRPC

---

## Wave 2: Shop Screens
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-shop-mobile (haiku) — Business shop page, product grid, product detail, cart, checkout flow
- wave-2b-shop-web (haiku) — Same for web

### Testgate Wave 2:
- [ ] Product browsing works
- [ ] Cart and checkout complete
- [ ] Business sees order in admin
