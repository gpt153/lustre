# Epic: wave-5b-profile-view

**Model:** haiku
**Wave:** 5
**Group:** A (sequential — after 5a for prompt data)

## Description

Rebuild the profile view as a scrollable full-page layout (Hinge model). Photos are interspersed with prompt responses. Each photo and prompt section has an individual like button (heart icon). Liking a specific photo or prompt starts a conversation with that context attached. Works on both mobile (ScrollView) and web (scrollable page).

## Acceptance Criteria

1. Profile view renders as a vertical scrollable page, not a card or grid.
2. Content order: first photo (full width, borderRadius 16, gradient overlay with name/age), then alternating prompt responses and additional photos.
3. Each photo section: full-width image with borderRadius 16, gradient overlay on bottom, heart icon button in bottom-right corner.
4. Each prompt section: warmCream card (CardBase elevation 1), prompt question in warmGray ($heading font, 14px), response in charcoal ($body font, 16px), heart icon button in bottom-right corner.
5. Tapping a heart icon on a photo or prompt triggers a like action that includes context: `{ type: 'photo', photoId }` or `{ type: 'prompt', promptKey, response }`.
6. If the like creates a match, conversation is initiated with the liked content as first message context.
7. Profile view works on both mobile (React Native ScrollView) and web (native scroll with Solito shared component).
8. Bio field is not displayed in the new view (prompts replace it).

## File Paths

- `packages/app/src/screens/ProfileViewScreen.tsx`
- `packages/app/src/components/ProfilePhotoSection.tsx` (new)
- `packages/app/src/components/ProfilePromptSection.tsx` (new)
- `packages/app/src/components/LikeButton.tsx` (new)
