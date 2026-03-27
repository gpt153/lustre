# Research: Implementing "Warm UI" Paradigm for Web

**Created:** 2026-03-27

---

## 1. Core Warm UI Principles

Lustre's design language rejects cold, clinical UI. Every surface should feel like it has warmth, texture, and subtle life. On mobile this is achieved through haptics and native blur. On web, we achieve it through CSS — and CSS actually has MORE tools for warmth than mobile.

### The Warmth Stack
1. **Texture** — paper grain background, noise overlay
2. **Depth** — multi-layered copper-tinted shadows
3. **Life** — breathing ambient gradients, subtle motion
4. **Materiality** — glassmorphism with warm tint
5. **Color temperature** — warm whites, copper accents, never pure white or black

---

## 2. Texture Implementation

### Paper Grain Background
```css
.page {
  background-color: var(--bg-primary); /* #FDF8F3 light, #1A1614 dark */
  background-image: url('/textures/paper-grain.png');
  background-size: 200px;
  background-blend-mode: multiply;
}
```

**Performance considerations:**
- Paper grain PNG should be small (~5KB), 200x200px, seamlessly tiling
- `background-blend-mode: multiply` is GPU-accelerated
- Applied only to the page container, not individual cards
- In dark mode, use `background-blend-mode: screen` or a different grain texture

### Noise Overlay for Depth
```css
.elevated-surface::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/textures/noise-soft.png');
  background-size: 128px;
  opacity: 0.03;
  pointer-events: none;
  border-radius: inherit;
}
```

**Performance:**
- Noise PNG: 128x128px, ~2KB
- `opacity: 0.03` — barely visible but adds subtle material quality
- `pointer-events: none` — doesn't interfere with interactions
- Only apply to elevated surfaces (modals, cards), not every element

---

## 3. Depth — Multi-Layered Shadows

### Shadow System
Lustre uses copper-tinted shadows instead of gray/black. Three layers create natural depth:

```css
:root {
  /* Shadow tokens */
  --shadow-xs: 0 1px 2px rgba(184, 115, 51, 0.04);
  --shadow-sm: 0 1px 2px rgba(184, 115, 51, 0.06),
               0 4px 8px rgba(184, 115, 51, 0.04);
  --shadow-md: 0 1px 2px rgba(184, 115, 51, 0.06),
               0 4px 8px rgba(184, 115, 51, 0.04),
               0 12px 24px rgba(44, 36, 33, 0.03);
  --shadow-lg: 0 2px 4px rgba(184, 115, 51, 0.08),
               0 8px 16px rgba(184, 115, 51, 0.06),
               0 24px 48px rgba(44, 36, 33, 0.05);
  --shadow-xl: 0 4px 8px rgba(184, 115, 51, 0.1),
               0 16px 32px rgba(184, 115, 51, 0.08),
               0 48px 96px rgba(44, 36, 33, 0.06);
}
```

**Dark mode shadows:**
```css
:root[data-theme="dark"] {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3),
               0 4px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 1px 2px rgba(0, 0, 0, 0.3),
               0 4px 8px rgba(0, 0, 0, 0.2),
               0 12px 24px rgba(0, 0, 0, 0.15);
  /* ... */
}
```

**Performance:**
- Multi-layered `box-shadow` is GPU-composited
- Transition on hover: `transition: box-shadow 300ms var(--spring), transform 300ms var(--spring)`
- Never animate `box-shadow` on scroll — only on hover/focus

---

## 4. Life — Breathing Animations

### Ambient Breathing Gradient
A very subtle copper gradient that "breathes" in the background, giving the page a sense of life.

```css
.page::after {
  content: '';
  position: fixed;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at 70% 30%,
    rgba(184, 115, 51, 0.08) 0%,
    transparent 60%
  );
  animation: breathe 8s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes breathe {
  0%, 100% { opacity: 0.04; transform: scale(1); }
  50% { opacity: 0.08; transform: scale(1.05); }
}
```

**Performance considerations:**
- Uses `opacity` and `transform` only — both are composited, no layout/paint
- `position: fixed` with `pointer-events: none` — doesn't affect layout
- 8-second cycle — slow enough to be subliminal
- `will-change: opacity, transform` can be added if jank detected
- Respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  .page::after { animation: none; opacity: 0.06; }
}
```

### Skeleton Loading Pulse
```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(184, 115, 51, 0.08) 0%,
    rgba(184, 115, 51, 0.15) 50%,
    rgba(184, 115, 51, 0.08) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 5. Materiality — Glassmorphism

### Header (warm glassmorphism)
```css
.header {
  background: rgba(253, 248, 243, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(184, 115, 51, 0.12);
  box-shadow: 0 1px 3px rgba(184, 115, 51, 0.04);
}
.header[data-theme="dark"] {
  background: rgba(26, 22, 20, 0.78);
  border-bottom: 1px solid rgba(212, 168, 67, 0.15);
}
```

**Performance considerations:**
- `backdrop-filter` is expensive on large areas — limit to header (64px height) and modals
- `saturate(180%)` makes the blur feel warm rather than gray
- Do NOT apply `backdrop-filter` to full-page overlays — use semi-transparent solid background instead
- Test on Firefox — `backdrop-filter` has variable support; fallback to solid background

### Modal Overlay
```css
.modal-overlay {
  background: rgba(44, 36, 33, 0.5); /* warm tint, not black */
}
.modal-content {
  background: var(--bg-elevated);
  backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-xl);
  border-radius: 20px;
}
```

