# Epic: Wave 2c — Profile View & Edit

**Epic ID:** F33-W2c
**Wave:** 2 — Core Pages
**Size:** haiku
**Depends On:** Wave 1 (all)
**Status:** VERIFIED

---

## Goal

Build the profile view (scroll-based, replacing mobile's story-tap format) and profile edit (with drag-and-drop photo reordering). Both optimized for desktop with keyboard and mouse interactions.

## Acceptance Criteria

1. Profile view: vertical scroll layout with sticky header (name, age, distance) that appears when scrolling past the hero photo; photos displayed as a vertical gallery (max-width 600px, centered), prompts displayed as cards between photos
2. Hero photo area: first photo displayed at 600x800 (3:4 ratio), with Next.js `<Image>`, blurhash placeholder, `priority` loading; subsequent photos same dimensions, `loading="lazy"`
3. Action bar below hero: Like (copper heart), Pass (X), Super Like (star) buttons with hover glow (copper radial gradient behind button on hover), and keyboard shortcuts (L, P, S)
4. Profile prompts displayed as warm Card components with prompt question (text-muted, 13px) and answer (text-body, 15px); max 720px width for readability
5. Profile edit page: photo grid (3x2) with drag-and-drop reordering via `@dnd-kit/core` + `@dnd-kit/sortable`; drag shows grabbed photo with slight rotation (3deg) and elevated shadow (`var(--shadow-xl)`)
6. Profile edit: text fields for bio, prompts (textarea with character count), and preference toggles; all using Input component from W1c; auto-save with debounce (1s) and "Saved" confirmation toast
7. "Öppna i appen" badge shown on profile for content only available in app (e.g., ConsentVault verified badge tooltip)
8. Profile view in context panel (from discover): narrower version (320px width), photos stack vertically, scroll within panel, Like/Pass buttons fixed at bottom of panel

## File Paths

- `apps/web/app/(app)/profile/[id]/page.tsx`
- `apps/web/app/(app)/profile/edit/page.tsx`
- `apps/web/components/profile/ProfileView.tsx`
- `apps/web/components/profile/ProfileView.module.css`
- `apps/web/components/profile/ProfileEdit.tsx`
- `apps/web/components/profile/PhotoGrid.tsx`
- `apps/web/components/profile/PhotoGrid.module.css`
- `apps/web/components/profile/PromptCard.tsx`

## Technical Notes

### Profile View CSS
```css
.profileView {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: var(--space-16);
}
.heroPhoto {
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}
.stickyHeader {
  position: sticky;
  top: 64px; /* Below app header */
  z-index: 50;
  background: var(--bg-primary);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border-subtle);
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 200ms ease, transform 200ms ease;
}
.stickyHeaderVisible {
  opacity: 1;
  transform: translateY(0);
}
.nameAge {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
```

### Action Bar CSS
```css
.actionBar {
  display: flex;
  justify-content: center;
  gap: var(--space-6);
  padding: var(--space-6) 0;
}
.actionButton {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  border: 2px solid var(--border-medium);
  background: var(--bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: transform 200ms var(--spring), border-color 200ms ease;
}
.actionButton:hover {
  transform: scale(1.1);
  border-color: var(--color-copper);
}
.actionButton::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(184, 115, 51, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 200ms ease;
}
.actionButton:hover::before {
  opacity: 1;
}
.actionButton:active {
  transform: scale(0.95);
}
.likeButton { color: var(--color-copper); }
.passButton { color: var(--text-muted); }
.superButton { color: var(--color-gold); }
```

### Drag-and-Drop Photo Grid CSS
```css
.photoGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  max-width: 480px;
}
.photoSlot {
  aspect-ratio: 3 / 4;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px dashed var(--border-medium);
  position: relative;
  cursor: grab;
  transition: box-shadow 200ms var(--spring);
}
.photoSlot:hover {
  box-shadow: var(--shadow-md);
}
.photoSlotDragging {
  cursor: grabbing;
  transform: rotate(3deg);
  box-shadow: var(--shadow-xl);
  z-index: 10;
  opacity: 0.9;
}
.photoSlotEmpty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(184, 115, 51, 0.04);
  cursor: pointer;
}
.addPhotoIcon {
  color: var(--color-copper);
  opacity: 0.5;
}
```

### Context Panel Profile View
```css
.profileViewPanel {
  width: 320px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  padding: var(--space-4);
}
.profileViewPanel .heroPhoto {
  border-radius: var(--radius-md);
}
.panelActions {
  position: sticky;
  bottom: 0;
  background: var(--bg-elevated);
  padding: var(--space-3);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  justify-content: center;
  gap: var(--space-4);
}
```

### RSC Strategy
- `profile/[id]/page.tsx` — Server Component: fetches profile data
- `profile/edit/page.tsx` — Server Component: fetches current user profile
- `ProfileView.tsx` — Client Component: scroll tracking for sticky header, action buttons
- `ProfileEdit.tsx` — Client Component: form state, auto-save
- `PhotoGrid.tsx` — Client Component: drag-and-drop via @dnd-kit

### Sticky Header Visibility (IntersectionObserver)
```typescript
const heroRef = useRef<HTMLDivElement>(null);
const [showStickyHeader, setShowStickyHeader] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => setShowStickyHeader(!entry.isIntersecting),
    { threshold: 0, rootMargin: '-64px 0px 0px 0px' }
  );
  if (heroRef.current) observer.observe(heroRef.current);
  return () => observer.disconnect();
}, []);
```

## Definition of Done
- Profile view scrolls vertically with photos and prompt cards
- Sticky header appears when hero photo scrolls out of view
- Like/Pass/SuperLike buttons work with hover glow
- Profile edit shows 3x2 photo grid with drag-and-drop
- Dragged photo shows rotation and elevated shadow
- Text fields auto-save with debounce and toast confirmation
- Profile renders in context panel (320px) for discover integration
- All works at responsive breakpoints
