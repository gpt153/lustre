# Roadmap: F27-GROWTH-migration

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Started:** 2026-03-26
**Waves:** 2
**Total epics:** 4

---

## Wave 1: Landing Page & Onboarding
**Status:** DONE
**Started:** 2026-03-26T00:00:00Z
**Completed:** 2026-03-26T00:10:00Z

### Parallelization groups:
**Group A (parallel):**
- wave-1a-landing-page (haiku) — Add countdown timer to existing landing page; hero/email/social proof already exist
- wave-1b-onboarding-tracking (haiku) — Add onStep tracking callback to OnboardingWizard, wire to Umami in web page

### Epic status:
- wave-1a-landing-page: VERIFIED — countdown.tsx created, integrated in page.tsx + landing.css
- wave-1b-onboarding-tracking: VERIFIED — onStep prop added to OnboardingWizard, web page wires to Umami

### Testgate Wave 1: PASS
- [x] Landing page has countdown timer visible — countdown.tsx created, integrated
- [x] Email signups collected — /api/waitlist endpoint already working
- [x] Onboarding funnel tracked — onStep callbacks fire Umami events

---

## Wave 2: Migration & Referrals
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-bodycontact-import (sonnet) — BodyContact profile scraper: fetch public profile by username, extract text + images, import into Lustre profile with user consent flow
- wave-2b-invite-system (haiku) — Invite link generation, referral tracking, reward system (free tokens for referrer and referee)

### Epic status:
- wave-2a-bodycontact-import: NOT_STARTED
- wave-2b-invite-system: NOT_STARTED

### Testgate Wave 2:
- [ ] BodyContact import fetches public profile
- [ ] Imported data populates new Lustre profile
- [ ] Invite links trackable
- [ ] Referral rewards credited