---

## 6. CSS Spring Animations

### The `linear()` Easing Function
Modern CSS supports `linear()` for custom easing curves that approximate spring physics:

```css
:root {
  --spring: linear(
    0, 0.009, 0.037, 0.082, 0.145, 0.223, 0.315, 0.418,
    0.529, 0.644, 0.758, 0.866, 0.963, 1.044, 1.108,
    1.152, 1.176, 1.182, 1.172, 1.149, 1.117, 1.079,
    1.039, 1.0, 0.965, 0.937, 0.916, 0.903, 0.897,
    0.898, 0.905, 0.916, 0.93, 0.945, 0.96, 0.974,
    0.986, 0.995, 1.001, 1.004, 1.004, 1.002, 1.0
  );
  --spring-soft: linear(
    0, 0.011, 0.044, 0.098, 0.172, 0.263, 0.368, 0.483,
    0.604, 0.726, 0.844, 0.953, 1.048, 1.125, 1.182,
    1.217, 1.231, 1.226, 1.205, 1.172, 1.131, 1.085,
    1.040, 1.0, 0.966, 0.940, 0.922, 0.912, 0.910,
    0.914, 0.923, 0.936, 0.951, 0.966, 0.980, 0.990,
    0.997, 1.001, 1.003, 1.002, 1.001, 1.0
  );
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Usage Patterns
```css
/* Card hover — bouncy lift */
.card {
  transition: transform 400ms var(--spring),
              box-shadow 400ms var(--spring);
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Button press — quick snap */
.button:active {
  transform: scale(0.97);
  transition: transform 100ms ease-out;
}

/* Modal appear */
.modal[open] {
  animation: modal-in 400ms var(--spring);
}
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
```

**Browser support:**
- `linear()` supported in Chrome 113+, Firefox 112+, Safari 17.2+
- Fallback: `cubic-bezier(0.2, 0, 0, 1)` — close approximation without overshoot
```css
transition: transform 400ms cubic-bezier(0.2, 0, 0, 1);
transition: transform 400ms var(--spring); /* override if supported */
```

---

## 7. Hover as Design Language

### Profile Card Hover
```css
.profile-card {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
}
.profile-card .image-primary,
.profile-card .image-secondary {
  position: absolute;
  inset: 0;
  object-fit: cover;
  transition: opacity 300ms ease;
}
.profile-card .image-secondary {
  opacity: 0;
}
.profile-card:hover .image-secondary {
  opacity: 1;
}
.profile-card .info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(44, 36, 33, 0.7));
  transform: translateY(100%);
  transition: transform 300ms var(--spring);
}
.profile-card:hover .info-overlay {
  transform: translateY(0);
}
```

### Like Button Hover Glow
```css
.like-button {
  position: relative;
}
.like-button::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(184, 115, 51, 0.2) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 300ms ease;
}
.like-button:hover::before {
  opacity: 1;
}
```

### Avatar Hover Ring
```css
.avatar {
  border-radius: 50%;
  transition: transform 200ms var(--spring),
              box-shadow 200ms var(--spring);
}
.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 0 3px var(--color-copper),
              0 0 0 5px rgba(184, 115, 51, 0.2);
}
```

---

## 8. Mode Switch Morph

### CSS `@property` for Animatable Custom Properties
```css
@property --accent-h {
  syntax: '<number>';
  inherits: true;
  initial-value: 130; /* sage hue */
}
@property --accent-s {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 23%;
}
@property --accent-l {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 46%;
}

:root {
  --accent: hsl(var(--accent-h), var(--accent-s), var(--accent-l));
  transition: --accent-h 600ms ease,
              --accent-s 600ms ease,
              --accent-l 600ms ease;
}
:root[data-mode="spicy"] {
  --accent-h: 13; /* ember hue */
  --accent-s: 55%;
  --accent-l: 50%;
}
```

**Browser support:** `@property` is in Chrome 85+, Firefox 128+, Safari 15.4+.
Fallback: instant color switch (no transition) for older browsers.

---

## 9. Performance Budget

| Item | Budget | Notes |
|------|--------|-------|
| Paper grain texture | 5KB | PNG, 200x200, tiling |
| Noise texture | 2KB | PNG, 128x128 |
| Font files | 80KB | 4 WOFF2 files |
| Breathing gradient | 0KB | CSS only |
| Spring easing | 0KB | CSS only |
| Glassmorphism | 0KB | CSS only, but GPU cost |
| Sound files | 15KB | 4 MP3 files |
| **Total warm UI assets** | **~102KB** | Well within budget |

### GPU Performance Rules
1. Only animate `opacity` and `transform` — never `width`, `height`, `top`, `left`
2. Use `will-change` sparingly — only on elements that will actually animate
3. Limit `backdrop-filter` to small areas (header, modals) — expensive on large surfaces
4. `background-blend-mode` on page container is fine — it's a single composited layer
5. Test breathing gradient on low-end laptops — reduce or disable if >16ms frame time

---

## 10. Reduced Motion Support

Every animation must be disabled when `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .page::after {
    animation: none;
    opacity: 0.06;
  }
}
```

**Note:** Don't set `animation: none` globally — some animations (like skeleton loading) serve functional purposes. Instead, reduce duration to near-instant so state changes still occur.
