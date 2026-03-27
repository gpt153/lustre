# Epic: Wave 1a — CSS Design Tokens & Typography

**Epic ID:** F33-W1a
**Wave:** 1 — Design Foundation
**Size:** haiku
**Depends On:** None
**Status:** VERIFIED

---

## Goal

Establish the CSS foundation: design tokens as CSS custom properties, typography system with General Sans + Inter, and the global stylesheet with theme variants. After this epic, any component can reference `var(--color-copper)` and get the correct value for the active theme.

## Acceptance Criteria

1. CSS custom properties defined for all Lustre colors: copper (#B87333), gold (#D4A843), warm-white (#FDF8F3), charcoal (#2C2421), ember (#C85A3A), sage (#7A9E7E), gold-bright (#E8B84B), gold-deep (#C9973E), copper-light (#D4A574)
2. Semantic tokens defined: `--bg-primary`, `--bg-secondary`, `--bg-elevated`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border-subtle`, `--accent`, `--accent-glow`
3. Shadow tokens defined with copper-tinted multi-layer shadows: `--shadow-xs` through `--shadow-xl`
4. Four theme variants functional via `[data-theme="light|dark"]` and `[data-mode="vanilla|spicy"]` on `<html>`
5. General Sans loaded via `next/font/local` (weights 500, 600) as `--font-heading`; Inter loaded (weight 400) as `--font-body`
6. Typography scale implemented: hero (48px/56px), section (28px/36px), card-title (18px/24px), body (15px/24px), muted (13px/20px) with correct letter-spacing values
7. CSS `--spring` and `--spring-soft` easing variables defined using `linear()` function
8. `prefers-color-scheme` media query sets default theme; `prefers-reduced-motion` reduces all animation durations to near-instant

## File Paths

- `apps/web/styles/globals.css`
- `apps/web/styles/tokens.css`
- `apps/web/styles/typography.css`
- `apps/web/app/layout.tsx`
- `apps/web/app/fonts/` (font files directory)
- `packages/tokens/src/colors.ts` (reference, not modified)

## Technical Notes

### Token CSS Structure (tokens.css)
```css
:root {
  /* Palette */
  --color-copper: #B87333;
  --color-gold: #D4A843;
  --color-warm-white: #FDF8F3;
  --color-charcoal: #2C2421;
  --color-ember: #C85A3A;
  --color-sage: #7A9E7E;
  --color-gold-bright: #E8B84B;
  --color-gold-deep: #C9973E;
  --color-copper-light: #D4A574;

  /* Semantic — Light theme */
  --bg-primary: #FDF8F3;
  --bg-secondary: #FFFBF7;
  --bg-elevated: #FFFFFF;
  --text-primary: #2C2421;
  --text-secondary: #4A3F39;
  --text-muted: #8B7E74;
  --border-subtle: rgba(184, 115, 51, 0.08);
  --border-medium: rgba(184, 115, 51, 0.15);

  /* Mode — Vanilla default */
  --accent: #7A9E7E;
  --accent-glow: rgba(122, 158, 126, 0.15);

  /* Shadows — Copper-tinted */
  --shadow-xs: 0 1px 2px rgba(184, 115, 51, 0.04);
  --shadow-sm: 0 1px 2px rgba(184, 115, 51, 0.06), 0 4px 8px rgba(184, 115, 51, 0.04);
  --shadow-md: 0 1px 2px rgba(184, 115, 51, 0.06), 0 4px 8px rgba(184, 115, 51, 0.04), 0 12px 24px rgba(44, 36, 33, 0.03);
  --shadow-lg: 0 2px 4px rgba(184, 115, 51, 0.08), 0 8px 16px rgba(184, 115, 51, 0.06), 0 24px 48px rgba(44, 36, 33, 0.05);
  --shadow-xl: 0 4px 8px rgba(184, 115, 51, 0.1), 0 16px 32px rgba(184, 115, 51, 0.08), 0 48px 96px rgba(44, 36, 33, 0.06);

  /* Spring easing */
  --spring: linear(0, 0.009, 0.037, 0.082, 0.145, 0.223, 0.315, 0.418, 0.529, 0.644, 0.758, 0.866, 0.963, 1.044, 1.108, 1.152, 1.176, 1.182, 1.172, 1.149, 1.117, 1.079, 1.039, 1.0, 0.965, 0.937, 0.916, 0.903, 0.897, 0.898, 0.905, 0.916, 0.93, 0.945, 0.96, 0.974, 0.986, 0.995, 1.001, 1.004, 1.004, 1.002, 1.0);
  --spring-soft: linear(0, 0.011, 0.044, 0.098, 0.172, 0.263, 0.368, 0.483, 0.604, 0.726, 0.844, 0.953, 1.048, 1.125, 1.182, 1.217, 1.231, 1.226, 1.205, 1.172, 1.131, 1.085, 1.040, 1.0, 0.966, 0.940, 0.922, 0.912, 0.910, 0.914, 0.923, 0.936, 0.951, 0.966, 0.980, 0.990, 0.997, 1.001, 1.003, 1.002, 1.001, 1.0);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;
}

:root[data-theme="dark"] {
  --bg-primary: #1A1614;
  --bg-secondary: #231F1C;
  --bg-elevated: #2C2724;
  --text-primary: #FDF8F3;
  --text-secondary: #C4B8AD;
  --text-muted: #8B7E74;
  --border-subtle: rgba(212, 168, 67, 0.12);
  --border-medium: rgba(212, 168, 67, 0.2);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 1px 2px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2), 0 12px 24px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 2px 4px rgba(0, 0, 0, 0.35), 0 8px 16px rgba(0, 0, 0, 0.25), 0 24px 48px rgba(0, 0, 0, 0.2);
  --shadow-xl: 0 4px 8px rgba(0, 0, 0, 0.4), 0 16px 32px rgba(0, 0, 0, 0.3), 0 48px 96px rgba(0, 0, 0, 0.25);
}

:root[data-mode="spicy"] {
  --accent: #C85A3A;
  --accent-glow: rgba(200, 90, 58, 0.15);
}
```

### Typography CSS (typography.css)
```css
.text-hero {
  font-family: var(--font-heading);
  font-size: 48px;
  line-height: 56px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}
.text-section {
  font-family: var(--font-heading);
  font-size: 28px;
  line-height: 36px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}
.text-card-title {
  font-family: var(--font-heading);
  font-size: 18px;
  line-height: 24px;
  font-weight: 500;
  color: var(--text-primary);
}
.text-body {
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 24px;
  font-weight: 400;
  color: var(--text-secondary);
}
.text-muted {
  font-family: var(--font-body);
  font-size: 13px;
  line-height: 20px;
  font-weight: 400;
  color: var(--text-muted);
}
```

### Root Layout Font Setup
```typescript
// app/layout.tsx
import localFont from 'next/font/local';

const generalSans = localFont({
  src: [
    { path: './fonts/GeneralSans-Medium.woff2', weight: '500' },
    { path: './fonts/GeneralSans-Semibold.woff2', weight: '600' },
  ],
  variable: '--font-heading',
  display: 'swap',
});

const inter = localFont({
  src: [{ path: './fonts/Inter-Regular.woff2', weight: '400' }],
  variable: '--font-body',
  display: 'swap',
});
```

## Definition of Done
- All 4 theme combinations render correctly in browser
- No FOUT — fonts swap gracefully
- CSS custom properties accessible from any CSS Module
- `--spring` easing produces visible overshoot animation
- Reduced motion query tested
