# PRD: SafeDate — GPS Tracking, Check-ins, Emergency Escalation

## Overview

Safety system for physical meetups. User activates SafeDate before a date, sets duration and safety contacts. GPS is logged continuously. Escalation chain: missed check-in -> phone call -> SMS to contacts -> 112 call with GPS + identity. Always free.

## Target Audience

All users meeting someone in person (especially women)

## Functional Requirements (FR)

### FR-1: SafeDate Activation
- Priority: Must
- Acceptance criteria:
  - Given a user, when activating SafeDate, then they set who they are meeting, estimated duration, and safety contacts
  - Given activation, then background GPS tracking starts (every 5-10 seconds)

### FR-2: Check-in System
- Priority: Must
- Acceptance criteria:
  - Given timer expiry, when the user has not checked in, then escalation begins
  - Given check-in prompt, when the user confirms with PIN, then the timer resets

### FR-3: Escalation Chain
- Priority: Must
- Acceptance criteria:
  - Given no check-in after 5 minutes, then safety contacts receive SMS with GPS coordinates
  - Given no response after 10 minutes, then system initiates 112 call (via tel: URI) and activates microphone streaming

### FR-4: Live Location Sharing
- Priority: Should
- Acceptance criteria:
  - Given safety contacts, when the user enables live sharing, then contacts can see real-time location on a map

### FR-5: Free Forever
- Priority: Must
- Acceptance criteria:
  - Given SafeDate, then it costs zero tokens, always, no exceptions

## Non-Functional Requirements (NFR)

- GPS accuracy: within 10 meters
- Background GPS must not drain battery excessively (react-native-background-geolocation optimizations)
- GPS data encrypted at rest, deleted 24h after SafeDate ends (unless escalated)

## MVP Scope

FR-1, FR-2, FR-3 (SMS to contacts only, not 112 integration), FR-5 are MVP.

## Risks and Dependencies

- Depends on F02 (auth for identity), F04 (profiles)
- Background GPS permissions on iOS require careful UX
- 112 integration is Phase 2 (no public API from SOS Alarm)
- Microphone streaming requires foreground service (Android) / background audio session (iOS)
