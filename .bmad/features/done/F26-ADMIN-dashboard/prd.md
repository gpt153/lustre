# PRD: Admin Dashboard

## Overview

Internal admin dashboard for user management, moderation, content review, analytics, system health, and business configuration. Built as a separate Next.js app at admin.lovelustre.com.

## Target Audience

Lustre admin team

## Functional Requirements (FR)

### FR-1: User Management
- Priority: Must
- Acceptance criteria: Given admin, then they can search users, view profiles, suspend/ban accounts, view activity history

### FR-2: Moderation Dashboard
- Priority: Must
- Acceptance criteria: Given admin, then they see report queue, content moderation queue, and can take actions

### FR-3: Analytics Overview
- Priority: Should
- Acceptance criteria: Given admin, then they see key metrics: DAU/MAU, registrations, gender ratio, revenue, AI costs

### FR-4: System Configuration
- Priority: Should
- Acceptance criteria: Given admin, then they can adjust spread config, feature flags, and system settings

### FR-5: Business Management
- Priority: Should
- Acceptance criteria: Given admin, then they can review org verification requests, manage ad campaigns

## MVP Scope

FR-1, FR-2 are MVP.

## Risks and Dependencies

- Depends on all other features having admin APIs
- Umami integration for analytics
