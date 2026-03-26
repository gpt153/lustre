# Epic: wave-2b-ad-display
**Model:** haiku
**Wave:** 2 / Group A (parallel)

## Goal
Build the native feed ad component for both mobile and web: renders sponsored content inline in feed, shows "Sponsored" label, handles click tracking.

## Files to create/modify
- `packages/app/src/components/FeedAdCard.tsx` (CREATE — shared ad card component)
- `packages/app/src/screens/FeedScreen.tsx` (MODIFY — handle type='ad' items)
- `apps/mobile/app/(tabs)/index.tsx` (MODIFY — ensure FeedScreen handles ad items)
- `apps/web/app/(app)/home/page.tsx` (MODIFY — handle ad items in feed)

## Acceptance criteria (max 10)
1. `FeedAdCard` component accepts props: `{campaignId: string, creativeId: string, headline: string, body: string | null, imageUrl: string | null, ctaUrl: string, sponsor: string | null, onImpression: () => void, onClick: () => void}`. Renders a card visually similar to PostCard but with a "Sponsrad" (Swedish for Sponsored) label in top-right corner.
2. `FeedAdCard` visual: gray "Sponsrad" tag in corner, sponsor name below tag (small text), headline in bold, body text if present, image if imageUrl set (full width, 16:9 aspect ratio), CTA button at bottom "Besök" that opens ctaUrl in browser (Linking.openURL on mobile, window.open on web).
3. `FeedAdCard` calls `onImpression()` once when the card becomes visible (on mount/render). Calls `onClick()` when CTA button pressed.
4. `onImpression` in parent: calls `api.ad.recordImpression.mutate({campaignId, creativeId})` (fire-and-forget, no error display).
5. `onClick` in parent: calls `api.ad.recordClick.mutate({campaignId, creativeId})` then opens URL.
6. `FeedScreen` updated: feed items now have `type: 'post' | 'ad'`. For `type === 'ad'` items, render `<FeedAdCard>` instead of `<PostCard>`. For `type === 'post'`, render existing `<PostCard>` as before.
7. Web `home/page.tsx` updated: same logic — check `item.type === 'ad'` and render `FeedAdCard`, else `PostCard`.
8. `FeedAdCard` is cross-platform (mobile + web) using Tamagui primitives (XStack, YStack, Text, Button, Image from tamagui or expo-image).
9. No style regressions on existing PostCard rendering — only the ad slot at position 5 uses the new component.
10. `FeedAdCard` gracefully handles null body (omit body text) and null imageUrl (omit image section).

## Context
- Feed items now come from `post.feed` with mixed types (post + ad)
- The `type` field was added to feed items in wave-1c-ad-delivery
- Import ad record mutations from the trpc client (same pattern as existing feed interactions)
- READ `packages/app/src/screens/FeedScreen.tsx` before modifying to understand existing structure
- READ `packages/app/src/components/PostCard.tsx` for visual/style patterns to match
- READ `apps/web/app/(app)/home/page.tsx` before modifying
- Tamagui imports: `import { XStack, YStack, Text, Button } from 'tamagui'`
- For images on mobile: `import { Image } from 'expo-image'`; on web: `<img>` or Tamagui Image
- Use `Linking` from `react-native` for mobile URL opening, `window.open` for web
