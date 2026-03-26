# Epic: wave-1b-spicy-content

**Wave:** 1 — Group A (runs after wave-1a is verified)
**Model:** sonnet
**Estimate:** large (rich system prompt content)

## Goal
Seed 8 spicy coaching modules (S1-S8) with full lesson content for S1-S3 (MVP) and stub content for S4-S8. Each lesson embeds consent moments in Sophia's partner scenarios. Coach (Axel) interrupts if user pushes past hesitation.

## Context
- Seed file: `services/api/prisma/seed.ts`
- Pattern: modules seeded via `prisma.learnModule.upsert()` keyed on `{ order }`, lessons via `prisma.lesson.upsert()` keyed on `{ moduleId_order: { moduleId, order } }`
- Spicy modules: `isSpicy: true`, `isUnlocked: false`, orders 101-108
- All 8 modules need `badgeName`, `title`, `description`
- Lessons: 3 per module for S1-S3 (MVP, full content), 2 per module for S4-S8 (stubs with clear TODO-free placeholder text)
- Coach persona is Axel: warm, direct, older-brother coach; uses 'bror' occasionally
- Partner persona is Sophia: Swedish woman, dry humour, warmth is earned; NEVER breaks character
- Consent moments: Sophia sometimes hesitates mid-scenario ("vänta lite..." or "hmm, jag vet inte..."), requiring user to check in. Axel evaluates if user caught the cue.
- Safeword drill (S6 BDSM Intro): user must say a safeword phrase and Sophia immediately stops + requests aftercare

## Module Definitions

| Order | isSpicy | Title | Badge | Description |
|-------|---------|-------|-------|-------------|
| 101 | true | Consent as Flirt | Consent Artist | Making consent-seeking feel natural, sexy, and confident — not clinical |
| 102 | true | Dirty Talk: Foundations | Voice Awakened | Finding your authentic erotic voice with confidence and clarity |
| 103 | true | Dirty Talk: Advanced | Word Weaver | Reading your partner's response and escalating vocabulary with precision |
| 104 | true | Dominance with Respect | Respectful Dom | Leading with masculine presence while keeping psychological safety central |
| 105 | true | Physical Intimacy | Touch Master | Communicating through touch — pace, pressure, presence |
| 106 | true | BDSM Intro | Safe Explorer | Negotiation, safewords, aftercare — the full safety framework for exploration |
| 107 | true | Fantasy Communication | Dream Speaker | Sharing and receiving fantasies without judgment or pressure |
| 108 | true | Giving Pleasure | Generous Lover | Presence, feedback loops, and ego-free focus on your partner's experience |

## Acceptance Criteria

1. All 8 modules seeded with correct fields: `isSpicy: true`, `isUnlocked: false`, `order: 101-108`, `badgeName`, `title`, `description`
2. Modules S1-S3 (orders 101-103) each have exactly 3 lessons with full `coachSystemPrompt`, `partnerSystemPrompt`, `assessmentCriteria` — no placeholder text or TODO comments
3. Modules S4-S8 (orders 104-108) each have exactly 2 lessons with coherent stub content (real sentences, clearly describes the scenario, assessment criteria present)
4. Every partnerSystemPrompt for S1-S3 contains at least one hesitation moment where Sophia uses phrases like "vänta lite", "hmm, jag vet inte", or "är du säker?" — requiring the user to pause and check in
5. Every coachSystemPrompt for S1-S3 includes explicit instruction for Axel to evaluate whether the user caught and responded to consent cues
6. S6 (order 106) lesson on safewords contains explicit safeword drill: Sophia must stop all roleplay immediately when user says "röd" (red), and the assessment requires user to also initiate aftercare questions
7. Seed upserts are idempotent (keyed correctly on `order` for modules, `{ moduleId_order }` for lessons)
8. No lesson content uses the word "explicit" in user-visible text — use descriptive, educational language throughout

## File Paths

- `services/api/prisma/seed.ts`
