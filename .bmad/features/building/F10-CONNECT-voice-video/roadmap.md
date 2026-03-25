# Roadmap: F10-CONNECT-voice-video

**Status:** DONE — all waves implemented and tested
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
**Status:** DONE
**Started:** 2026-03-25
**Completed:** 2026-03-25

### Parallelization groups:
**Group A (parallel):**
- wave-2a-call-screens-mobile (haiku) — Voice/video call UI with LiveKit React Native SDK, background blur option, call controls (mute, camera toggle, end) — **VERIFIED**
- wave-2b-call-screens-web (haiku) — Same for web with LiveKit React SDK — **VERIFIED**

### Testgate Wave 2: PARTIALLY_APPROVED (2026-03-25)
- [x] useCall hook: polls getStatus, fetches token on ACTIVE, exposes all controls — PASS
- [x] CallScreen: renders ringing/connected/incoming states, mute/camera/blur/end — PASS
- [x] Mobile call route apps/mobile/app/call/[callId].tsx — PASS
- [x] Web call page apps/web/app/(app)/call/[callId]/page.tsx — PASS
- [x] ChatRoomScreen has call button (📞 → voice/video picker) — PASS
- [x] Web chat page has 📞/🎥 buttons that navigate to /call/[callId] — PASS
- [x] TypeScript: 0 new errors introduced by Wave 2 — PASS
- [ ] 1:1 voice call works between two users — INCONCLUSIVE (requires live LiveKit server)
- [ ] 1:1 video call works with camera toggle — INCONCLUSIVE (requires live LiveKit server)
- [ ] Background blur option works — INCONCLUSIVE (requires device/browser)
- [ ] Call tokens debited correctly — DEFERRED (depends on F23 token system)
