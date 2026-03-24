# PRD: Migration & Onboarding Optimization

## Overview

One-click profile migration from BodyContact (user-consented scraping of public profile data), optimized onboarding flow with pre-launch landing page, invite system, and referral tracking.

## Target Audience

Existing BodyContact users, new users

## Functional Requirements (FR)

### FR-1: BodyContact Migration
- Priority: Should
- Acceptance criteria: Given a user providing their BodyContact username, then their public profile text and photos are imported (with explicit consent)

### FR-2: Landing Page
- Priority: Must
- Acceptance criteria: Given pre-launch, then lovelustre.com shows a landing page with email signup and countdown

### FR-3: Invite System
- Priority: Should
- Acceptance criteria: Given a registered user, then they can generate invite links with referral tracking

### FR-4: Onboarding Optimization
- Priority: Must
- Acceptance criteria: Given the onboarding flow, then completion rate is tracked and A/B testable

## MVP Scope

FR-2, FR-4 are MVP. FR-1, FR-3 are Phase 2.

## Risks and Dependencies

- BodyContact scraping must respect robots.txt and require user consent
- Landing page is pre-launch priority
