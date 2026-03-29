# Epic: wave-3b-feed-ui-web

**Model:** sonnet
**Wave:** 3
**Group:** A (parallel with 3a)

## Description

Web feed redesign matching mobile design — post cards with carousel, reactions, "Säg hej", spicy toggle. Uses CSS Modules and web-specific patterns (IntersectionObserver, arrow-key carousel navigation).

## Acceptance Criteria

1. **Post card** (CSS Modules, max-width 600px centered):
   - Avatar + name + time (link to `/profile/[userId]`)
   - Media carousel with left/right arrow buttons (keyboard: ← → when focused) + dot indicators
   - Caption, reactions (🔥 😍 🤝 as buttons), "Säg hej" button, "Se hela profilen →" link
   - VIBE countdown, PROMPT_RESPONSE prompt header
2. **Spicy toggle** in feed header bar:
   - Button that opens a dropdown/popover with 4 checkboxes
   - Visual feedback on active levels (colored dot or badge)
   - Changes apply instantly (client-side JS filter, background tRPC sync)
3. **Post creation** inline on web:
   - Expandable composer at top of feed (click to expand)
   - File input for image/video upload
   - Type picker (Moment/Vibe/Prompt), spicy level picker
   - Prompt response: dropdown to select from available prompts
4. **IntersectionObserver** infinite scroll (existing pattern from F33)
5. Feed renders in main content zone of 3-column layout (existing AppShell)
6. Follows F33 conventions: CSS Modules, explicit imports, CSS custom properties from `tokens.css`

## File Paths

- `apps/web/components/feed/PostCard.tsx` (rewrite)
- `apps/web/components/feed/PostCard.module.css` (rewrite)
- `apps/web/components/feed/MediaCarousel.tsx` (new)
- `apps/web/components/feed/MediaCarousel.module.css` (new)
- `apps/web/components/feed/ReactionBar.tsx` (new)
- `apps/web/components/feed/SpicyToggle.tsx` (new)
- `apps/web/components/feed/PostComposer.tsx` (rewrite)
- `apps/web/app/(app)/home/page.tsx` (update)
