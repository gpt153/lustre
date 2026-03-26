# Epic: wave-2b-education-web

**Wave:** 2 — Group A (parallel)
**Model:** haiku
**Status:** NOT_STARTED

## Goal

Build web education pages in Next.js: topic browser with category filters, article reader, podcast player, and quiz interface. Add "Sexuell hälsa" section to the Learn area of the web app.

## Codebase Context

- **Web app:** `apps/web/app/(app)/` — Next.js App Router. Each page exports default async component.
- **Web pattern:** `apps/web/app/(app)/learn/page.tsx` — uses tRPC hooks. Layout uses `apps/web/app/(app)/layout.tsx`
- **tRPC in web:** Use `trpc.<router>.<proc>.useQuery()` in client components. Server components use direct prisma or server tRPC caller.
- **Tamagui on web:** Tamagui components work on web too — use same YStack/XStack/Text/ScrollView
- **Wave 1 dependency:** education tRPC router from wave 1 must be complete

## File Paths

1. `apps/web/app/(app)/learn/sexual-health/page.tsx` — topic browser
2. `apps/web/app/(app)/learn/sexual-health/[topicSlug]/page.tsx` — topic detail (articles list + podcast)
3. `apps/web/app/(app)/learn/sexual-health/article/[articleId]/page.tsx` — article reader
4. `apps/web/app/(app)/learn/sexual-health/quiz/[quizId]/page.tsx` — quiz page
5. `apps/web/app/(app)/learn/page.tsx` — add "Sexuell hälsa" card/link

## Page Descriptions

### `/learn/sexual-health` — EducationTopicList
- Client component (`'use client'`)
- Calls `trpc.education.listTopics.useQuery({})`
- Category filter buttons at top (ALL + each category in Swedish)
- Topic cards in a grid (2-3 cols): title, category badge, description
- Click navigates to `/learn/sexual-health/<topicSlug>`

### `/learn/sexual-health/[topicSlug]` — TopicDetail
- Client component
- Shows topic title + description
- Tabs: "Artiklar" and "Podcast"
- Articles tab: list of articles for this topic (title, reading time, link to article reader)
- Podcast tab: if podcast exists, show title + description + play button; if not, show "Snart tillgänglig"

### `/learn/sexual-health/article/[articleId]` — ArticleReader
- Client component
- Calls `trpc.education.getArticle.useQuery({ articleId })`
- Shows title, reading time badge, full content as preformatted text (white-space: pre-wrap)
- Disclaimer at bottom in a gray callout box
- Calls `trpc.education.markArticleRead.useMutation()` in useEffect on load

### `/learn/sexual-health/quiz/[quizId]` — QuizPage
- Client component
- Fetches quiz with `trpc.education.getQuiz.useQuery({ quizId })`
- Question index state (currentIndex), answers state array
- Shows progress bar (currentIndex / total)
- Each question: text + 4 answer buttons
- On answer: show correct/incorrect feedback + explanation
- After all questions: show results screen with score and "Tillbaka" button
- Submit on last question via `trpc.education.submitQuiz.useMutation()`

### `/learn/page.tsx` update
- Add a "Sexuell hälsa 🔬" card/button in the existing learn page
- Link to `/learn/sexual-health`

## Acceptance Criteria

1. `/learn/sexual-health` shows topics with category filter buttons and grid layout
2. Category filter correctly filters displayed topics
3. `/learn/sexual-health/[topicSlug]` shows articles list and podcast section with tabs
4. `/learn/sexual-health/article/[articleId]` renders full article with disclaimer
5. Article page calls markArticleRead mutation on mount
6. `/learn/sexual-health/quiz/[quizId]` shows questions one at a time with answer feedback
7. Quiz submits answers and shows final score screen
8. `/learn/page.tsx` has a "Sexuell hälsa" card linking to the sexual health section
9. All pages are client components with proper loading states (Spinner while fetching)
10. Navigation is consistent — back buttons or breadcrumbs on detail pages
