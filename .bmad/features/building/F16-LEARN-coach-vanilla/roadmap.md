# Roadmap: F16-LEARN-coach-vanilla

**Status:** IN_PROGRESS
**Created:** 2026-03-24
**Started:** 2026-03-25
**Waves:** 2
**Total epics:** 5

---

## Wave 1: Module Framework & Content
**Status:** IN_PROGRESS
**Started:** 2026-03-25T00:00:00Z

### Parallelization groups:
**Group A (sequential):**
- wave-1a-module-schema (haiku) — Prisma: Module, Lesson, UserModuleProgress, UserLessonProgress. Module metadata: order, title, description, badge. **Status: VERIFIED** — 4 models + migration + seed data
- wave-1b-module-api (haiku) — tRPC: module.list, module.get, module.startLesson, module.completeLesson, module.getProgress **Status: VERIFIED** — module-router.ts created, registered in appRouter
- wave-1c-vanilla-content (sonnet) — System prompts for modules 1-10: coach guidance text, practice partner scenario scripts, assessment criteria. Each module 3-5 lessons. **Status: VERIFIED** — 35 lessons seeded (3-4 per module), Axel + Sophia personas, unique constraint added

### Testgate Wave 1:
- [x] 10 modules seeded with metadata — learnModules array in seed.ts, orders 1-10, titles/descriptions/badges
- [x] Module progression tracked per user — UserModuleProgress model + module tRPC router completeLesson auto-awards badge and unlocks next module
- [x] Lesson completion recorded — UserLessonProgress model + startLesson/completeLesson endpoints

**Testgate: PASS**

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
