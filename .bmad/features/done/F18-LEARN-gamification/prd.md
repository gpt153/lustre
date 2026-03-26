# PRD: Gamification — Badges, Medals, Leaderboard, Streaks

## Overview

Gamification system: 18 progression badges (one per module), 15+ individual merit medals, anonymous leaderboard (percentile-based), daily streaks (Duolingo model), and profile display of achievements as social proof.

## Target Audience

All users using the Learn platform

## Functional Requirements (FR)

### FR-1: Badge System
- Priority: Must
- Acceptance criteria:
  - Given module completion, then the corresponding badge is awarded and visible on profile
  - Given 18 badges total, then each maps to a specific module (vanilla 1-10 + spicy S1-S8)

### FR-2: Medal System
- Priority: Should
- Acceptance criteria:
  - Given specific achievements (e.g., "5 rejections handled with grace"), then the medal is awarded
  - Given medals, then they are displayed on profile alongside badges

### FR-3: Leaderboard
- Priority: Should
- Acceptance criteria:
  - Given the leaderboard, then users see their anonymous percentile ("Top 15% this month")
  - Given privacy, then no usernames visible on leaderboard

### FR-4: Streaks
- Priority: Should
- Acceptance criteria:
  - Given daily coaching activity, then streak counter increments
  - Given streak display, then current and longest streak are shown

## MVP Scope

FR-1 is MVP. FR-2, FR-3, FR-4 are Phase 2.

## Risks and Dependencies

- Depends on F16 (vanilla modules), F17 (spicy modules) for badge triggers
