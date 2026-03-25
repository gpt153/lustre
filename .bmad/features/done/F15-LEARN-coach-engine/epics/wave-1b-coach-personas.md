# Epic: wave-1b-coach-personas
**Model:** sonnet
**Wave:** 1 — Group A (runs second, after wave-1a)

## Goal
Define two AI coach personas with distinct system prompts, ElevenLabs voice IDs, and personality configurations. Replace the placeholder in `personas.py` with fully defined personas.

## Context
- `services/coach/personas.py` was created in wave-1a with a placeholder
- `services/coach/main.py` exists with basic AgentSession setup
- Persona selection: determined by `metadata` passed in LiveKit room (e.g. `coach_type=coach|partner`)
- ElevenLabs voices: use real voice IDs from ElevenLabs premade voices (e.g. "Adam" for coach, "Rachel" for partner)
- The coach is "Axel" — supportive male, like an older brother giving dating advice
- The practice partner is "Sophia" — realistic Swedish woman, sometimes warm, sometimes challenging

## File Paths to Modify
1. `services/coach/personas.py` — replace placeholder with full persona definitions
2. `services/coach/main.py` — update entrypoint to read `coach_type` from room metadata and select persona

## Acceptance Criteria
1. `personas.py` defines `PERSONAS` dict with keys `"coach"` and `"partner"`
2. Each persona entry has: `name`, `voice_id` (ElevenLabs voice ID string), `system_prompt` (multi-line string)
3. Coach `"Axel"` system prompt: supportive older brother, gives concrete dating advice, calls user "bror" occasionally, Swedish-Swedish context, encourages action
4. Partner `"Sophia"` system prompt: realistic Swedish woman on a date, responds naturally to what user says, can be warm or reserved depending on vibe, does not break character
5. `main.py` entrypoint reads room metadata key `"coach_type"` (default to `"coach"` if absent), selects persona from `PERSONAS`, passes `system_prompt` as initial LLM context, uses `voice_id` for ElevenLabs TTS
6. `main.py` uses `elevenlabs.TTS(voice_id=persona["voice_id"])` with the selected persona voice
7. No TODO comments, no placeholder voice IDs — use real ElevenLabs premade voice IDs (e.g. "21m00Tcm4TlvDq8ikWAM" for Rachel, "ErXwobaYiN019PkySvjV" for Antoni)
