# Epic: wave-2a-education-mobile

**Wave:** 2 — Group A (parallel)
**Model:** haiku
**Status:** NOT_STARTED

## Goal

Build mobile education screens: topic browser, article reader, podcast player, and quiz interface. Extend the existing Learn tab to include a "Sexuell hälsa" (Sexual Health) section.

## Codebase Context

- **Screen pattern:** `packages/app/src/screens/LearnModuleListScreen.tsx` — Tamagui components (YStack, XStack, ScrollView, Text), hooks for data, callbacks as props for navigation
- **Hook pattern:** `packages/app/src/hooks/useLearn.ts` — uses `trpc.<router>.<procedure>.useQuery()`
- **Barrel export:** `packages/app/src/index.ts` — export all new screens and hooks
- **Mobile tabs:** `apps/mobile/app/(tabs)/learn/` — existing Learn tab. Add "Sexuell hälsa" section or new sub-tab
- **tRPC client:** available via `import { trpc } from '../lib/trpc'` in packages/app (pattern from other screens)
- **Wave 1 dependency:** education tRPC router and schema must be built from wave 1 first

## File Paths

1. `packages/app/src/hooks/useEducation.ts` — hook for education data
2. `packages/app/src/screens/EducationTopicListScreen.tsx` — topic browser
3. `packages/app/src/screens/EducationArticleScreen.tsx` — article reader
4. `packages/app/src/screens/EducationPodcastScreen.tsx` — podcast player
5. `packages/app/src/screens/EducationQuizScreen.tsx` — quiz interface
6. `packages/app/src/index.ts` — export new screens + hook
7. `apps/mobile/app/(tabs)/learn/sexual-health.tsx` — topic list entry point
8. `apps/mobile/app/(tabs)/learn/article/[articleId].tsx` — article page

## useEducation Hook

```typescript
export function useEducation(topicSlug?: string) {
  const topicsQuery = trpc.education.listTopics.useQuery({})
  const articlesQuery = trpc.education.listArticles.useQuery(
    { topicSlug },
    { enabled: !!topicSlug }
  )
  const markReadMutation = trpc.education.markArticleRead.useMutation()

  return {
    topics: topicsQuery.data ?? [],
    articles: articlesQuery.data ?? [],
    isLoading: topicsQuery.isLoading || articlesQuery.isLoading,
    markRead: markReadMutation.mutate,
  }
}
```

## Screen Descriptions

### EducationTopicListScreen
- Props: `{ onTopicPress: (topicSlug: string) => void }`
- Shows category tabs (icons + labels in Swedish): Anatomi, Njutning, STI, Psykisk hälsa, Relationer, Kink, HBTQ+, Åldrande
- Each topic shown as a card with title, description snippet
- Swedish labels throughout

### EducationArticleScreen
- Props: `{ articleId: string, onBack: () => void }`
- Fetches article via `trpc.education.getArticle.useQuery({ articleId })`
- Renders markdown content using a simple Text component (no markdown parser needed — just display content)
- Shows reading time estimate ("5 min läsning")
- Shows disclaimer in a muted box at bottom
- Calls `markArticleRead` on first render (in useEffect)

### EducationPodcastScreen
- Props: `{ podcastId: string, onBack: () => void }`
- Fetches podcast via `trpc.education.listPodcasts.useQuery({ topicSlug: slug })`
- Shows podcast title, description
- Play button that uses expo-av `Audio.Sound` to stream audioUrl
- Shows duration in mm:ss format
- Play/pause toggle with simple progress display (no seek bar needed)

### EducationQuizScreen
- Props: `{ quizId: string, onComplete: (score: number) => void, onBack: () => void }`
- Fetches quiz via `trpc.education.getQuiz.useQuery({ quizId })`
- Shows one question at a time with 4 answer options as tappable cards
- On answer: show green/red feedback + explanation
- "Nästa fråga" button to advance
- On completion: show score (X/Y rätt) and call onComplete(score)
- Submit via `trpc.education.submitQuiz.useMutation()`

## Mobile Navigation

In `apps/mobile/app/(tabs)/learn/sexual-health.tsx`:
- Add a "Sexuell hälsa" entry in the learn tab or as a route from learn index
- Route to `EducationTopicListScreen`
- Article pages at `learn/article/[articleId]`

## Acceptance Criteria

1. `useEducation` hook returns topics and articles from tRPC education router
2. `EducationTopicListScreen` shows topics grouped by category with Swedish category names
3. `EducationArticleScreen` displays full article content, reading time, and disclaimer
4. `EducationArticleScreen` calls markArticleRead on mount
5. `EducationPodcastScreen` loads podcast data and has a functional play/pause button using expo-av
6. `EducationQuizScreen` shows questions one at a time with answer feedback
7. `EducationQuizScreen` submits answers and displays final score
8. All screens use Tamagui components (YStack, XStack, Text, ScrollView)
9. Mobile learn tab links to `sexual-health` route with EducationTopicListScreen
10. All new screens and hook exported from `packages/app/src/index.ts`
