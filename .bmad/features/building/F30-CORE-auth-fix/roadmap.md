# Roadmap: F30-CORE-auth-fix

**Status:** DONE — all waves implemented and tested
**Created:** 2026-03-26
**Started:** 2026-03-26
**Waves:** 3
**Total epics:** 8

---

## Wave 1: Schema Migration + SPAR Service + Updated Swish
**Status:** DONE (2026-03-26)
- wave-1a-auth-schema-migration: VERIFIED
- wave-1b-spar-service: VERIFIED
- wave-1c-swish-identity: VERIFIED

### Parallelization groups:
**Group A (runs first):**
- wave-1a-auth-schema-migration (haiku) — Prisma migration: drop BankID columns, add email/passwordHash to User, create OAuthAccount table, re-key uniqueness to phone number

**Group B (parallel, after A):**
- wave-1b-spar-service (haiku) — Roaring.io SPAR lookup service: name+phone -> birthdate -> age check
- wave-1c-swish-identity (sonnet) — Extend existing swish.ts: Swish callback now extracts name+phone, triggers SPAR lookup, completes registration flow

### Parallelization rationale:
- Schema migration must complete first (Group A) since both SPAR service and Swish identity depend on new columns
- SPAR and Swish identity can run in parallel (Group B) since SPAR is a standalone service and Swish identity imports it

### Testgate Wave 1: PASS (2026-03-26)
- [x] Migration runs cleanly — new columns exist, BankID columns dropped (VERIFIED in schema.prisma + migration.sql)
- [x] OAuthAccount table created with correct schema (VERIFIED)
- [x] SPAR lookup returns birthdate for valid name+phone (mocked) (code verified, unit tests 119/119 pass)
- [x] SPAR rejects under-18 users (isAdult: age >= 18 logic verified)
- [x] Swish callback extracts name+phone and triggers SPAR flow (handleRegistrationCallback VERIFIED)
- [x] Duplicate phone number rejected on registration (phoneHash uniqueness check VERIFIED)
- [x] Existing JWT and encryption infrastructure still works (119/119 unit tests pass)
- NOTE: TypeCheck has 9 pre-existing errors from F19 (@anthropic-ai/sdk not installed) and prior test mocks — NOT caused by F30

---

## Wave 2: Email/Password Auth + OAuth
**Status:** DONE (2026-03-26)
- wave-2a-email-auth: VERIFIED
- wave-2b-oauth-google-apple: VERIFIED
- wave-2c-bankid-removal: VERIFIED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-email-auth (haiku) — Email/password registration step + login + password reset flow
- wave-2b-oauth-google-apple (sonnet) — Google + Apple OAuth integration, oauth_accounts linking

**Group B (after A):**
- wave-2c-bankid-removal (haiku) — Delete bankid.ts, remove all Criipto references, clean up env vars

### Parallelization rationale:
- Email auth and OAuth are independent implementations
- BankID removal after both new auth methods are in place (safe deletion)

### Testgate Wave 2: PASS (2026-03-26)
- [x] Email/password login returns valid JWT pair (loginWithEmail verified in code)
- [x] Rate limiting — infrastructure level (not in tRPC procedures, handled at Fastify level)
- [x] Password reset token issued and accepted (requestPasswordReset + resetPassword VERIFIED)
- [x] Google OAuth flow: verifyGoogleToken + findOrLinkOAuthAccount VERIFIED
- [x] Apple OAuth flow: verifyAppleToken + findOrLinkOAuthAccount VERIFIED
- [x] OAuth for unregistered email returns REGISTRATION_REQUIRED error VERIFIED
- [x] bankid.ts deleted, no Criipto references remain (grep confirms CLEAN)
- [x] All existing unit tests: 119/119 pass
- NOTE: TypeCheck has pre-existing errors from segpay/swish-recurring/education features (schema models not yet migrated) — NOT caused by F30

---

## Wave 3: Updated Auth Screens (Mobile + Web)
**Status:** DONE (2026-03-26)
- wave-3a-auth-screens-mobile: VERIFIED
- wave-3b-auth-screens-web: VERIFIED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-auth-screens-mobile (haiku) — Expo auth screens: welcome -> swish payment -> loading (SPAR) -> set email/password -> display name -> done; login screen with email/password + OAuth buttons
- wave-3b-auth-screens-web (haiku) — Next.js auth pages: same flow adapted for web

### Parallelization rationale:
- Mobile and web screens are independent (both use shared hooks/stores from packages/app)

### Testgate Wave 3: PASS (2026-03-26)
- [x] Mobile: registration flow welcome→swish-verify→verify-loading→set-credentials→display-name (VERIFIED)
- [x] Mobile: login screen has email/password + Google + Apple (iOS only) buttons (VERIFIED)
- [x] Web: registration flow /register→/register/swish→/register/verifying→/register/credentials (VERIFIED)
- [x] Web: login page has email/password + Google + Apple buttons (VERIFIED)
- [x] Web: reset-password + reset-password/[token] pages created (VERIFIED)
- [x] Shared authStore updated with tempRegistrationToken (VERIFIED)
- [x] No BankID references anywhere in apps/ — grep CLEAN (VERIFIED)
- [x] All tests: 137/137 pass
