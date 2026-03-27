# Epic: Wave 1b — Three-Zone Layout

**Epic ID:** F33-W1b
**Wave:** 1 — Design Foundation
**Size:** haiku
**Depends On:** W1a (CSS tokens)
**Status:** VERIFIED

---

## Goal

Build the three-zone layout system: glassmorphism Header, Nav Rail, Main Content area, and Context Panel. This is the shell that all pages render within.

## Acceptance Criteria

1. Header component (64px height) with glassmorphism: `rgba(253, 248, 243, 0.72)` background, `backdrop-filter: blur(20px) saturate(180%)`, copper-tinted bottom border, sticky positioning
2. Nav Rail (72px width) with icon-only items using Phosphor Icons, copper active state (`var(--color-copper)` left border + icon tint), tooltip on hover showing label
3. Main Content area constrained to `max-width: 720px` with centered alignment, scrollable independently
4. Context Panel (320px width) on right side for previews/filters, independently scrollable, closeable via X button or Escape key
5. App shell uses CSS Grid: `grid-template-columns: 72px 1fr 320px` at full desktop
6. Dark theme header uses `rgba(26, 22, 20, 0.78)` with gold-tinted bottom border `rgba(212, 168, 67, 0.15)`
7. Page background has paper grain texture with `background-blend-mode: multiply` and breathing ambient copper gradient (`@keyframes breathe`, 8s cycle, opacity 0.04-0.08)
8. Header contains: Logo (left), primary nav links (center: Discover, Connect, Explore, Learn), notification bell + user avatar (right)

## File Paths

- `apps/web/components/layout/AppShell.tsx`
- `apps/web/components/layout/AppShell.module.css`
- `apps/web/components/layout/Header.tsx`
- `apps/web/components/layout/Header.module.css`
- `apps/web/components/layout/NavRail.tsx`
- `apps/web/components/layout/NavRail.module.css`
- `apps/web/components/layout/ContextPanel.tsx`

## Technical Notes

### AppShell Grid Layout
```css
.shell {
  display: grid;
  grid-template-rows: 64px 1fr;
  grid-template-columns: 72px 1fr 320px;
  grid-template-areas:
    "header header header"
    "rail   main   context";
  min-height: 100vh;
  background-color: var(--bg-primary);
  background-image: url('/textures/paper-grain.png');
  background-size: 200px;
  background-blend-mode: multiply;
}
.main {
  grid-area: main;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: var(--space-6);
  overflow-y: auto;
}
```

### Header Glassmorphism
```css
.header {
  grid-area: header;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  height: 64px;
  background: rgba(253, 248, 243, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(184, 115, 51, 0.12);
  box-shadow: 0 1px 3px rgba(184, 115, 51, 0.04);
}
```

### Nav Rail
```css
.rail {
  grid-area: rail;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4) 0;
  gap: var(--space-2);
  border-right: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
}
.railItem {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  position: relative;
  transition: color 200ms ease, background 200ms ease;
}
.railItem:hover {
  color: var(--text-primary);
  background: rgba(184, 115, 51, 0.08);
}
.railItemActive {
  color: var(--color-copper);
  border-left: 3px solid var(--color-copper);
}
```

### Context Panel
```css
.contextPanel {
  grid-area: context;
  width: 320px;
  border-left: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
  overflow-y: auto;
  padding: var(--space-4);
}
```

### RSC Boundaries
- `AppShell.tsx` — Server Component (layout only)
- `Header.tsx` — Client Component (notification bell, user menu interactions)
- `NavRail.tsx` — Client Component (active state, tooltips)
- `ContextPanel.tsx` — Client Component (dynamic content, close button)

## Definition of Done
- Three-zone layout renders with correct dimensions at 1440px+ viewport
- Header glassmorphism visible (content scrolls behind it with blur)
- Nav Rail items show tooltip on hover
- Context Panel is closeable and re-openable
- Paper grain texture visible on page background
- Breathing gradient animates subtly in background
- All zones scroll independently
