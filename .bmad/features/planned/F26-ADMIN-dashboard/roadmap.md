# Roadmap: F26-ADMIN-dashboard

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 5

---

## Wave 1: Admin Backend
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-admin-auth (haiku) — Admin role system, admin-only middleware, admin user seeding
- wave-1b-admin-api (haiku) — tRPC: admin.searchUsers, admin.getUser, admin.suspendUser, admin.banUser, admin.getReports, admin.resolveReport
- wave-1c-admin-analytics (haiku) — Analytics API: DAU/MAU, registrations by period, gender ratio, revenue summary, AI cost summary

### Testgate Wave 1:
- [ ] Admin auth works with role check
- [ ] User search and management works
- [ ] Analytics queries return data

---

## Wave 2: Admin UI
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-admin-app (haiku) — Next.js admin app: user management table, moderation queue, analytics dashboard (charts), system config
- wave-2b-umami-integration (haiku) — Umami self-hosted setup, tracking script in web/mobile apps, admin analytics page

### Testgate Wave 2:
- [ ] Admin dashboard loads at admin.lovelustre.com
- [ ] User management table with search/filter
- [ ] Moderation queue shows reports
- [ ] Analytics charts display metrics
