# Epic: wave-3c-profile-gallery

**Model:** haiku
**Wave:** 3
**Group:** A (parallel with 3a, 3b)

## Description

Add a gallery tab to user profiles showing all their Moments and Shorts in a grid layout. Content above the viewer's spicy level is blurred. Vibes excluded (ephemeral).

## Acceptance Criteria

1. Profile page: new "Galleri" tab alongside existing profile info
2. Gallery displays Moments (and later Shorts) in a 3-column grid, newest first
3. Each grid item shows: thumbnail, spicy level badge (if Sultry+), video duration badge (if video)
4. Tap on grid item opens post detail (full post card with carousel, reactions, etc.)
5. Content above viewer's active spicy levels: thumbnail blurred with level badge overlay ("🌶️ Steamy" or "🔥 Explicit") — tap shows "Aktivera [level] för att se"
6. Vibes (postType=VIBE) excluded from gallery — they are feed-only
7. Prompt responses shown in gallery with prompt text as overlay on thumbnail
8. tRPC `post.listByUser` query: returns user's posts (excluding vibes), paginated, with viewer's spicy filter applied for blur metadata
9. Mobile: gallery grid in profile tab using FlashList/FlatList with numColumns=3
10. Web: CSS Grid 3-column layout on profile page

## File Paths

- `packages/app/src/components/ProfileGallery.tsx` (new)
- `packages/app/src/screens/ProfileViewScreen.tsx` (update — add gallery tab)
- `services/api/src/trpc/post-router.ts` (add listByUser query)
- `apps/web/components/profile/ProfileGallery.tsx` (new)
- `apps/web/components/profile/ProfileGallery.module.css` (new)
- `apps/web/app/(app)/profile/[userId]/page.tsx` (update)
