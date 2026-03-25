# Roadmap: F15-LEARN-coach-engine

**Status:** DONE — all waves implemented and tested
**Created:** 2026-03-24
**Started:** 2026-03-25
**Waves:** 2
**Total epics:** 5

---

## Wave 1: AI Agent Backend
**Status:** DONE
**Started:** 2026-03-25T00:00:00Z
**Completed:** 2026-03-25T01:00:00Z

### Parallelization groups:
**Group A (sequential):**
- wave-1a-ai-agent-service (sonnet) — **VERIFIED** — Python LiveKit Agents service + Fastify /api/coach/token endpoint
- wave-1b-coach-personas (sonnet) — **VERIFIED** — Two AI personas (Axel coach, Sophia partner) with system prompts and ElevenLabs voice IDs
- wave-1c-session-management (haiku) — **VERIFIED** — Prisma: CoachSession, SessionMessage + tRPC coach router + token billing

### Testgate Wave 1: PASS
- [x] services/coach/ directory with requirements.txt, main.py, personas.py, Dockerfile — PASS
- [x] POST /api/coach/token endpoint returns token + wsUrl — PASS
- [x] CoachSession and SessionMessage in Prisma schema — PASS
- [x] tRPC coach router registered at appRouter.coach — PASS
- [x] TokenTransactionType includes COACH_SESSION — PASS
- [x] TypeScript compilation clean (no coach-router errors after prisma generate) — PASS
- [x] Prisma client generation — PASS

---

## Wave 2: Coach Screens
**Status:** DONE
**Started:** 2026-03-25T01:00:00Z
**Completed:** 2026-03-25T02:00:00Z

### Parallelization groups:
**Group A (parallel):**
- wave-2a-coach-screens-mobile (haiku) — **VERIFIED** — Session start screen (choose persona, mode), active session UI, session history
- wave-2b-coach-screens-web (haiku) — **VERIFIED** — Same for web

### Testgate Wave 2: PASS
- [x] CoachStartScreen renders persona and mode selection (COACH/PARTNER cards, VOICE/TEXT buttons) — PASS
- [x] CoachSessionScreen shows timer (elapsed mm:ss) and "Avsluta" end button — PASS
- [x] CoachHistoryScreen shows past sessions via trpc.coach.list — PASS
- [x] Web /coach pages exist (history, start, session) — PASS
- [x] Tokens debited on session end (trpc.coach.end wired in both mobile and web) — PASS
- [x] Coach tab added to mobile layout — PASS
- [x] Coach nav link added to web layout — PASS
