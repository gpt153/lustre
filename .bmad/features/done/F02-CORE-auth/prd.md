# PRD: Auth & Verification — Swish+SPAR, Email/OAuth Login, Account Creation, Anonymity

## Overview

Implement the complete authentication and identity verification system for Lustre. New users register by paying 10 SEK via Swish — the Swish Handel API returns their name and phone number, which is cross-referenced against SPAR (via Roaring.io) for age verification (18+). Daily login uses email/password or OAuth (Google, Apple). Real names are stored AES-256 encrypted and never displayed. No BankID required.

## Target Audience

All Lustre users (Swedish market at launch)

## Functional Requirements (FR)

### FR-1: Swish Registration & Verification
- Priority: Must
- Acceptance criteria:
  - Given a new user, when they tap "Create Account", then the Swish app opens with a pre-filled 10 SEK payment
  - Given successful Swish payment, then the Swish Handel API returns the user's name and phone number
  - Given name + phone, then an automatic SPAR lookup via Roaring.io retrieves the user's birthdate
  - Given a user under 18, then registration is denied and the 10 SEK is refunded
  - Given a user 18+, then the account is activated and a verification badge is assigned
  - Given a phone number already linked to an account, then registration is denied (one-person-one-account)

### FR-2: Email/Password Login
- Priority: Must
- Acceptance criteria:
  - Given a registered user, when they log in with email + password, then a JWT access token (24h) and refresh token (30d) are issued
  - Given an incorrect password, then login is rejected with rate limiting after 5 failed attempts
  - Given a refresh token, when valid and not expired, then a new access token is issued without re-login

### FR-3: OAuth Login
- Priority: Must
- Acceptance criteria:
  - Given a registered user, when they tap "Continue with Google" or "Continue with Apple", then OAuth flow completes and a session is issued
  - Given an OAuth login for an unregistered email, then the user is directed to the Swish registration flow first
  - Given Apple Sign In on iOS, then it is available as a login option (App Store requirement)

### FR-4: Anonymity Layer
- Priority: Must
- Acceptance criteria:
  - Given a verified user, when creating their profile, then they choose a display name (not their real name)
  - Given the database, when querying user data, then real names are stored AES-256 encrypted in a separate table
  - Given any API endpoint, then real names are never included in responses

### FR-5: Session Management
- Priority: Must
- Acceptance criteria:
  - Given a logged-in user, when their access token expires after 24h, then the refresh token silently renews it
  - Given a user on multiple devices, then all sessions are tracked and revocable
  - Given logout, then the session is invalidated server-side

### FR-6: One-Person-One-Account
- Priority: Must
- Acceptance criteria:
  - Given a phone number already linked to an active account, when attempting to register again, then registration is denied
  - Given a deleted account, then the phone number is released after 90 days

## Non-Functional Requirements (NFR)

- Swish payment callback must be handled idempotently (network retries)
- AES-256 encryption key stored in Kubernetes secrets (never in code)
- All auth endpoints rate-limited to prevent brute force
- GDPR Art. 9 consent collected before storing sexual orientation data
- SPAR lookup via Roaring.io: < 3 seconds response time

## Affected Systems

- services/api (auth module)
- packages/api (auth schemas)
- apps/mobile (auth screens)
- apps/web (auth pages)
- PostgreSQL (user tables)

## MVP Scope

FR-1, FR-2, FR-3, FR-4, FR-5 are MVP. FR-6 enforced with unique constraint on phone number.

## Risks and Dependencies

- Swish Handel merchant agreement required (weeks to set up — start early)
- Roaring.io API key required for SPAR lookups (~1-2 SEK/lookup)
- Apple Sign In required for iOS App Store compliance
- Google OAuth app approval needed
- NOTE: BankID deliberately excluded — cost ~2 SEK per auth call makes it unviable for daily login at scale. Can be revisited as optional premium trust layer later.
