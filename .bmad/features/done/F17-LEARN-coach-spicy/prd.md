# PRD: Coach Spicy — 8 Intimate Skills Modules

## Overview

Eight advanced coaching modules for intimate skills: Consent as Flirt, Dirty Talk (basic + advanced), Dominance with Respect, Physical Intimacy, BDSM Intro, Fantasy Communication, Giving Pleasure. Requires Spicy mode toggle and vanilla module level 6+. Content is explicit but educational, consent-first.

## Target Audience

Users who have completed vanilla modules 1-6 and enabled Spicy mode

## Functional Requirements (FR)

### FR-1: Gated Access
- Priority: Must
- Acceptance criteria:
  - Given a user without vanilla level 6, then spicy modules are locked with explanation
  - Given Spicy mode disabled, then spicy modules are hidden entirely

### FR-2: Spicy Module Content
- Priority: Must
- Acceptance criteria:
  - Given modules S1-S8, then each has lessons with AI coach explaining concepts and AI practice partner for scenarios
  - Given explicit scenarios, then consent moments are naturally embedded (practice partner sometimes hesitates, requiring user to check in)

### FR-3: Consent Integration
- Priority: Must
- Acceptance criteria:
  - Given a user pushing too hard in a scenario, then the coach breaks in with feedback
  - Given a safeword scenario, then the user must practice immediate stop + aftercare

## MVP Scope

FR-1, FR-2 (modules S1-S3 only), FR-3 are MVP.

## Risks and Dependencies

- Depends on F15 (coach engine), F16 (vanilla modules for gating), F25 (dual mode)
