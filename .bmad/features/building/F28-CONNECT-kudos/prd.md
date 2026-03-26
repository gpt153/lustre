# PRD: Kudos / Reputation System

## Overview

A positive-only reputation system with AI-assisted badge selection. Users can give kudos to people they've interacted with via structured badges organized in categories. AI helps select appropriate badges from a free-text description — the free text is never stored or shown to anyone. Recipients see anonymous kudos counts and badge names. High kudos scores integrate with AI Gatekeeper (F07) for faster qualification and with Gamification (F18) for milestones.

## Target Audience

All users who have completed interactions (match conversations or SafeDate-verified IRL meetings)

## Core Design Decisions

- **Positive only** — no negative reviews, ever. Trust signal = presence of kudos, not absence.
- **Structured badges** — many badges in categories; no raw free text visible to anyone.
- **AI-assisted selection** — user types free text -> AI recommends matching badges -> user approves/adjusts. Free text is NEVER stored.
- **Anonymous** — recipient sees kudos count + badge names but never who gave them.
- **Triggered after** — a conversation is archived/match ends, OR after a SafeDate-verified IRL meeting (F13 integration when built).
- **Spicy badges** — a category of badges only visible/selectable when user is in Spicy mode. Hidden entirely in Vanilla mode.

## Functional Requirements (FR)

### FR-1: Badge Catalog
- Priority: Must
- Acceptance criteria:
  - Given the badge catalog, then badges are stored in the database with id, name, category, description, spicyOnly flag, and sortOrder
  - Given a Vanilla-mode user, then spicyOnly badges are excluded from all queries
  - Given the API, then badges can be listed by category
  - Given a new badge, then it can be added via DB seed/migration without code changes

### FR-2: Kudos Giving Flow
- Priority: Must
- Acceptance criteria:
  - Given an archived conversation or completed SafeDate meeting, then the user is prompted "Vill du lamna kudos till [namn]?"
  - Given one user-target pair per interaction, then only one kudos-giving opportunity exists (deduplication)
  - Given the user submits kudos, then selected badge_ids are recorded with the giver and recipient
  - Given rate limiting, then a user cannot submit more than 10 kudos in a 24-hour window

### FR-3: AI Badge Selection
- Priority: Must
- Acceptance criteria:
  - Given a free-text input from the user, then an AI call returns 2-4 matching badge_ids
  - Given the AI response, then suggested badges are shown to the user for confirmation/modification
  - Given the user skips free text, then they can browse and select badges manually from categories
  - Given any code path, then the free-text input is never persisted to the database or shown to any user

### FR-4: Profile Display
- Priority: Must
- Acceptance criteria:
  - Given a user profile, then total kudos count is displayed
  - Given a user profile, then top badges are shown as tags with counts (e.g. "14x Respekterar granser")
  - Given a Vanilla-mode viewer, then spicyOnly badges are hidden from the profile display
  - Given a Spicy-mode viewer, then all badges (including spicyOnly) are visible

### FR-5: Gatekeeper Integration
- Priority: Should
- Acceptance criteria:
  - Given a user with high kudos score, then AI Gatekeeper (F07) qualification is weighted more favorably
  - Given gatekeeper.checkRequired, then kudos score is included in the qualification context

### FR-6: Gamification Hooks
- Priority: Should
- Acceptance criteria:
  - Given a user receiving their first kudos, then a milestone event is emitted via NATS
  - Given kudos milestones (1, 10, 50), then corresponding events are emitted for F18 to consume
  - Given a user reaching the "Trusted member" threshold, then a profile badge is unlocked

## Non-Functional Requirements (NFR)

- AI badge suggestion response time: < 3 seconds
- Kudos submission: < 500ms
- Badge catalog cached in Redis (invalidated on catalog update)
- Rate limiting: max 10 kudos per user per 24h window

## MVP Scope

FR-1, FR-2, FR-3, FR-4 are MVP. FR-5 (Gatekeeper integration) and FR-6 (Gamification hooks) are Phase 2.

## Badge Categories (MVP)

**Kommunikation:** Tydlig profil, Arlig om intentioner, Svarar snabbt, Aktiv lyssnare, Bra konversator, Ghostade inte

**Respekt & trygghet:** Respekterar granser, Tar nej som nej, Diskret, Pressade inte, Trygg att traffa, Konsekvent beteende

**IRL-moten:** Dok upp som planerat, Sag ut som sina bilder, Arlig om vad hen sokte, Bra energi i person

**Generellt:** Trevlig person, Skulle traffa igen, Rekommenderas

**Spicy (spicyOnly=true):** Kommunicerar kinks tydligt, Trygg att utforska med, Respekterar safeword, Bra pa aftercare, Arlig om erfarenhet

## Risks and Dependencies

- Depends on F04 (profiles), F08 (matching — for match/conversation lifecycle), F09 (chat — for conversation archiving trigger)
- Optional integration with F07 (AI Gatekeeper), F13 (SafeDate), F18 (Gamification)
- AI cost: one OpenAI call per kudos submission (when free text used) — low volume, low cost
- Gaming risk: rate limiting + one-per-interaction deduplication mitigates badge farming
