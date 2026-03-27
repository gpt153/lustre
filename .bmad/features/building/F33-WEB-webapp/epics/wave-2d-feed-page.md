# Epic: Wave 2d — Feed Page

**Epic ID:** F33-W2d
**Wave:** 2 — Core Pages
**Size:** haiku
**Depends On:** Wave 1 (all)
**Status:** NOT STARTED

---

## Goal

Build the social feed page with infinite scroll, post cards, like/comment interactions, and ad injection. Optimized for the 720px max-width reading zone.

## Acceptance Criteria

1. Feed displayed as vertical list of post cards within `max-width: 720px` centered column; each post card uses Card component styling (warm shadow, 16px border-radius)
2. Post card layout: author header (avatar 40px + name + timestamp), content area (text + optional images), action bar (like, comment, share icons); author name links to profile
3. Post images displayed via Next.js `<Image>` at max 720px width, 16:9 or original aspect ratio, `border-radius: var(--radius-md)`, `loading="lazy"`; click opens image in lightbox modal
4. Like interaction: click toggles copper-filled heart icon with scale animation (1.0 -> 1.3 -> 1.0 over 300ms using `--spring` easing), like count updates optimistically
5. Comment section: expands below post on click, shows last 3 comments initially with "View all X comments" link; comment input uses auto-growing textarea with send button
6. Infinite scroll: loads next 15 posts when within 300px of bottom via `IntersectionObserver`; shows skeleton post cards during load
7. Ad injection: every 5th post position shows a clearly-labeled sponsored card ("Sponsrad" label in text-muted) with same Card styling but subtle `var(--border-medium)` border
8. New post composer at top of feed: textarea with photo upload button, character count, copper submit button; collapses to single line when not focused

## File Paths

- `apps/web/app/(app)/feed/page.tsx`
- `apps/web/components/feed/FeedList.tsx`
- `apps/web/components/feed/FeedList.module.css`
- `apps/web/components/feed/PostCard.tsx`
- `apps/web/components/feed/PostCard.module.css`
- `apps/web/components/feed/PostComposer.tsx`
- `apps/web/components/feed/CommentSection.tsx`

## Technical Notes

### Post Card CSS
```css
.postCard {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  padding: var(--space-5);
  margin-bottom: var(--space-4);
}
.authorHeader {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  object-fit: cover;
}
.authorName {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
}
.authorName:hover {
  color: var(--color-copper);
}
.timestamp {
  font-size: 13px;
  color: var(--text-muted);
}
.contentText {
  font-size: 15px;
  line-height: 24px;
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
  white-space: pre-wrap;
}
.postImage {
  width: 100%;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: opacity 200ms ease;
}
.postImage:hover {
  opacity: 0.95;
}
```

### Action Bar CSS
```css
.actionBar {
  display: flex;
  gap: var(--space-6);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-subtle);
  margin-top: var(--space-4);
}
.actionButton {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  background: none;
  border: none;
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  transition: color 200ms ease, background 200ms ease;
}
.actionButton:hover {
  color: var(--text-primary);
  background: rgba(184, 115, 51, 0.06);
}
.actionButtonLiked {
  color: var(--color-copper);
}
```

### Like Heart Animation
```css
@keyframes heartPop {
  0% { transform: scale(1); }
  30% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
.heartAnimating {
  animation: heartPop 300ms var(--spring);
  color: var(--color-copper);
}
```

### Sponsored Card
```css
.sponsoredCard {
  composes: postCard;
  border: 1px solid var(--border-medium);
}
.sponsoredLabel {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}
```

### RSC Strategy
- `page.tsx` — Server Component: fetches initial feed posts
- `FeedList.tsx` — Client Component: infinite scroll, post interactions
- `PostCard.tsx` — Client Component: like/comment actions
- `PostComposer.tsx` — Client Component: form state, photo upload

## Definition of Done
- Feed displays posts in centered 720px column
- Posts show author, content, images, action bar
- Like toggles with heart animation
- Comments expand below post
- Infinite scroll loads more posts with skeleton placeholders
- Sponsored posts injected every 5th position
- Post composer allows text + photo posts
- Image lightbox opens on post image click
- All works at responsive breakpoints
