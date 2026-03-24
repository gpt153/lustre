# PRD: Feed — For You, Posts, AI Classification, User Filters

## Overview

Social feed with posts (text + images), AI-curated "For You" algorithm, multi-label content classification (not binary SFW/NSFW), and user-controlled content filters. The feed respects vanilla/spicy mode and the user's personal filter settings.

## Target Audience

All Lustre users

## Functional Requirements (FR)

### FR-1: Post Creation
- Priority: Must
- Acceptance criteria:
  - Given a user, when creating a post, then they can add text (max 2000 chars) and up to 4 images
  - Given a post with images, then each image is classified by AI with multi-label tags

### FR-2: Feed Algorithm
- Priority: Must
- Acceptance criteria:
  - Given a user opening the app, when viewing the feed, then posts are ranked by relevance (interests, interactions, location, recency)
  - Given "Show less like this", when tapped, then similar content is deprioritized

### FR-3: Content Classification
- Priority: Must
- Acceptance criteria:
  - Given an uploaded image, when classified, then it receives tags across 5 dimensions (nudity level, body part, activity, vibe, gender)
  - Given classification tags, then they are stored per content item for filter matching

### FR-4: User Content Filters
- Priority: Must
- Acceptance criteria:
  - Given onboarding presets (soft/open/explicit/no-dick-pics), then the feed respects the selection
  - Given detailed filter settings, then users can toggle per classification dimension

### FR-5: Stories (24h ephemeral)
- Priority: Could
- Acceptance criteria:
  - Given a story post, when 24 hours pass, then it is automatically deleted

## Non-Functional Requirements (NFR)

- Feed load: < 1 second for first 10 posts
- Content classification: < 3 seconds per image
- Feed pagination: infinite scroll with cursor-based pagination

## MVP Scope

FR-1, FR-2 (basic chronological + interest weighting), FR-3, FR-4 are MVP.

## Risks and Dependencies

- Depends on F04 (profiles), F24 (content moderation for classification)
- Sightengine API key required for classification
- Feed algorithm Phase 1 can be simple scoring in PostgreSQL
