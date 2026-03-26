# PRD: Dual Mode — Vanilla/Spicy Toggle

## Overview

App-wide toggle between Vanilla and Spicy modes. Vanilla (default) looks like Hinge/Bumble — clean, SFW. Spicy reveals kink tags, explicit feed content, adult features (ConsentVault, spicy coaching modules, spicy groups). Cross-mode matching works at the common denominator level.

## Target Audience

All users

## Functional Requirements (FR)

### FR-1: Mode Toggle
- Priority: Must
- Acceptance criteria:
  - Given any screen, when toggling to Spicy, then the UI updates to show spicy content (kink tags, explicit feed, advanced features)
  - Given toggle to Vanilla, then all spicy content is hidden and the app looks SFW

### FR-2: Default Vanilla
- Priority: Must
- Acceptance criteria: Given a new user, then Vanilla mode is the default

### FR-3: Cross-Mode Visibility
- Priority: Must
- Acceptance criteria:
  - Given a Vanilla user, then they do NOT see Spicy-only profiles/content
  - Given a Spicy user, then they see ALL profiles but Vanilla profiles show without kink data

### FR-4: App Store Compliance
- Priority: Must
- Acceptance criteria: Given the app in Vanilla mode, then it passes Apple/Google content review (no explicit public content)

## MVP Scope

FR-1, FR-2, FR-3, FR-4 are all MVP.

## Risks and Dependencies

- Must be implemented early as it affects all other features
- Every screen must be mode-aware
- App Store review risk if spicy content leaks into vanilla mode
