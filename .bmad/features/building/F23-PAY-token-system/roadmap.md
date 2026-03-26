# Roadmap: F23-PAY-token-system

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Waves:** 3
**Total epics:** 7

---

## Wave 1: Token Core
**Status:** DONE
**Started:** 2026-03-26T00:00:00Z
**Completed:** 2026-03-26

### Parallelization groups:
**Group A (sequential):**
- wave-1a-token-schema (haiku) — Prisma: TokenBalance (DECIMAL 20,5), TokenTransaction (amount, type, description, serviceRef), SpreadConfig (segment, market, multiplier). Atomic balance operations via PostgreSQL transactions. **Status: VERIFIED**
- wave-1b-token-api (haiku) — tRPC: token.getBalance, token.deduct (internal, service-to-service), token.getHistory. Insufficient balance error handling. **Status: VERIFIED**
- wave-1c-spread-engine (haiku) — Dynamic spread calculator: lookup spread for user segment/market, apply to base cost. Admin API for spread config CRUD. **Status: VERIFIED**

### Testgate Wave 1: PASS (9/9)
- [x] Token balance stored with 5-decimal precision — PASS
- [x] Deduction is atomic (concurrent deductions safe) — PASS
- [x] Spread multiplier applied correctly — PASS
- [x] Balance never goes negative — PASS
- [x] Transaction log created for every deduction — PASS
- [x] calculateTokenCost rounds to 5 decimal places — PASS

---

## Wave 2: Payment Integration
**Status:** DONE
**Started:** 2026-03-26
**Completed:** 2026-03-26

### Parallelization groups:
**Group A (parallel):**
- wave-2a-swish-topup (sonnet) — Swish Recurring API: setup recurring payment, trigger on low balance, handle callback, credit tokens **Status: VERIFIED**
- wave-2b-segpay-topup (sonnet) — Segpay API: card registration, one-time payment, recurring setup, handle callback, credit tokens **Status: VERIFIED**

### Testgate Wave 2: PASS (18/18)
- [x] Swish auto-topup triggers on low balance — PASS
- [x] Segpay card payment credits tokens — PASS
- [x] Payment callbacks handled correctly — PASS

---

## Wave 3: Payment Page & App Integration
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-payment-page (haiku) — Next.js app at pay.lovelustre.com: login via code from app, balance display, topup history, daily summaries, settings (auto-topup level, payment method)
- wave-3b-app-integration-mobile (haiku) — Token deduction hooks in services (Gatekeeper, Coach, Video), insufficient balance prompt, deep link to payment page
- wave-3c-app-integration-web (haiku) — Same token integration for web

### Testgate Wave 3:
- [ ] Payment page accessible and shows balance
- [ ] Gatekeeper deducts tokens on conversation
- [ ] Insufficient balance shows topup prompt
- [ ] No prices visible anywhere in main app
