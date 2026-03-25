# PRD: Voice & Video Calls

## Overview

1:1 voice and video calls using self-hosted LiveKit (WebRTC). Background blur for anonymity, token-based billing per minute, and optional call recording with mutual consent.

## Target Audience

Matched users wanting real-time communication

## Functional Requirements (FR)

### FR-1: Voice Calls
- Priority: Must
- Acceptance criteria:
  - Given two matched users, when one initiates a voice call, then the other receives a push notification/in-app ring
  - Given an active call, then audio quality is clear with < 200ms latency

### FR-2: Video Calls
- Priority: Must
- Acceptance criteria:
  - Given a video call, when initiated, then both users see each other's video feed
  - Given background blur, when enabled, then the user's background is blurred

### FR-3: Call Controls
- Priority: Must
- Acceptance criteria:
  - Given an active call, then users can mute, toggle camera, toggle speaker, and end call

### FR-4: Token Billing
- Priority: Must
- Acceptance criteria:
  - Given an active call, then tokens are debited per minute from the initiator

## MVP Scope

FR-1, FR-2, FR-3 are MVP. FR-4 integrates with F23 (token system).

## Risks and Dependencies

- Depends on F03 (k3s), F09 (chat for call initiation), F23 (tokens)
- LiveKit requires TURN server for NAT traversal
