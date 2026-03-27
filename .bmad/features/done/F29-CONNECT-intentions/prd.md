# PRD: Intentions-based Discovery

## Overview

A new primary matching flow built around "Intentions" — active, configurable search missions available to ALL users (both Vanilla and Spicy mode). Users create structured search queries with specific criteria, and each Intention has its own result feed ranked by AI compatibility. Multiple Intentions can run simultaneously. The existing swipe mode remains as a lighter alternative. Spicy mode adds additional fields (kinks, relationship structure) but Intentions itself is not a Spicy-only feature.

## Target Audience

All users. Intentions is the primary discovery flow for both Vanilla and Spicy users.

## Core Design Decisions

- **Intentions = active searches** — structured queries with specific criteria, each producing its own result feed. Like saved searches with live results.
- **Multiple simultaneous** — max 3 active Intentions per user (e.g., a couple searching for different types of connections).
- **Intent-first, photo-second** — compatibility and stated intention matter more than quick photo judgment. Profiles in Intention feeds show compatibility score and matched tags before photos.
- **Swipe kept as light option** — swipe/card mode remains as "just browsing", secondary to Intentions in both modes.
- **Kvinnor forst principle** — a man only appears in a woman's Intention feed if his active Intention matches her criteria. Eliminates "spray and pray" behavior.
- **Mutual intention boost** — when both parties have active overlapping Intentions, ranking is boosted.

## Functional Requirements (FR)

### FR-1: Intention CRUD
- Priority: Must
- Acceptance criteria:
  - Given a user, when they create an Intention, then it is stored with all configured fields and a 30-day expiry
  - Given a user with 3 active Intentions, when they try to create a 4th, then they receive an error
  - Given an Intention, when the user pauses it, then it stops appearing in other users' feeds
  - Given an expired Intention (30 days), then it is automatically marked inactive and excluded from matching

### FR-2: Intention Fields
- Priority: Must
- Acceptance criteria:
  - Given an Intention form, then the following fields are available: seeking (dropdown), genderPreferences (multi-select), ageRange (min/max), distanceRadius (km), orientationMatch (multi-select), availability (weekdays/weekends/flexible), relationshipStructure (single/couple/poly)
  - Given Spicy mode, then additional fields are available: kinkInterests (multi-select from kink tag taxonomy), experienceLevel
  - Given Vanilla mode, then kink-related fields are hidden

### FR-3: Intention Discovery Feed
- Priority: Must
- Acceptance criteria:
  - Given an active Intention, then a feed of matching profiles is generated, ranked by AI compatibility score
  - Given the feed, then only profiles with a matching (or complementary) active Intention are shown
  - Given mutual Intention overlap (both parties seeking what the other offers), then ranking is boosted
  - Given the feed, then each result shows: compatibility score (percentage), matched intention tags, brief bio snippet — before the profile photo
  - Given a woman's feed, then a man only appears if his active Intention matches her criteria

### FR-4: AI Compatibility Scoring
- Priority: Must
- Acceptance criteria:
  - Given two Intentions, then a compatibility score (0-100) is computed based on: seeking match, gender/orientation alignment, age range overlap, distance, kink overlap (Spicy), availability overlap
  - Given the scoring algorithm, then it runs server-side and results are cached in Redis
  - Given AI Gatekeeper score (F07) and Kudos score (F28), then these are factored into the ranking

### FR-5: Swipe Mode (Preserved)
- Priority: Must
- Acceptance criteria:
  - Given the existing swipe/card discovery (F08), then it continues to work unchanged
  - Given any mode (Vanilla or Spicy), then Intentions is the default/primary tab and swipe is secondary
  - Given Vanilla mode, then Intentions is available with base fields only (no kink/relationship-structure fields)

### FR-6: Intention Expiry & Renewal
- Priority: Should
- Acceptance criteria:
  - Given an Intention approaching expiry (3 days before), then the user receives a notification
  - Given an expired Intention, then the user can renew it (resets 30-day timer)
  - Given a paused Intention, then the expiry timer continues (pausing does not extend)

## Non-Functional Requirements (NFR)

- Intention feed generation: < 2 seconds for initial load
- Compatibility scoring: cached per pair, recalculated every 6 hours
- Max 3 active Intentions per user (configurable, potential premium gate)
- Redis for fast intention-matching lookup (indexed by seeking + gender + location)
- Feed pagination: 20 results per page with cursor-based pagination

## MVP Scope

FR-1, FR-2, FR-3, FR-5 are MVP. FR-4 starts with a formula-based score (no AI call per pair), AI enhancement in Phase 2. FR-6 is Phase 2.

## Risks and Dependencies

- Depends on F04 (profiles), F08 (matching — extends, does not replace)
- Optional integration with F07 (AI Gatekeeper score), F28 (Kudos score)
- Cold start: Intentions feed is empty if no other users have matching Intentions. Mitigation: show "suggested profiles" from swipe pool when Intention feed is sparse.
- Complexity: multiple Intentions x multiple users = large matching matrix. Redis caching and batch scoring essential.
- Gender ratio monitoring: track whether Intentions actually improves the experience for women vs swipe-only users.
