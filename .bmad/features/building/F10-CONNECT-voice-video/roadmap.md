# Roadmap: F10-CONNECT-voice-video

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 4

---

## Wave 1: LiveKit Backend
**Status:** DONE
**Started:** 2026-03-25
**Completed:** 2026-03-25

### Parallelization groups:
**Group A (sequential):**
- wave-1a-livekit-setup (sonnet) — LiveKit server deployment on k3s, JWT token generation for room access, TURN/STUN config — **VERIFIED**
- wave-1b-call-api (haiku) — tRPC: call.initiate, call.accept, call.reject, call.end. Room creation, participant management. — **VERIFIED**

### Testgate Wave 1: PASS (2026-03-25)
- [x] LiveKit Helm chart lints cleanly — PASS
- [x] Token service compiles, all source TS errors clear — PASS
- [x] Migration SQL creates call_sessions table + enums — PASS
- [x] tRPC call router has all 5 procedures — PASS
- [x] callRoutes registered in server.ts — PASS
- [ ] LiveKit server running on k3s — INCONCLUSIVE (requires k8s deploy)
- [ ] JWT tokens grant room access — INCONCLUSIVE (requires live server)

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
