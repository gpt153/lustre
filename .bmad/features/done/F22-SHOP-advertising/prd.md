# PRD: Advertising Platform — Self-Serve Ads with Unique Targeting

## Overview

Self-serve advertising platform (Facebook model) with unique targeting capabilities: sexual orientation, kinks, relationship type, interests. Ad formats: native feed ads, event sponsorship, stories ads. CPM/CPC billing.

## Target Audience

Businesses: sex shops, underwear brands, event organizers, health services

## Functional Requirements (FR)

### FR-1: Ad Campaign Creation
- Priority: Must
- Acceptance criteria: Given an advertiser, then they create campaigns with target audience, budget, schedule, and creative

### FR-2: Ad Targeting
- Priority: Must
- Acceptance criteria: Given targeting options, then advertisers can target by location, age, gender, orientation, interests, relationship type

### FR-3: Ad Delivery
- Priority: Must
- Acceptance criteria: Given the feed, then native ads are inserted among organic content, labeled as "Sponsored"

### FR-4: Analytics Dashboard
- Priority: Must
- Acceptance criteria: Given a campaign, then advertisers see impressions, clicks, CTR, spend

### FR-5: Budget Management
- Priority: Must
- Acceptance criteria: Given a daily budget, then ad delivery stops when budget is exhausted

## MVP Scope

FR-1, FR-2, FR-3, FR-5 are MVP. FR-4 basic version only.

## Risks and Dependencies

- Depends on F04 (profiles for targeting), F05 (feed for ad placement)
- Ad review/moderation process needed
- GDPR: explicit consent for ad targeting based on special category data
