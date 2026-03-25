# Epic: wave-3a-feed-screen-mobile

**Model:** haiku
**Wave:** 3
**Group:** A (parallel with 3b)

## Description

Build the mobile feed screen with infinite scroll, post cards, image gallery, like/show-less interactions, and post creation flow. Uses shared components in packages/app.

## Acceptance Criteria

1. `FeedScreen` component in `packages/app/src/screens/FeedScreen.tsx` — uses `trpc.post.feed.useInfiniteQuery` with cursor pagination
2. `PostCard` component in `packages/app/src/components/PostCard.tsx` — shows author avatar+name, text, image gallery (swipeable), like button, "show less" menu option, timestamp
3. `PostImageGallery` component in `packages/app/src/components/PostImageGallery.tsx` — horizontal swipeable image carousel with dots indicator
4. `CreatePostScreen` component in `packages/app/src/screens/CreatePostScreen.tsx` — text input, image picker (up to 4), submit button, uploads images then creates post
5. Mobile tab updated: `apps/mobile/app/(tabs)/index.tsx` renders FeedScreen (replacing current home)
6. `useFeed` hook in `packages/app/src/hooks/useFeed.ts` — wraps useInfiniteQuery, exposes posts, fetchMore, refresh, like/unlike/showLess mutations
7. Feed pull-to-refresh support
8. Exports added to `packages/app/src/index.ts`

## File Paths

- `packages/app/src/screens/FeedScreen.tsx` (new)
- `packages/app/src/screens/CreatePostScreen.tsx` (new)
- `packages/app/src/components/PostCard.tsx` (new)
- `packages/app/src/components/PostImageGallery.tsx` (new)
- `packages/app/src/hooks/useFeed.ts` (new)
- `packages/app/src/index.ts` (add exports)
- `apps/mobile/app/(tabs)/index.tsx` (update to show feed)
