# PRD: Coach Vanilla — 10 Social Skills Modules

## Overview

Ten progressive coaching modules from "Overcome Fear" to "Masculine Leadership". Each module has structured lessons, AI coach guidance, AI practice partner scenarios, and completion criteria for badge earning. Content delivered via voice/text AI sessions.

## Target Audience

Men wanting to improve social and dating skills

## Functional Requirements (FR)

### FR-1: Module Progression
- Priority: Must
- Acceptance criteria:
  - Given the Learn tab, when viewing vanilla modules, then 10 modules are listed with lock/unlock status
  - Given module completion, when all exercises are done, then the next module unlocks and badge is awarded

### FR-2: Lesson Content
- Priority: Must
- Acceptance criteria:
  - Given a module, when opened, then it contains 3-5 lessons with AI coach explanation + practice scenarios
  - Given a practice scenario, then the AI practice partner responds realistically to the user's approach

### FR-3: Assessment
- Priority: Must
- Acceptance criteria:
  - Given lesson completion, when assessed, then the AI evaluates performance and provides feedback
  - Given consistent good performance, then the badge for that module is awarded

### FR-4: Adaptive Difficulty
- Priority: Should
- Acceptance criteria:
  - Given early modules, then AI practice partner is forgiving and encouraging
  - Given later modules, then scenarios become more challenging and realistic

## MVP Scope

FR-1 (modules 1-3 only), FR-2, FR-3 are MVP. Full 10 modules and FR-4 are Phase 2.

## Risks and Dependencies

- Depends on F15 (coach engine)
- Content design for each module requires careful writing of system prompts
- AI prompt engineering critical for realistic practice partner behavior
