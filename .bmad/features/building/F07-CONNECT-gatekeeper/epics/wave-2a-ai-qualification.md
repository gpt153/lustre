# Epic: wave-2a-ai-qualification
**Model:** sonnet
**Wave:** 2, Group A (sequential, first)

## Description
AI qualification service: builds system prompt from recipient preferences, manages multi-turn conversation, classifies match/mismatch, generates summary. Uses OpenAI GPT-4o mini.

## Acceptance Criteria
1. AI service module created at services/api/src/lib/gatekeeper-ai.ts
2. System prompt builder: takes GatekeeperConfig + Profile and builds a qualification prompt that references preferences WITHOUT revealing dealbreakers verbatim
3. Conversation manager: maintains conversation history, sends to OpenAI, returns AI response
4. Classification logic: AI determines PASS/FAIL after 3-5 exchanges based on strictness level
5. Summary generator: on PASS, generates a brief compatibility summary for the recipient
6. Strict mode asks more probing questions (4-5 exchanges); Mild mode is lenient (2-3 exchanges)
7. AI tone (formal/casual/flirty) reflected in responses
8. OpenAI GPT-4o-mini integration via openai SDK
9. Response time target: AI response generated within 2 seconds
10. No TODO/FIXME comments

## File Paths
- services/api/src/lib/gatekeeper-ai.ts (new)
- services/api/package.json (add openai dependency)
