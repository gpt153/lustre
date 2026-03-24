# PRD: Auth & Verification — BankID, Swish, Account Creation, Anonymity

## Overview

Implement the complete authentication and identity verification system for Lustre. Users verify their identity via Swedish BankID (through Criipto/Idura), pay a 10 SEK registration fee via Swish, and receive a verified account. Real names are stored AES-256 encrypted and never displayed. The system supports age verification (18+), one-person-one-account enforcement, and anonymous display names.

## Target Audience

All Lustre users (Swedish market at launch)

## Functional Requirements (FR)

### FR-1: BankID Authentication
- Priority: Must
- Acceptance criteria:
  - Given a new user, when they tap "Create Account", then the BankID app launches for authentication
  - Given successful BankID auth, then the system receives the user's personnummer and full name
  - Given a personnummer, when the user is under 18, then registration is denied with a clear message

### FR-2: Swish Registration Payment
- Priority: Must
- Acceptance criteria:
  - Given a verified BankID user, when prompted to pay 10 SEK, then the Swish app opens with pre-filled payment
  - Given successful Swish payment, then the account is activated and marked as verified

### FR-3: Anonymity Layer
- Priority: Must
- Acceptance criteria:
  - Given a verified user, when creating their profile, then they choose a display name (not their real name)
  - Given the database, when querying user data, then real names are stored AES-256 encrypted in a separate table
  - Given any API endpoint, then real names are never included in responses

### FR-4: Session Management
- Priority: Must
- Acceptance criteria:
  - Given a logged-in user, when their session expires after 30 days, then they re-authenticate via BankID
  - Given a user on multiple devices, then all sessions are tracked and revocable

### FR-5: One-Person-One-Account
- Priority: Must
- Acceptance criteria:
  - Given a personnummer already linked to an account, when attempting to register again, then registration is denied
  - Given a deleted account, then the personnummer is released after 90 days

## Non-Functional Requirements (NFR)

- BankID authentication must complete in under 15 seconds
- AES-256 encryption key stored in HSM or Kubernetes secrets (never in code)
- All auth endpoints rate-limited to prevent brute force
- GDPR Art. 9 consent collected before storing sexual orientation data

## Affected Systems

- services/api (new auth module)
- packages/api (auth schemas)
- apps/mobile (auth screens)
- apps/web (auth pages)
- PostgreSQL (user tables)

## MVP Scope

FR-1, FR-2, FR-3, FR-4 are MVP. FR-5 can be enforced with a simple unique constraint.

## Risks and Dependencies

- Criipto/Idura account required (~2 SEK/auth)
- Swish Handel merchant agreement required (weeks to set up)
- BankID test environment needed for development
- SPAR register access via Roaring.io for age verification fallback
