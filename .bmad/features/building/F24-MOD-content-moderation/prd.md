# PRD: Content Moderation — NSFW Classification, Dick-Pic Filter, Reporting

## Overview

Multi-label content classification using Sightengine (29 nudity classes + 110 categories), dedicated anti-unsolicited-dick-pic filter, user reporting system, moderation queue for admin review, and automated enforcement (warnings, temp bans, permanent bans).

## Target Audience

All users (protection), admin team (moderation tools)

## Functional Requirements (FR)

### FR-1: Image Classification
- Priority: Must
- Acceptance criteria: Given any uploaded image, then Sightengine classifies it across 5 dimensions (nudity, body part, activity, vibe, gender)

### FR-2: Dick-Pic Filter
- Priority: Must
- Acceptance criteria: Given a message with a classified penis-in-focus image, then it is blurred for recipients who have the filter active, with "Filtered image — tap to reveal" option

### FR-3: Reporting System
- Priority: Must
- Acceptance criteria: Given any content/user, then users can report with categories (harassment, spam, underage, non-consensual, other)

### FR-4: Moderation Queue
- Priority: Must
- Acceptance criteria: Given reported content, then it appears in an admin queue with context and action options (dismiss, warn, temp ban, permanent ban)

### FR-5: Automated Enforcement
- Priority: Should
- Acceptance criteria: Given repeated filtered messages from same sender, then auto-warning -> temp ban -> permanent ban

## MVP Scope

FR-1, FR-2, FR-3, FR-4 are MVP.

## Risks and Dependencies

- Sightengine API key ($99-399/month)
- Moderation team needed for queue review
- False positive handling for artistic nudity
