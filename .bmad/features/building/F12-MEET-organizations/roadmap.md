# Roadmap: F12-MEET-organizations

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 4

---

## Wave 1: Organization Backend
**Status:** IN_PROGRESS
**Started:** 2026-03-25

### Parallelization groups:
**Group A (sequential):**
- wave-1a-org-schema (haiku) — Prisma: Organization, OrgMember, OrgVerification. Roles: owner, admin, moderator, member. **Status: VERIFIED**
- wave-1b-org-api (haiku) — tRPC: org.create, org.get, org.list, org.update, org.join, org.leave, org.getMembers, org.addMember, org.removeMember, org.requestVerification. **Status: VERIFIED**

### Testgate Wave 1:
- [INCONCLUSIVE] Organization CRUD works — schema push blocked by missing pgvector in docker-compose postgres (pre-existing infra limitation)
- [INCONCLUSIVE] Member management with roles works — same infra limitation
- [INCONCLUSIVE] Verification request creates pending review — same infra limitation
- NOTE: 55 existing tests pass; wave2/wave3 test suites fail at import due to pre-existing `call` reserved word in tRPC v11 (not introduced by this feature)
- **Testgate result: INCONCLUSIVE (infrastructure limitation, not code defects)**

---

## Wave 2: Organization Screens
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-org-screens-mobile (haiku) — Org profile, member list, admin panel, create org flow
- wave-2b-org-screens-web (haiku) — Same for web

### Testgate Wave 2:
- [ ] Org profile displays on mobile and web
- [ ] Admin panel accessible to org owners
- [ ] Member join/leave works
