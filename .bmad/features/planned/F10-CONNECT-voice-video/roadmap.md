# Roadmap: F10-CONNECT-voice-video

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 4

---

## Wave 1: LiveKit Backend
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-livekit-setup (sonnet) — LiveKit server deployment on k3s, JWT token generation for room access, TURN/STUN config
- wave-1b-call-api (haiku) — tRPC: call.initiate, call.accept, call.reject, call.end. Room creation, participant management.

### Testgate Wave 1:
- [ ] LiveKit server running on k3s
- [ ] Room created programmatically
- [ ] JWT tokens grant room access

---

## Wave 2: Call Screens
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-call-screens-mobile (haiku) — Voice/video call UI with LiveKit React Native SDK, background blur option, call controls (mute, camera toggle, end)
- wave-2b-call-screens-web (haiku) — Same for web with LiveKit React SDK

### Testgate Wave 2:
- [ ] 1:1 voice call works between two users
- [ ] 1:1 video call works with camera toggle
- [ ] Background blur option works
- [ ] Call tokens debited correctly
