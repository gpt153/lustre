# Roadmap: F15-LEARN-coach-engine

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 5

---

## Wave 1: AI Agent Backend
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-ai-agent-service (sonnet) — Python FastAPI service: LiveKit Agents framework, speech-to-text pipeline, LLM conversation engine (Claude/GPT), ElevenLabs TTS output
- wave-1b-coach-personas (sonnet) — Two AI personas with distinct system prompts, voice configs, and personality traits. Coach: supportive older brother. Partner: realistic woman.
- wave-1c-session-management (haiku) — Prisma: CoachSession, SessionMessage. Session lifecycle: create, start, pause, end. Duration tracking, mode tracking (video/voice/text).

### Testgate Wave 1:
- [ ] AI agent joins LiveKit room and responds to speech
- [ ] Coach persona has distinct voice and personality
- [ ] Session duration tracked accurately

---

## Wave 2: Coach Screens
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-coach-screens-mobile (haiku) — Session start screen (choose persona, mode), active session UI (LiveKit participant view), session history
- wave-2b-coach-screens-web (haiku) — Same for web

### Testgate Wave 2:
- [ ] Voice session with coach works end-to-end
- [ ] Text session with coach works
- [ ] Session history shows past sessions
- [ ] Tokens debited per minute
