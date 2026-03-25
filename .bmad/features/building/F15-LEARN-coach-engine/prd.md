# PRD: Coach Engine — LiveKit + Tavus + ElevenLabs Infrastructure

## Overview

Infrastructure for the AI Dating Coach: LiveKit AI Agents for WebRTC rooms, Tavus CVI for AI avatar video, ElevenLabs for voice synthesis. Two AI personas: male coach ("wingman") and female practice partner. Supports video calls, voice calls, and text chat with AI.

## Target Audience

Users accessing AI coaching features

## Functional Requirements (FR)

### FR-1: LiveKit AI Agent
- Priority: Must
- Acceptance criteria:
  - Given a coaching session request, when initiated, then a LiveKit room is created with the user and an AI agent
  - Given the AI agent, then it processes user speech in real-time and generates responses

### FR-2: AI Coach Persona (Male)
- Priority: Must
- Acceptance criteria:
  - Given the coach, when activated, then it uses a specific ElevenLabs voice (supportive, encouraging male voice)
  - Given Tavus CVI, when video mode, then a realistic male avatar lip-syncs to the coach's speech

### FR-3: AI Practice Partner Persona (Female)
- Priority: Must
- Acceptance criteria:
  - Given the practice partner, when activated, then it uses a specific ElevenLabs voice (natural female voice)
  - Given scenarios, then the practice partner responds realistically (sometimes positive, sometimes rejecting)

### FR-4: Session Modes
- Priority: Must
- Acceptance criteria:
  - Given video mode, then Tavus CVI renders avatar (highest cost, ~$0.50/min)
  - Given voice mode, then only ElevenLabs voice (medium cost, ~$0.15/min)
  - Given text mode, then LLM text response only (lowest cost, ~$0.02/min)

### FR-5: Session Token Billing
- Priority: Must
- Acceptance criteria:
  - Given an active session, then tokens are debited per minute based on mode

## MVP Scope

FR-1, FR-2, FR-4 (voice + text modes only) are MVP. Tavus CVI (video avatar) is Phase 2.

## Risks and Dependencies

- Depends on F10 (LiveKit), F23 (token system)
- Tavus CVI is expensive ($0.32-0.59/min) — voice-only mode is sufficient for MVP
- ElevenLabs API key required
