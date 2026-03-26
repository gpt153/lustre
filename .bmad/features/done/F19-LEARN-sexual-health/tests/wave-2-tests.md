# Tests: Wave 2 — Education Screens

## Testgate Checks

### T2-1: Mobile screens
- [ ] `packages/app/src/hooks/useEducation.ts` exists
- [ ] `packages/app/src/screens/EducationTopicListScreen.tsx` exists
- [ ] `packages/app/src/screens/EducationArticleScreen.tsx` exists
- [ ] `packages/app/src/screens/EducationPodcastScreen.tsx` exists
- [ ] `packages/app/src/screens/EducationQuizScreen.tsx` exists
- [ ] All screens exported from `packages/app/src/index.ts`

### T2-2: Mobile navigation
- [ ] `apps/mobile/app/(tabs)/learn/sexual-health.tsx` exists
- [ ] `apps/mobile/app/(tabs)/learn/article/[articleId].tsx` exists

### T2-3: Web pages
- [ ] `apps/web/app/(app)/learn/sexual-health/page.tsx` exists
- [ ] `apps/web/app/(app)/learn/sexual-health/[topicSlug]/page.tsx` exists
- [ ] `apps/web/app/(app)/learn/sexual-health/article/[articleId]/page.tsx` exists
- [ ] `apps/web/app/(app)/learn/sexual-health/quiz/[quizId]/page.tsx` exists

### T2-4: Learn page updated
- [ ] `apps/web/app/(app)/learn/page.tsx` contains link to `/learn/sexual-health`

## Functional Test Checklist (manual review)

### T2-5: Article browser works with topic filters
- EducationTopicListScreen: Renders topic list, category tabs visible
- Web /learn/sexual-health: Category filter buttons present, grid renders

### T2-6: Podcast player plays audio
- EducationPodcastScreen: play button present, uses expo-av Audio.Sound
- Web podcast section: play button present with onClick handler

### T2-7: Quiz submission records answers
- EducationQuizScreen: question progression state, submitQuiz mutation called on completion
- Web quiz page: same flow, submitQuiz called, score displayed

### T2-8: No TypeScript errors
- No TODO or FIXME in any new files
- No `any` types used unnecessarily
- Imports use correct paths (`.js` extension for ESM, matching other files in the same package)
