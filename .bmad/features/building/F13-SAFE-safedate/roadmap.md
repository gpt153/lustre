# Roadmap: F13-SAFE-safedate

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 5

---

## Wave 1: SafeDate Backend
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-safedate-schema (haiku) — Prisma: SafeDate, SafeDateCheckIn, SafetyContact, GPSLog. Statuses: active, checked_in, escalated, completed.
- wave-1b-safedate-api (sonnet) — tRPC: safedate.activate, safedate.checkin, safedate.extend, safedate.end. Escalation service: background job checking for missed check-ins, SMS via Twilio to safety contacts, GPS log encryption.
- wave-1c-gps-streaming (sonnet) — Background GPS collection endpoint, encrypted storage, WebSocket stream for live location sharing to safety contacts

### Testgate Wave 1:
- [ ] SafeDate activation stores config and starts timer
- [ ] Check-in resets timer
- [ ] Missed check-in triggers SMS to safety contacts
- [ ] GPS data stored encrypted

---

## Wave 2: SafeDate Screens
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-safedate-screens-mobile (sonnet) — Activation flow, active SafeDate overlay with timer, check-in prompt, SOS button, safety contact management, background GPS (react-native-background-geolocation)
- wave-2b-safety-contact-view (haiku) — Safety contact web view: receive SMS link, view live map with user's GPS, escalation status

### Testgate Wave 2:
- [ ] SafeDate activation works on mobile
- [ ] Background GPS tracks correctly
- [ ] Safety contacts can view location via web link
- [ ] SOS button triggers immediate escalation
