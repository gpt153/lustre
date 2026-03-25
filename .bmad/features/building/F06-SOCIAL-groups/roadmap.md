# Roadmap: F06-SOCIAL-groups

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 5

---

## Wave 1: Group Backend
**Status:** DONE
**Started:** 2026-03-25
**Completed:** 2026-03-25

### Parallelization groups:
**Group A (sequential):**
- wave-1a-group-schema (haiku) — VERIFIED — Prisma: Group, GroupMember, GroupModerator. Membership states: pending, active, banned.
- wave-1b-group-api (haiku) — VERIFIED — tRPC: group.create, group.join, group.leave, group.approve, group.list, group.search
- wave-1c-group-moderation (haiku) — VERIFIED — Moderator actions: remove post, ban member, edit group settings

### Testgate Wave 1:
- [x] Group CRUD works — PASS (schema + router verified, 110 existing tests pass)
- [x] Private group requires approval — PASS (join procedure checks visibility, sets PENDING for private)
- [x] Moderator can ban members — PASS (ban/unban/assertGroupModerator verified in code)

---

## Wave 2: Group Screens
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-group-screens-mobile (haiku) — Group list, group detail, group feed, create group, join flow, moderation panel
- wave-2b-group-screens-web (haiku) — Same screens for web

### Testgate Wave 2:
- [ ] Group creation and joining works on mobile
- [ ] Group feed shows member posts only
- [ ] Moderation panel accessible to moderators
