# Epic: Wave 1c — Core Components

**Epic ID:** F33-W1c
**Wave:** 1 — Design Foundation
**Size:** haiku
**Depends On:** W1a (CSS tokens)
**Status:** VERIFIED

---

## Goal

Build the reusable component library: Card, Button, Input, Modal, and Toast. These components implement the warm UI design language with copper-tinted shadows, spring animations, and proper theme support.

## Acceptance Criteria

1. Card component with warm styling: `background: var(--bg-elevated)`, `border: 1px solid var(--border-subtle)`, `border-radius: 16px`, multi-layered copper shadow (`var(--shadow-md)`), hover lifts card with `translateY(-2px)` and deepens shadow to `var(--shadow-lg)` using `--spring` easing over 300ms
2. Button component with variants: primary (copper background `#B87333`, white text), secondary (transparent, copper border), ghost (no border, hover shows `rgba(184, 115, 51, 0.08)` bg); all with `:active` scale(0.97) press effect and focus-visible ring
3. Input component with warm styling: `border: 1px solid var(--border-medium)`, `border-radius: var(--radius-md)`, focus state adds copper ring `box-shadow: 0 0 0 3px rgba(184, 115, 51, 0.15)`, label floats above on focus
4. Modal component using `<dialog>` element with warm overlay (`rgba(44, 36, 33, 0.5)`), modal content with `var(--shadow-xl)` and `border-radius: 20px`, enter animation using `--spring` easing (scale 0.95 -> 1, opacity 0 -> 1, 400ms), closes on Escape and overlay click
5. Toast component with stacked positioning (bottom-right), auto-dismiss after 4s, variants: success (sage accent), error (ember accent), info (copper accent); enter from right with spring animation
6. All components support `prefers-reduced-motion` — animations reduce to near-instant transitions
7. All components render correctly in all 4 theme variants (light/dark x vanilla/spicy)
8. All interactive components have visible focus indicators for keyboard navigation (`:focus-visible` with copper outline offset 2px)

## File Paths

- `apps/web/components/common/Card.tsx`
- `apps/web/components/common/Card.module.css`
- `apps/web/components/common/Button.tsx`
- `apps/web/components/common/Button.module.css`
- `apps/web/components/common/Input.tsx`
- `apps/web/components/common/Modal.tsx`

## Technical Notes

### Card CSS
```css
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
  transition: box-shadow 300ms var(--spring), transform 300ms var(--spring);
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
.cardFlat {
  box-shadow: none;
  border: 1px solid var(--border-medium);
}
.cardFlat:hover {
  box-shadow: var(--shadow-sm);
}
```

### Button CSS
```css
.button {
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 15px;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background 200ms ease, transform 100ms ease, box-shadow 200ms ease;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.button:active {
  transform: scale(0.97);
}
.button:focus-visible {
  outline: 2px solid var(--color-copper);
  outline-offset: 2px;
}
.primary {
  background: var(--color-copper);
  color: #FFFFFF;
  border: none;
  box-shadow: var(--shadow-sm);
}
.primary:hover {
  background: #A06429;
  box-shadow: var(--shadow-md);
}
.secondary {
  background: transparent;
  color: var(--color-copper);
  border: 1.5px solid var(--color-copper);
}
.secondary:hover {
  background: rgba(184, 115, 51, 0.08);
}
.ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
}
.ghost:hover {
  background: rgba(184, 115, 51, 0.08);
  color: var(--text-primary);
}
```

### Modal CSS
```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(44, 36, 33, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 200ms ease;
}
.modal {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  max-width: 560px;
  width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  padding: var(--space-8);
  animation: modalIn 400ms var(--spring);
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### RSC Boundaries
- All core components are Client Components (`'use client'`) since they handle interactions
- They accept children as props for composition with Server Components

## Definition of Done
- All components visually match warm UI spec with correct colors, shadows, radii
- Hover/press/focus states all functional
- Theme switching changes component appearance correctly
- Modal traps focus and closes on Escape
- Toast auto-dismisses and can be manually dismissed
- Reduced motion disables animations
- Keyboard navigation works for all interactive components
