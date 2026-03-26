# Epic: wave-1a-gamification-schema
**Model:** haiku
**Wave:** 1
**Group:** A (sequential, runs first)

## Goal
Add Badge, Medal, UserBadge, UserMedal, UserStreak Prisma models. Create migration. Seed 18 badges (one per module) and 15 medals.

## Codebase Context

### Prisma schema location
`services/api/prisma/schema.prisma`

### Existing User model relations (add these):
The User model already has many relations. Add these four:
```
userBadges   UserBadge[]
userMedals   UserMedal[]
userStreak   UserStreak?
```

### Existing migration pattern
Latest migration: `services/api/prisma/migrations/20260325110000_add_spicy_mode/`
New migration should be: `services/api/prisma/migrations/20260326000000_add_gamification/migration.sql`

### Seed file
`services/api/prisma/seed.ts` — append gamification seed at the bottom, before the closing `}` of `main()`.

### 18 badges (moduleOrder → name):
Vanilla:
- 1 → Fear Conqueror — icon: "🏆" — description: "Conquered social fear and approach anxiety"
- 2 → Ice Breaker — icon: "❄️" — description: "Mastered the art of opening any conversation"
- 3 → Smooth Talker — icon: "💬" — description: "Keeps any conversation alive and engaging"
- 4 → Signal Reader — icon: "📡" — description: "Accurately decodes attraction cues and body language"
- 5 → Presence Master — icon: "⚡" — description: "Projects unshakeable confidence and grounded presence"
- 6 → Connection Maker — icon: "🤝" — description: "Creates genuine emotional rapport and deep connection"
- 7 → Playful Pro — icon: "🎭" — description: "Masters playful banter and creates chemistry"
- 8 → Smooth Mover — icon: "🌊" — description: "Navigates physical escalation naturally within consent"
- 9 → Resilient Man — icon: "💪" — description: "Turns rejection into resilience and growth"
- 10 → Leader of Men — icon: "👑" — description: "Commands decisive masculine leadership"

Spicy (isSpicy: true):
- 101 → Consent Artist — icon: "🎨" — description: "Makes consent feel natural and attractive"
- 102 → Voice Awakened — icon: "🔥" — description: "Awakened the power of vocal expression"
- 103 → Word Weaver — icon: "✨" — description: "Masters the art of advanced dirty talk"
- 104 → Respectful Dom — icon: "⚖️" — description: "Leads with power while honoring boundaries"
- 105 → Touch Master — icon: "🫶" — description: "Navigates physical intimacy with confidence"
- 106 → Safe Explorer — icon: "🔒" — description: "Explores BDSM safely with full consent"
- 107 → Dream Speaker — icon: "💭" — description: "Communicates fantasies with confidence"
- 108 → Generous Lover — icon: "💝" — description: "Masters the art of giving pleasure"

### 15 medals (key → name):
- brave_first_step → Brave First Step — icon: "👣" — description: "Completed your first lesson" — criteria: "Complete 1 lesson total"
- triple_flame → Triple Flame — icon: "🔥" — description: "3 days in a row" — criteria: "Achieve a 3-day streak"
- week_warrior → Week Warrior — icon: "⚔️" — description: "7 days without stopping" — criteria: "Achieve a 7-day streak"
- monthly_master → Monthly Master — icon: "📅" — description: "30 days of dedication" — criteria: "Achieve a 30-day streak"
- century_club → Century Club — icon: "💯" — description: "100 days of mastery" — criteria: "Achieve a 100-day streak"
- fast_learner → Fast Learner — icon: "⚡" — description: "Completed a module in 24 hours" — criteria: "Complete all lessons in a module within 24 hours"
- perfectionist → Perfectionist — icon: "🎯" — description: "Passed all lessons on first attempt" — criteria: "Pass all lessons first-attempt in any module"
- lesson_hunter → Lesson Hunter — icon: "🎖️" — description: "Completed 10 lessons" — criteria: "Complete 10 lessons total"
- lesson_master → Lesson Master — icon: "🏅" — description: "Completed 25 lessons" — criteria: "Complete 25 lessons total"
- dawn_trainer → Dawn Trainer — icon: "🌅" — description: "Trains at dawn" — criteria: "Complete 5 sessions before 8am"
- night_owl → Night Owl — icon: "🦉" — description: "Trains after dark" — criteria: "Complete 5 sessions after 10pm"
- weekend_warrior → Weekend Warrior — icon: "🏋️" — description: "Never misses a weekend" — criteria: "Practice on 5 different weekends"
- comeback_kid → Comeback Kid — icon: "🔄" — description: "Returned after a break" — criteria: "Return after 7+ days and complete a lesson"
- deep_dive → Deep Dive — icon: "🤿" — description: "Intensive single-day training" — criteria: "Complete 3+ lessons in a single day"
- graduation_day → Graduation Day — icon: "🎓" — description: "Completed the full vanilla programme" — criteria: "Complete all 10 vanilla modules"

## Acceptance Criteria
1. `services/api/prisma/schema.prisma` has Badge, Medal, UserBadge, UserMedal, UserStreak models following existing naming conventions (`@map`, `@@map`, `@db.Uuid`)
2. User model has `userBadges UserBadge[]`, `userMedals UserMedal[]`, `userStreak UserStreak?` relations added
3. `services/api/prisma/migrations/20260326000000_add_gamification/migration.sql` exists with correct SQL
4. `services/api/prisma/seed.ts` seeds all 18 badges using upsert (by `moduleOrder`)
5. `services/api/prisma/seed.ts` seeds all 15 medals using upsert (by `key`)
6. Badge model has: id, moduleOrder (unique), name, icon, description, isSpicy, createdAt, userBadges relation
7. Medal model has: id, key (unique), name, icon, description, criteria, createdAt, userMedals relation
8. UserStreak model has: id, userId (unique), currentStreak, longestStreak, lastActivityAt, updatedAt
9. No TODO/FIXME comments in any changed file
10. Seed uses upsert pattern consistent with existing kinkTags/learnModules seeding

## Files to Create/Edit
- `services/api/prisma/schema.prisma` (EDIT — add 5 models + User relations)
- `services/api/prisma/migrations/20260326000000_add_gamification/migration.sql` (CREATE)
- `services/api/prisma/seed.ts` (EDIT — append badge/medal seeds)
