# Roadmap: F16-LEARN-coach-vanilla

**Status:** DONE — all waves implemented and tested
**Created:** 2026-03-24
**Started:** 2026-03-25
**Completed:** 2026-03-25
**Waves:** 2
**Total epics:** 5

---

## Wave 1: Module Framework & Content
**Status:** DONE
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
**Status:** DONE
**Started:** 2026-03-25T01:00:00Z

### Parallelization groups:
**Group A (parallel):**
- wave-2a-learn-screens-mobile (haiku) — Module list with progress, lesson view, start coaching session button, badge display on completion **Status: VERIFIED** — useLearn hook, 3 shared screens, 3 mobile routes, Learn tab added to _layout.tsx
- wave-2b-learn-screens-web (haiku) — Same for web **Status: VERIFIED** — 3 web pages (list, module detail, lesson detail) with Axel/Sophia session launch buttons

### Testgate Wave 2:
- [x] Module list shows lock/unlock status — LearnModuleListScreen opacity=0.5 + 🔒 icon for locked modules, isUnlocked check before onModulePress
- [x] Lesson launches coaching session with correct module context — LearnLessonScreen calls startLesson() then onStartSession(persona, lesson.title), web routes link to /coach/start?persona=X&context=Y
- [x] Badge awarded on module completion — completeLesson checks all lessons passed → upserts UserModuleProgress with badgeAwardedAt, displayed in detail screens

**Testgate: PASS**
