# PRD: Marketplace — P2P Anonymous Swish Escrow

## Overview

P2P marketplace for underwear, toys, fetish items, handmade goods. Anonymous transactions via Swish escrow (buyer pays Lustre's Swish, Lustre holds funds, pays seller on delivery confirmation). Neither party sees the other's real name. 10-15% commission.

## Target Audience

Users buying/selling lifestyle-related physical goods

## Functional Requirements (FR)

### FR-1: Listing Creation
- Priority: Must
- Acceptance criteria: Given a seller, then they create a listing with title, description, photos, price (SEK), category, shipping option

### FR-2: Swish Escrow Payment
- Priority: Must
- Acceptance criteria: Given a buyer, when purchasing, then they Swish to Lustre's merchant account. Funds held until delivery confirmed.

### FR-3: Order Lifecycle
- Priority: Must
- Acceptance criteria: Given an order, then it flows: placed -> paid -> shipped -> delivered -> payout. Auto-confirm after 7 days.

### FR-4: Anonymity
- Priority: Must
- Acceptance criteria: Given any transaction, then neither buyer nor seller sees the other's real name

### FR-5: Prohibited Items
- Priority: Must
- Acceptance criteria: Given listing moderation, then sexual services, drugs, weapons, and CSAM are blocked

## MVP Scope

FR-1, FR-2, FR-3, FR-4 are MVP.

## Risks and Dependencies

- Depends on F02 (auth), F23 (token system for commission handling)
- Swish Payout API for seller payments
- May need PSD2 assessment (holding funds temporarily)
