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
**Status:** DONE
**Started:** 2026-03-26T00:15:00Z
**Completed:** 2026-03-26T01:00:00Z

### Parallelization groups:
**Group A (parallel):**
- wave-2a-bodycontact-import (sonnet) — BodyContact profile scraper: fetch public profile by username, extract text + images, import into Lustre profile with user consent flow
- wave-2b-invite-system (haiku) — Invite link generation, referral tracking, reward system (free tokens for referrer and referee)

### Epic status:
- wave-2a-bodycontact-import: VERIFIED — migration-router.ts, MigrationScreen.tsx, useMigration.ts, settings/migration page all created
- wave-2b-invite-system: VERIFIED — invite-router.ts, schema models, SQL migration, InviteScreen.tsx, useInvite.ts, invite pages created

### Testgate Wave 2: PASS (static verification)
- [x] BodyContact import fetches public profile — migration-router.ts previewBodyContact fetches bodycontact.com with cheerio parsing
- [x] Imported data populates new Lustre profile — importBodyContact updates Profile.bio + creates ProfilePhoto records via R2
- [x] Invite links trackable — inviteRouter.generate creates InviteLink with nanoid code, getMyLinks returns them
- [x] Referral rewards credited — claim mutation creates ReferralReward + calls creditTokens for both parties
