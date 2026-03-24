# Roadmap: F07-CONNECT-gatekeeper

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 3
**Total epics:** 7

---

## Wave 1: Gatekeeper Backend
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-gatekeeper-schema (haiku) — Prisma: GatekeeperConfig, GatekeeperConversation, GatekeeperMessage. Config fields: enabled, strictness, customQuestions, dealbreakers, aiTone.
- wave-1b-gatekeeper-config-api (haiku) — tRPC: gatekeeper.getConfig, gatekeeper.updateConfig, gatekeeper.toggle. Validation rules.

### Testgate Wave 1:
- [ ] Gatekeeper config stored and retrievable
- [ ] Default ON for female profiles
- [ ] Config validation rejects invalid strictness levels

---

## Wave 2: AI Qualification Engine
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-2a-ai-qualification (sonnet) — AI service: build system prompt from recipient preferences, manage multi-turn conversation, classify match/mismatch, generate summary. OpenAI GPT-4o mini integration.
- wave-2b-gatekeeper-flow (sonnet) — Orchestration: intercept message send, start AI conversation, handle AI responses, on pass -> deliver message with badge, on fail -> redirect with feedback
- wave-2c-token-integration (haiku) — Connect to token system: check balance before start, debit on conversation completion, handle insufficient balance

### Parallelization rationale:
- Sequential: each step depends on the previous

### Testgate Wave 2:
- [ ] AI conversation starts when messaging gatekeeper-enabled user
- [ ] AI asks relevant questions based on recipient preferences
- [ ] Passed sender's message delivered with AI-qualified badge
- [ ] Failed sender gets constructive redirect
- [ ] Tokens debited from sender, never from recipient

---

## Wave 3: Gatekeeper Screens & Bypass Rules
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-3a-gatekeeper-screens-mobile (haiku) — Gatekeeper conversation UI in chat, config settings screen, AI-qualified badge display
- wave-3b-gatekeeper-screens-web (haiku) — Same for web

**Group B (sequential, after A):**
- wave-3c-bypass-rules (haiku) — Mutual match bypass, pair profile qualification, no-purchase-bypass enforcement

### Testgate Wave 3:
- [ ] Gatekeeper conversation renders in chat UI
- [ ] Settings screen allows config changes
- [ ] Mutual match bypasses Gatekeeper
- [ ] Pair profiles qualified as unit
