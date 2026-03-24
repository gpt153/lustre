# PRD: Token System — Pay-as-you-go, Dynamic Spread, Auto-topup

## Overview

Invisible payment system: users add a card and set auto-topup level. All costs expressed internally as tokens with 5-decimal precision. Dynamic spread (default 3x) on actual AI/hosting costs. Prices NEVER shown in the app. Separate payment page (pay.lovelustre.com) for balance/history. Supports Swish Recurring for auto-topup, Segpay/CCBill for card payments.

## Target Audience

All Lustre users

## Functional Requirements (FR)

### FR-1: Token Balance
- Priority: Must
- Acceptance criteria:
  - Given a user, then they have a token balance stored with 5-decimal precision
  - Given a deductible action (AI gatekeeper, coaching, video call), then tokens are debited silently

### FR-2: Auto-Topup
- Priority: Must
- Acceptance criteria:
  - Given user setting (e.g., "refill 100 SEK when below 20 SEK"), when balance drops below threshold, then auto-topup is triggered via Swish Recurring or card
  - Given insufficient payment method, then the user is notified to update

### FR-3: Dynamic Spread
- Priority: Must
- Acceptance criteria:
  - Given admin config, when setting spread multiplier per segment/market, then token costs reflect the spread
  - Given spread change, then no UI changes needed (backend-only config)

### FR-4: Payment Page
- Priority: Must
- Acceptance criteria:
  - Given pay.lovelustre.com, when a user logs in, then they see balance, topup history, daily summaries, and can adjust settings
  - Given the main app, then NO payment information or prices are ever visible

### FR-5: Payment Processors
- Priority: Must
- Acceptance criteria:
  - Given Swedish users, then Swish is the primary payment method
  - Given international users, then Segpay/CCBill handle card payments
  - Given any user, then they can switch between payment methods

### FR-6: Token Deduction API
- Priority: Must
- Acceptance criteria:
  - Given any service (Gatekeeper, Coach, Video), when calling token.deduct, then the balance is reduced and the transaction logged
  - Given insufficient balance, then the service returns an error and prompts topup

## Non-Functional Requirements (NFR)

- Token operations must be atomic (no double-deduction)
- Balance never goes negative
- Transaction log immutable for 7 years (bookkeeping law)
- Payment page must be separate domain (not in app)

## MVP Scope

FR-1, FR-2, FR-3, FR-6 are MVP with Swish only. FR-4 basic version. FR-5 Segpay is Phase 2.

## Risks and Dependencies

- Swish Recurring API merchant agreement
- Segpay merchant account (adult content processor)
- PSD2 assessment: holding funds for marketplace escrow
- Token precision: use DECIMAL(20,5) in PostgreSQL, not FLOAT
