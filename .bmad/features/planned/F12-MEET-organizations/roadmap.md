# Roadmap: F12-MEET-organizations

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 4

---

## Wave 1: Organization Backend
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-org-schema (haiku) — Prisma: Organization, OrgMember, OrgVerification. Roles: owner, admin, moderator, member.
- wave-1b-org-api (haiku) — tRPC: org.create, org.verify, org.update, org.getMembers, org.addMember, org.removeMember

### Testgate Wave 1:
- [ ] Organization CRUD works
- [ ] Member management with roles works
- [ ] Verification request creates pending review

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
