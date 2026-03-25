# PRD: Matching — Swipe Discovery, AI Matching, Compatibility Scoring

## Overview

Three matching modes: swipe discovery (Tinder-style cards), passive AI matching (daily suggestions), and active search with filters. Compatibility scoring based on profile data, interests, kinks, location, and behavioral signals.

## Target Audience

All users seeking connections

## Functional Requirements (FR)

### FR-1: Swipe Discovery
- Priority: Must
- Acceptance criteria:
  - Given the Discover tab, when viewing, then profiles are shown as swipeable cards
  - Given a right swipe (like), when the other person also liked, then a mutual match is created
  - Given a left swipe (pass), then the profile is not shown again

### FR-2: Search with Filters
- Priority: Must
- Acceptance criteria:
  - Given search, when applying filters (gender, age range, location radius, orientation, seeking, kinks), then matching profiles are returned
  - Given "Recently active" filter, then only profiles active within selected timeframe are shown

### FR-3: Passive AI Suggestions
- Priority: Should
- Acceptance criteria:
  - Given daily, when the user opens the app, then 5-10 AI-recommended profiles are shown
  - Given suggestions, then compatibility score is displayed (percentage)

### FR-4: Seen-List Management
- Priority: Must
- Acceptance criteria:
  - Given a profile the user has seen/swiped, then it does not appear again in discovery
  - Given Redis, then seen-list is cached for fast lookup

## MVP Scope

FR-1, FR-2, FR-4 are MVP. FR-3 is Phase 2.

## Risks and Dependencies

- Depends on F04 (profiles), F03 (Redis for seen-lists, PostGIS for location)
