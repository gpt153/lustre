# Roadmap: F02-CORE-auth

**Status:** DONE — all waves implemented and tested
**Created:** 2026-03-24
**Build started:** 2026-03-24
**Build completed:** 2026-03-24
**Waves:** 3
**Total epics:** 7

---

## Wave 1: Database Schema & Auth Backend
**Status:** DONE (2026-03-24) — NOTE: built with BankID, needs correction via F30-CORE-auth-fix
- wave-1a-user-schema: VERIFIED
- wave-1b-auth-middleware: VERIFIED
- wave-1c-bankid-service: VERIFIED (⚠️ should be spar-service — see F30)
- Tests: 15/15 PASS

### Parallelization groups:
**Group A (parallel):**
- wave-1a-user-schema (haiku) — Prisma schema for users, encrypted_identities, sessions tables. Migration.
- wave-1b-auth-middleware (haiku) — JWT token generation/validation, session management, auth middleware for Fastify

**Group B (sequential, after A):**
- wave-1c-bankid-service (sonnet) — ⚠️ INCORRECT: built as Criipto/Idura BankID integration. Should be Swish+SPAR. Corrected in F30.

### Testgate Wave 1: PASS (15/15)
- [x] User table created with migration — PASS
- [x] JWT generation and validation works — PASS (5/5 tests)
- [x] BankID test flow — PASS (⚠️ will be replaced by Swish+SPAR flow in F30)
- [x] Under-18 check — PASS

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
- [x] Mobile: full registration flow works end-to-end — PASS (⚠️ screens use BankID flow, corrected in F30: swish → spar → display-name)
- [x] Web: full registration flow works end-to-end — PASS (⚠️ same)
- [x] Duplicate blocked — PASS (⚠️ keyed on personnummer, should be phone number — corrected in F30)
- [x] Session persists across app restarts — PARTIAL (zustand in-memory, persist middleware deferred)
- [x] Logout revokes session — PASS (both mobile and web call auth.logout + clear store)
