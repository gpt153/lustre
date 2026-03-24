# Epic: wave-3b-feed-screen-web

**Model:** haiku
**Wave:** 3
**Group:** A (parallel with 3a)

## Description

Build the web feed page with responsive layout, reusing shared components from packages/app where possible. Add feed route to the web app.

## Acceptance Criteria

1. `apps/web/app/(app)/home/page.tsx` — renders the feed using shared FeedScreen or web-specific wrapper
2. `apps/web/app/(app)/home/create/page.tsx` — post creation page for web
3. Responsive layout: single column on mobile, centered max-width container on desktop
4. Uses the same `useFeed` hook and `PostCard` component from packages/app
5. Image gallery uses CSS grid or flexbox (not native swipeable) for web
6. `WebPostImageGallery` component if PostImageGallery needs web-specific implementation
7. Navigation: "Create Post" button/FAB visible on feed page

## File Paths

- `apps/web/app/(app)/home/page.tsx` (update)
- `apps/web/app/(app)/home/create/page.tsx` (new)
