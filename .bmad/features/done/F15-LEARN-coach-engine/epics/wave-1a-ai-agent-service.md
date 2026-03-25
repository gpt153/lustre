# Epic: wave-1a-ai-agent-service
**Model:** sonnet
**Wave:** 1 — Group A (runs first, sequential)

## Goal
Create a Python LiveKit Agents microservice that connects to LiveKit rooms as an AI participant, processes speech in real-time, and responds via ElevenLabs TTS. Also add a Fastify REST endpoint to dispatch agent to a room.

## Context
- LiveKit is self-hosted at `wss://livekit.lovelustre.com`
- Existing Fastify API at `services/api/`, env vars `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_WS_URL` already used
- Token generation pattern in `services/api/src/lib/livekit.ts`
- Auth pattern: Bearer JWT → `verifyToken` → `userId` (see `services/api/src/routes/call.ts`)

## File Paths to Create
1. `services/coach/requirements.txt`
2. `services/coach/main.py`
3. `services/coach/personas.py` (placeholder, filled in epic 1b)
4. `services/coach/Dockerfile`
5. `services/api/src/routes/coach.ts` — POST /api/coach/token (create room + return LiveKit token + wsUrl for user)

## Acceptance Criteria
1. `services/coach/requirements.txt` lists: `livekit-agents>=0.12`, `livekit-plugins-openai`, `livekit-plugins-elevenlabs`, `livekit-plugins-silero`, `fastapi`, `uvicorn`
2. `services/coach/main.py` defines a `CoachAgent` class using `livekit.agents.Agent` with a `prewarm` entrypoint loading `silero.VAD`
3. `main.py` has an `entrypoint` async function that calls `ctx.connect()` and creates `AgentSession` with STT (openai whisper-1), LLM (openai gpt-4o-mini), TTS (elevenlabs), VAD (silero)
4. `main.py` reads env vars: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`
5. `services/coach/Dockerfile` uses `python:3.11-slim`, installs requirements, runs `python main.py start`
6. `services/api/src/routes/coach.ts` exports `coachRoutes(fastify)` with `POST /api/coach/token` — requires Bearer JWT auth, accepts `{ mode: 'voice'|'text' }` body, creates roomName `coach-{userId}-{uuid}`, calls `generateCallToken(userId, roomName)`, returns `{ token, wsUrl, roomName }`
7. `services/coach/personas.py` exports `DEFAULT_SYSTEM_PROMPT = "You are a helpful dating coach."` as placeholder
8. No TODO comments, no half-finished stubs — all files fully functional
