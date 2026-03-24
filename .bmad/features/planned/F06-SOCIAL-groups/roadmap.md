# Roadmap: F06-SOCIAL-groups

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 5

---

## Wave 1: Group Backend
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-group-schema (haiku) — Prisma: Group, GroupMember, GroupModerator. Membership states: pending, active, banned.
- wave-1b-group-api (haiku) — tRPC: group.create, group.join, group.leave, group.approve, group.list, group.search
- wave-1c-group-moderation (haiku) — Moderator actions: remove post, ban member, edit group settings

### Testgate Wave 1:
- [ ] Group CRUD works
- [ ] Private group requires approval
- [ ] Moderator can ban members

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
