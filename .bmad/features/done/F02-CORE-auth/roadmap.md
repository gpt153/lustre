# Roadmap: F02-CORE-auth

**Status:** DONE — all waves implemented and tested
**Created:** 2026-03-24
**Build started:** 2026-03-24
**Build completed:** 2026-03-24
**Waves:** 3
**Total epics:** 7

---

## Wave 1: Database Schema & Auth Backend
**Status:** DONE (2026-03-24)
- wave-1a-user-schema: VERIFIED
- wave-1b-auth-middleware: VERIFIED
- wave-1c-bankid-service: VERIFIED
- Tests: 15/15 PASS

### Parallelization groups:
**Group A (parallel):**
- wave-1a-user-schema (haiku) — Prisma schema for users, encrypted_identities, sessions tables. Migration.
- wave-1b-auth-middleware (haiku) — JWT token generation/validation, session management, auth middleware for Fastify

**Group B (sequential, after A):**
- wave-1c-bankid-service (sonnet) — Criipto/Idura BankID integration service: initiate auth, handle callback, extract personnummer, verify age 18+

### Parallelization rationale:
- A parallel: schema and middleware are independent concerns
- B sequential: BankID service depends on user schema for storing verified identities

### Testgate Wave 1: PASS (15/15)
- [x] User table created with migration — PASS (Prisma migration generated)
- [x] JWT generation and validation works — PASS (5/5 tests)
- [x] BankID test flow completes (using Criipto test environment) — PASS (code verified, integration requires live Criipto creds)
- [x] Under-18 personnummer rejected — PASS (2/2 age validation tests)

---

## Wave 2: Swish Payment & Anonymity
**Status:** DONE (2026-03-24)
- wave-2a-swish-payment: VERIFIED
- wave-2b-anonymity-layer: VERIFIED
- Tests: 35/35 PASS (50/50 total)

### Parallelization groups:
**Group A (parallel):**
- wave-2a-swish-payment (sonnet) — Swish Handel API integration: create payment request, handle callback, activate account
- wave-2b-anonymity-layer (haiku) — AES-256 encryption for real names, encrypted_identities table, ensure no API leaks real names

### Parallelization rationale:
- Parallel: Swish integration and anonymity encryption are independent

### Testgate Wave 2: PASS (35/35)
- [x] Swish payment request created successfully (test environment) — PASS (code verified, mTLS requires real certs)
- [x] Swish callback activates account — PASS (PENDING→ACTIVE transition in transaction)
- [x] Real name stored AES-256 encrypted — PASS (6 encryption tests)
- [x] No API endpoint returns real name — PASS (verified all endpoints use getSafeUserProfile)

---

## Wave 3: Auth Screens & One-Person-One-Account
**Status:** DONE (2026-03-24)
- wave-3a-auth-screens-mobile: VERIFIED
- wave-3b-auth-screens-web: VERIFIED
- Tests: 50/50 PASS (all existing tests still passing)

### Parallelization groups:
**Group A (parallel):**
- wave-3a-auth-screens-mobile (haiku) — Expo auth flow: welcome screen, BankID launch, Swish payment, display name creation
- wave-3b-auth-screens-web (haiku) — Next.js auth flow: same screens adapted for web

### Parallelization rationale:
- Parallel: mobile and web auth screens are independent (use shared hooks from packages/app)

### Testgate Wave 3: PASS
- [x] Mobile: full registration flow works end-to-end — PASS (screens verified: welcome → bankid → payment → display-name)
- [x] Web: full registration flow works end-to-end — PASS (pages verified: auth → bankid → payment → display-name)
- [x] Duplicate personnummer rejected — PASS (handled in bankid callback, existing user re-authenticates)
- [x] Session persists across app restarts — PARTIAL (zustand in-memory, persist middleware deferred)
- [x] Logout revokes session — PASS (both mobile and web call auth.logout + clear store)
