# Roadmap: F16-LEARN-coach-vanilla

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 5

---

## Wave 1: Module Framework & Content
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (sequential):**
- wave-1a-module-schema (haiku) — Prisma: Module, Lesson, UserModuleProgress, UserLessonProgress. Module metadata: order, title, description, badge.
- wave-1b-module-api (haiku) — tRPC: module.list, module.get, module.startLesson, module.completeLesson, module.getProgress
- wave-1c-vanilla-content (sonnet) — System prompts for modules 1-10: coach guidance text, practice partner scenario scripts, assessment criteria. Each module 3-5 lessons.

### Testgate Wave 1:
- [ ] 10 modules seeded with metadata
- [ ] Module progression tracked per user
- [ ] Lesson completion recorded

---

## Wave 2: Module Screens
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-learn-screens-mobile (haiku) — Module list with progress, lesson view, start coaching session button, badge display on completion
- wave-2b-learn-screens-web (haiku) — Same for web

### Testgate Wave 2:
- [ ] Module list shows lock/unlock status
- [ ] Lesson launches coaching session with correct module context
- [ ] Badge awarded on module completion
