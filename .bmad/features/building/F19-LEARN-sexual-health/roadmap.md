# Roadmap: F19-LEARN-sexual-health

**Status:** NOT_STARTED
**Created:** 2026-03-24
**Waves:** 2
**Total epics:** 5

---

## Wave 1: Content Backend
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-1a-education-schema (haiku) — Prisma: EducationTopic, EducationArticle, EducationQuiz, UserEducationProgress. Topic categories from PRD.
- wave-1b-article-generator (sonnet) — AI article generation pipeline: Claude generates articles per topic, stored in DB, tagged by audience/topic/language
- wave-1c-podcast-generator (sonnet) — ElevenLabs GenFM integration: generate dual-voice podcast episodes per topic, store audio in R2

### Testgate Wave 1:
- [ ] 20+ articles generated and stored
- [ ] Articles tagged by topic and audience
- [ ] Podcast audio generated (1 test episode)

---

## Wave 2: Education Screens
**Status:** NOT_STARTED

### Parallelization groups:
**Group A (parallel):**
- wave-2a-education-mobile (haiku) — Topic browser, article reader, podcast player, quiz interface
- wave-2b-education-web (haiku) — Same for web

### Testgate Wave 2:
- [ ] Article browser works with topic filters
- [ ] Podcast player plays audio
- [ ] Quiz submission records answers
