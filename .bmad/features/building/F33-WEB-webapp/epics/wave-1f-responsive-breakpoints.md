# Epic: Wave 1f — Responsive Breakpoints & Mobile Browser Fallback

**Epic ID:** F33-W1f
**Wave:** 1 — Design Foundation
**Size:** haiku
**Depends On:** W1b (three-zone layout)
**Status:** VERIFIED

---

## Goal

Implement responsive behavior for the three-zone layout across all breakpoints. At smaller screens, the layout progressively collapses: context panel hides, nav rail becomes bottom bar, content goes single-column.

## Acceptance Criteria

1. At >1440px: full three-zone layout — nav rail (72px) + main content (max 720px, centered in remaining space) + context panel (320px)
2. At 1200-1440px: three-zone with narrower context panel (280px), main content area shrinks proportionally
3. At 900-1200px: two-zone — nav rail (72px) + main content only; context panel hidden, accessible via overlay triggered from header button
4. At 600-900px: bottom navigation bar (56px height) replaces nav rail, single-column content, full width (with 16px horizontal padding)
5. At <600px: mobile browser layout — bottom nav (56px), simplified header (logo + minimal icons), content padding 12px, card border-radius reduced to 12px
6. Bottom navigation bar has 5 icon items matching nav rail items, active state uses copper fill, safe area padding for notched phones (`env(safe-area-inset-bottom)`)
7. Context panel on tablet (900-1200px) opens as a slide-in overlay from right with backdrop, 320px width, closeable via X or swipe right
8. CSS uses standard `@media` queries with breakpoint variables; layout shifts use no JavaScript — pure CSS media queries

## File Paths

- `apps/web/components/layout/AppShell.module.css`
- `apps/web/components/layout/BottomNav.tsx`
- `apps/web/components/layout/BottomNav.module.css`
- `apps/web/components/layout/ContextPanel.module.css`
- `apps/web/styles/breakpoints.css`
- `apps/web/hooks/useBreakpoint.ts`

## Technical Notes

### Breakpoint CSS Variables
```css
/* apps/web/styles/breakpoints.css */
/* Breakpoints (used as documentation, actual values in @media queries) */
/* --bp-mobile: 600px */
/* --bp-tablet: 900px */
/* --bp-desktop: 1200px */
/* --bp-wide: 1440px */
```

### Responsive Grid Changes
```css
/* Default: full desktop >1440px */
.shell {
  grid-template-columns: 72px 1fr 320px;
  grid-template-areas:
    "header header header"
    "rail   main   context";
}

/* 1200-1440px: narrower context */
@media (max-width: 1440px) {
  .shell {
    grid-template-columns: 72px 1fr 280px;
  }
}

/* 900-1200px: no context panel */
@media (max-width: 1200px) {
  .shell {
    grid-template-columns: 72px 1fr;
    grid-template-areas:
      "header header"
      "rail   main";
  }
  .contextPanel {
    display: none; /* Or position: fixed overlay */
  }
}

/* 600-900px: bottom nav */
@media (max-width: 900px) {
  .shell {
    grid-template-columns: 1fr;
    grid-template-rows: 56px 1fr 56px;
    grid-template-areas:
      "header"
      "main"
      "bottomnav";
  }
  .rail { display: none; }
  .main {
    padding: 0 var(--space-4);
  }
}

/* <600px: mobile browser */
@media (max-width: 600px) {
  .main {
    padding: 0 var(--space-3);
  }
  .header {
    padding: 0 var(--space-3);
  }
}
```

### Bottom Navigation
```css
.bottomNav {
  grid-area: bottomnav;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: var(--bg-elevated);
  border-top: 1px solid var(--border-subtle);
  box-shadow: 0 -1px 3px rgba(184, 115, 51, 0.04);
  padding-bottom: env(safe-area-inset-bottom, 0);
  z-index: 100;
}
.bottomNavItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--text-muted);
  font-size: 10px;
  font-family: var(--font-body);
  cursor: pointer;
  padding: var(--space-2);
}
.bottomNavItemActive {
  color: var(--color-copper);
}
```

### useBreakpoint Hook
```typescript
'use client';
import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 600) setBp('mobile');
      else if (w < 900) setBp('tablet');
      else if (w < 1440) setBp('desktop');
      else setBp('wide');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return bp;
}
```

Note: `useBreakpoint` is for JS logic decisions only (e.g., which component to render). Layout changes always use CSS media queries.

### Context Panel Overlay (Tablet)
```css
@media (max-width: 1200px) {
  .contextPanelOverlay {
    position: fixed;
    top: 64px;
    right: 0;
    bottom: 0;
    width: 320px;
    background: var(--bg-elevated);
    border-left: 1px solid var(--border-subtle);
    box-shadow: var(--shadow-xl);
    z-index: 150;
    transform: translateX(100%);
    transition: transform 300ms var(--spring);
  }
  .contextPanelOverlay.open {
    transform: translateX(0);
  }
  .contextBackdrop {
    position: fixed;
    inset: 0;
    top: 64px;
    background: rgba(44, 36, 33, 0.3);
    z-index: 149;
  }
}
```

## Definition of Done
- Layout renders correctly at 1440px, 1200px, 900px, 600px, 375px viewports
- Nav rail visible at >900px, bottom nav visible at <=900px
- Context panel visible at >1200px, overlay at 900-1200px, hidden at <900px
- Content padding adjusts per breakpoint
- Bottom nav has safe area padding for notched devices
- No horizontal scrollbar at any breakpoint
- Playwright visual regression screenshots at each breakpoint
