# PRD: Profiles — Creation, Editing, Pair Linking, Identity Fields

## Overview

User profile system supporting rich identity fields (gender 10+ options, sexual orientation, relationship type, kink tags), photo upload with AI classification, pair/poly linking (up to 5 people), and vanilla/spicy visibility separation. Profiles are the foundation that all other features reference.

## Target Audience

All Lustre users

## Functional Requirements (FR)

### FR-1: Profile Creation Onboarding
- Priority: Must
- Acceptance criteria:
  - Given a verified user, when completing onboarding, then they set display name, age, gender, orientation, what-seeking, and upload at least 1 photo
  - Given onboarding, when the user selects content preferences (soft/open/explicit/no-dick-pics), then these are stored

### FR-2: Profile Fields
- Priority: Must
- Acceptance criteria:
  - Given the profile editor, when viewing gender options, then 10+ options plus free text are available
  - Given spicy mode, when viewing a profile, then kink tags with interest levels (curious/like/love) are visible
  - Given vanilla mode, when viewing a profile, then kink tags are hidden

### FR-3: Photo Management
- Priority: Must
- Acceptance criteria:
  - Given a photo upload, when the image is processed, then it is stored in Cloudflare R2 with multiple resolutions
  - Given a photo, when AI classification runs, then multi-label tags are stored (nudity level, body part, etc.)

### FR-4: Pair/Poly Linking
- Priority: Should
- Acceptance criteria:
  - Given two verified users, when they initiate pair linking, then both must confirm
  - Given a pair profile, when displayed in search, then it shows as a connected unit

### FR-5: Profile Verification Badge
- Priority: Must
- Acceptance criteria:
  - Given BankID-verified user, then a verification badge is visible on their profile

## Non-Functional Requirements (NFR)

- Photo upload: max 10 photos, 20MB each, compressed to WebP
- Profile load time: < 500ms
- Search index updated within 2 seconds of profile change

## Affected Systems

- services/api (profile CRUD, photo upload)
- packages/api (profile schemas)
- apps/mobile (profile screens)
- apps/web (profile pages)
- Cloudflare R2 (photo storage)
- Meilisearch (profile indexing)

## MVP Scope

FR-1, FR-2, FR-3, FR-5 are MVP. FR-4 (pair linking) is Phase 2.

## Risks and Dependencies

- Depends on F02 (auth) and F03 (database)
- Cloudflare R2 bucket setup required
- AI classification depends on F24 (content moderation) or can use basic Sightengine API
