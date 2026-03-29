# Epic: wave-3a-feed-ui-mobile

**Model:** sonnet
**Wave:** 3
**Group:** A (parallel)

## Description

Redesign the mobile feed with post cards featuring media carousel, reaction buttons, "Säg hej", spicy-level quick-toggle in header, and post creation flow with type and spicy level selection. Uses Stitch design system (F31/F32).

## Acceptance Criteria

1. **Post card** layout:
   - Avatar + display name + time ago (tap → profile)
   - Media carousel: horizontal ScrollView/FlatList, dot indicators, max 4 items per post
   - Caption text (if any)
   - Reaction row: 🔥 😍 🤝 buttons with selected state (copper highlight)
   - "Säg hej 💬" button → navigates to chat
   - "Se hela profilen →" text link
   - VIBE posts: countdown timer showing time remaining (e.g. "23h kvar")
   - PROMPT_RESPONSE posts: prompt question displayed above the answer
2. **Spicy toggle** in feed header:
   - Quick-access button (always visible)
   - Tap opens bottom sheet with 4 toggles (Vanilla/Sultry/Steamy/Explicit)
   - Icon color changes: single color reflecting highest active level
   - Toggle changes apply instantly (client-side filter, background sync)
3. **Post creation flow**:
   - FAB (floating action button) or camera icon in header
   - Step 1: Camera/gallery picker (expo-image-picker)
   - Step 2: Type selector (Moment / Vibe / Prompt Response)
   - Step 3: Spicy level selector (4 options with visual examples)
   - Step 4: Caption input + post button
   - For PROMPT_RESPONSE: shows today's prompt, answer field
4. Feed uses FlatList with `onEndReached` for infinite scroll (existing pattern)
5. Pull-to-refresh maintained
6. Skeleton loading states from F32 (FeedSkeleton)
7. All components follow Stitch design: ghost borders, copper accents, Manrope/Noto Serif typography, no visible 1px borders

## File Paths

- `packages/app/src/screens/FeedScreen.tsx` (rewrite)
- `packages/app/src/components/PostCard.tsx` (rewrite)
- `packages/app/src/components/PostMediaCarousel.tsx` (new)
- `packages/app/src/components/ReactionBar.tsx` (new)
- `packages/app/src/components/SpicyToggleSheet.tsx` (new)
- `packages/app/src/screens/CreatePostScreen.tsx` (rewrite)
- `packages/app/src/hooks/useFeed.ts` (update)
- `apps/mobile/app/(tabs)/index.tsx` (update)
