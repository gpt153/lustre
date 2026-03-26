# PRD: Auth Fix — Replace BankID with Swish+SPAR Verification & Email/OAuth Login

## Overview

F02-CORE-auth was built incorrectly with BankID (Criipto/Idura) as the primary authentication method. This feature replaces it with the correct architecture:

- **Registration/verification:** Swish 10 SEK payment via Swish Handel API returns name + phone number, then SPAR lookup via Roaring.io verifies age 18+, then account is activated.
- **Daily login:** Email/password + OAuth (Google, Apple).
- **No BankID** — too expensive (~2 SEK/call) for daily login, not viable at scale.

## Target Audience

All Lustre users (Swedish market at launch)

## Functional Requirements (FR)

### FR-1: Schema Migration — Phone-Based Identity
- Priority: Must
- Acceptance criteria:
  - Given the existing User model keyed on personnummer, when migration runs, then the unique constraint shifts to phone number (from Swish)
  - Given the migration, then an `email` field (unique, nullable) and `passwordHash` field (nullable) are added to User
  - Given the migration, then an `oauth_accounts` table is created (provider, providerId, userId, email, createdAt)
  - Given the migration, then all BankID-specific columns (criipto_sub, personnummer hash) are dropped
  - Given the migration, then existing encrypted_identities remain intact (phone replaces personnummer as lookup key)

### FR-2: Swish Identity Verification Service
- Priority: Must
- Acceptance criteria:
  - Given a new user initiating registration, when they complete a 10 SEK Swish payment, then the Swish Handel API callback includes the payer's name and phone number
  - Given a successful Swish callback with name + phone, then a SPAR lookup is triggered automatically via Roaring.io
  - Given the Swish callback, then the phone number is stored as the unique identity key for one-person-one-account enforcement
  - Given a phone number already linked to an active account, then registration is denied with a clear error
  - Given a Swish payment failure or timeout, then the user is informed and can retry

### FR-3: SPAR Age Verification via Roaring.io
- Priority: Must
- Acceptance criteria:
  - Given name + phone from Swish, when SPAR lookup returns birthdate, then age is calculated and verified >= 18
  - Given a user under 18, then registration is denied and the 10 SEK is refunded via Swish refund API
  - Given SPAR lookup failure (API down), then registration is paused with retry logic (max 3 attempts, 5s interval)
  - Given successful age verification, then the real name from SPAR is stored AES-256-GCM encrypted (existing crypto module)

### FR-4: Email/Password Authentication
- Priority: Must
- Acceptance criteria:
  - Given a verified user, when they set an email + password during registration, then the password is stored as bcrypt hash
  - Given a registered user, when they log in with email + password, then JWT access (24h) + refresh (30d) tokens are issued
  - Given an incorrect password, then login is rejected with rate limiting (5 attempts per 15 min per IP)
  - Given a forgotten password, then a reset email flow is available (token-based, 1h expiry)

### FR-5: OAuth Login (Google + Apple)
- Priority: Must
- Acceptance criteria:
  - Given a verified user, when they tap "Continue with Google", then Google OAuth2 flow completes and links to their account
  - Given a verified user, when they tap "Continue with Apple", then Apple Sign In flow completes and links to their account
  - Given an OAuth login for an unregistered email, then the user is redirected to Swish registration first
  - Given Apple Sign In on iOS, then it is available as required by App Store guidelines
  - Given an OAuth account, then the provider + providerId are stored in oauth_accounts table for multi-provider support

### FR-6: BankID Removal
- Priority: Must
- Acceptance criteria:
  - Given the codebase, when F30 is complete, then `services/api/src/auth/bankid.ts` is deleted
  - Given the codebase, then all references to Criipto/Idura are removed
  - Given env vars, then CRIIPTO_DOMAIN, CRIIPTO_CLIENT_ID, CRIIPTO_CLIENT_SECRET, CRIIPTO_REDIRECT_URI are removed from all configs
  - Given auth screens, then BankID launch step is removed from both mobile and web

### FR-7: Updated Registration Flow (Screens)
- Priority: Must
- Acceptance criteria:
  - Given a new user on mobile or web, then the registration flow is: Welcome -> Swish Payment -> SPAR Age Check (loading) -> Set Email + Password -> Choose Display Name -> Done
  - Given the registration screens, then BankID screens are replaced with Swish payment initiation
  - Given the login screen, then it shows: email/password form + "Continue with Google" + "Continue with Apple" buttons
  - Given a returning user, then the login screen is the default (not registration)

## Non-Functional Requirements (NFR)

- NFR-1: Swish payment callback handled idempotently (network retries must not create duplicate accounts)
- NFR-2: SPAR lookup via Roaring.io must complete within 5 seconds (timeout + retry)
- NFR-3: All auth endpoints rate-limited (login: 5/15min/IP, registration: 3/hour/IP)
- NFR-4: Password hashing via bcrypt with cost factor 12
- NFR-5: OAuth tokens never stored server-side — only provider ID + email stored
- NFR-6: Existing JWT infrastructure (jose, HS256, access 24h + refresh 30d) preserved unchanged
- NFR-7: Existing AES-256-GCM encryption infrastructure preserved unchanged
- NFR-8: Zero downtime migration — existing sessions remain valid during rollout
- NFR-9: GDPR: real names from SPAR stored encrypted, phone numbers hashed for uniqueness check

## Affected Systems

- `services/api/src/auth/` — bankid.ts removed, swish.ts extended, spar.ts + oauth.ts + email.ts created
- `services/api/prisma/schema.prisma` — User model updated, OAuthAccount model added
- `packages/app/src/` — auth screens updated (registration + login)
- `apps/mobile/app/(auth)/` — registration flow screens
- `apps/web/app/(auth)/` — registration + login pages

## MVP Scope

All FRs (FR-1 through FR-7) are MVP. The entire BankID flow must be replaced before launch since BankID is not a viable production auth method for Lustre.

## Env Vars — Added
- `ROARING_API_KEY` — Roaring.io SPAR lookup API key
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google OAuth2
- `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` — Apple Sign In

## Env Vars — Removed
- `CRIIPTO_DOMAIN`, `CRIIPTO_CLIENT_ID`, `CRIIPTO_CLIENT_SECRET`, `CRIIPTO_REDIRECT_URI`

## Risks and Dependencies

1. **Swish Handel merchant agreement** — requires application and approval (weeks). Must be initiated early. Test environment available immediately.
2. **Roaring.io API key** — commercial agreement needed. ~1-2 SEK per SPAR lookup (one-time per registration, acceptable cost).
3. **Apple Developer account** — Sign In with Apple requires active membership and key configuration.
4. **Google OAuth app** — requires Google Cloud Console setup and verification for production.
5. **Migration risk** — existing F02 users (if any in test) need phone number backfill or re-registration.
6. **Swish Handel API name+phone** — confirm that Swish Handel v2 callback actually returns payer name and phone (verified in Swish Merchant API docs).
