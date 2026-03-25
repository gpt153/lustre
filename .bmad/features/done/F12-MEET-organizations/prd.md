# PRD: Organizations — B2B Profiles, Member Management

## Overview

Verified organization profiles for clubs, associations, and businesses. Organizations get member management, internal chat, event tools, and can run webshops. Verification costs 500 SEK one-time.

## Target Audience

Swinger clubs, BDSM associations, sex shops, event companies

## Functional Requirements (FR)

### FR-1: Organization Profile
- Priority: Must
- Acceptance criteria:
  - Given a business user, when creating an org, then they provide name, description, type, location, contact info, and cover image
  - Given verification payment (500 SEK), then the org is manually reviewed and verified

### FR-2: Member Management
- Priority: Must
- Acceptance criteria:
  - Given an org, when users follow/join, then they appear as members
  - Given org admins, then they can manage roles (admin, moderator, member)

### FR-3: Org Events & Content
- Priority: Should
- Acceptance criteria:
  - Given an org, then they can create events visible to their members and/or public

## MVP Scope

FR-1, FR-2 are MVP. Webshop integration is in F21.

## Risks and Dependencies

- Depends on F04 (profiles), F11 (events), manual review process needed
