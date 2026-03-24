# PRD: AI Gatekeeper — Core Feature

## Overview

The AI Gatekeeper is Lustre's primary differentiator. When someone wants to contact a user who has Gatekeeper enabled, they first interact with an AI assistant that qualifies them based on the recipient's preferences. The AI asks questions, evaluates compatibility, and either passes the sender through with a summary or politely redirects them. Sender pays tokens; recipient never pays.

## Target Audience

All users (recipients enable it; senders interact with it)

## Functional Requirements (FR)

### FR-1: Gatekeeper Activation
- Priority: Must
- Acceptance criteria:
  - Given a user, when they enable Gatekeeper, then incoming messages are intercepted by AI
  - Given Gatekeeper settings, then the user can set strictness (mild/standard/strict), custom questions, dealbreakers, and AI tone (formal/casual/flirty)
  - Given default settings, then Gatekeeper is ON for female-presenting profiles

### FR-2: Qualification Flow
- Priority: Must
- Acceptance criteria:
  - Given a sender initiating contact, when Gatekeeper is active, then an AI conversation starts in the chat UI
  - Given the AI, when asking questions, then it references the recipient's preferences without revealing private details
  - Given the AI assessment, when the sender matches, then the message is delivered with an "AI-qualified" badge and summary
  - Given the AI assessment, when the sender does not match, then they are politely redirected with constructive feedback

### FR-3: Token Charging
- Priority: Must
- Acceptance criteria:
  - Given a Gatekeeper conversation, then the sender's token balance is debited (~2 SEK equivalent)
  - Given insufficient tokens, then the sender is prompted to top up before proceeding
  - Given the recipient, then they are NEVER charged for Gatekeeper interactions

### FR-4: Bypass Rules
- Priority: Must
- Acceptance criteria:
  - Given mutual match (both liked each other), then Gatekeeper is bypassed
  - Given pair profiles, then the AI qualifies the pair as a unit
  - Given any amount of money/tokens, then bypass cannot be purchased (hard rule, no exceptions)

### FR-5: Two-Tier AI Model
- Priority: Must
- Acceptance criteria:
  - Given a simple qualification (clear match/mismatch), then GPT-4o mini handles it (Tier 1, 80-90% of cases)
  - Given complex qualification (nuanced preferences), then Claude Sonnet handles it (Tier 2)

## Non-Functional Requirements (NFR)

- First AI response: < 2 seconds
- Full qualification: < 60 seconds (3-5 exchanges)
- AI must never reveal recipient's dealbreakers verbatim
- Conversation stored temporarily (7 days) for abuse review

## MVP Scope

FR-1, FR-2, FR-3, FR-4 are MVP. FR-5 can start with single model (GPT-4o mini) and add tiering later.

## Risks and Dependencies

- Depends on F02 (auth), F04 (profiles), F09 (chat), F23 (token system)
- AI prompt engineering critical — extensive testing needed
- Cost management: monitor AI spend per conversation
- Edge cases: what if sender lies to the AI?
