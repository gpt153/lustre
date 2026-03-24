# Roadmap: F18-LEARN-gamification

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 4

---

## Wave 1: Gamification Backend
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-gamification-schema (haiku) — Prisma: Badge, Medal, UserBadge, UserMedal, UserStreak. Badge/Medal metadata: name, icon, description, criteria.
- wave-1b-gamification-api (haiku) — tRPC: gamification.getBadges, gamification.getMedals, gamification.getLeaderboard, gamification.getStreak. Award triggers on module completion.

### Testgate Wave 1:
- [ ] 18 badges and 15 medals seeded
- [ ] Badge awarded on module completion
- [ ] Streak increments on daily activity

---

## Wave 2: Gamification Screens
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-gamification-mobile (haiku) — Badge/medal display on profile, achievement screen, leaderboard view, streak widget
- wave-2b-gamification-web (haiku) — Same for web

### Testgate Wave 2:
- [ ] Badges visible on user profile
- [ ] Achievement screen shows all earned/unearned
- [ ] Leaderboard shows anonymous percentile
