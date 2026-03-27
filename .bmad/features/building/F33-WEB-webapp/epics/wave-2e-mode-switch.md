# Epic: Wave 2e — Mode Switch (Vanilla/Spicy)

**Epic ID:** F33-W2e
**Wave:** 2 — Core Pages
**Size:** haiku
**Depends On:** W1a (CSS tokens)
**Status:** NOT STARTED

---

## Goal

Implement the vanilla/spicy mode switch with a smooth 600ms CSS morph transition that affects the entire page — accent color, shadows, glows, and gradients all transform together.

## Acceptance Criteria

1. Mode toggle component in header: pill-shaped switcher with "Vanilla" (sage icon) and "Spicy" (ember flame icon), active side filled with accent color, inactive side transparent
2. Toggling mode sets `data-mode="vanilla|spicy"` attribute on `<html>` element, which triggers CSS custom property transitions for `--accent` (sage #7A9E7E -> ember #C85A3A) and `--accent-glow`
3. CSS `@property` registration for accent HSL values enables smooth color interpolation over 600ms (fallback: instant switch for browsers without `@property` support)
4. All accent-dependent elements morph simultaneously: nav rail active indicator, button hover glows, like button colors, card accent borders, profile action buttons, feed like hearts
5. Dark mode + spicy combination works correctly: dark background (#1A1614) with ember accents, gold-tinted borders
6. Theme toggle (light/dark) separate from mode toggle: theme uses `data-theme="light|dark"`, also with 600ms transition on background/text/shadow tokens
7. User's mode preference persisted via shared `usePreferencesStore` (Zustand) and synced to backend; default is vanilla
8. Content filtering updates on mode switch: spicy mode shows spicy-tagged content (SFW only on web), vanilla mode hides spicy-tagged content

## File Paths

- `apps/web/components/common/ModeSwitch.tsx`
- `apps/web/components/common/ModeSwitch.module.css`
- `apps/web/components/common/ThemeSwitch.tsx`
- `apps/web/components/common/ThemeSwitch.module.css`
- `apps/web/styles/tokens.css`
- `apps/web/hooks/useTheme.ts`

## Technical Notes

### CSS @property for Animated Custom Properties
```css
/* In tokens.css */
@property --accent-h {
  syntax: '<number>';
  inherits: true;
  initial-value: 130;
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
  --accent-glow: hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.15);
  transition: --accent-h 600ms ease, --accent-s 600ms ease, --accent-l 600ms ease;
}

:root[data-mode="spicy"] {
  --accent-h: 13;
  --accent-s: 55%;
  --accent-l: 50%;
}
```

### Fallback for No @property Support
```css
@supports not (syntax: '<number>') {
  :root {
    --accent: #7A9E7E;
    --accent-glow: rgba(122, 158, 126, 0.15);
  }
  :root[data-mode="spicy"] {
    --accent: #C85A3A;
    --accent-glow: rgba(200, 90, 58, 0.15);
  }
  /* No transition — instant switch */
}
```

### Mode Switch Component CSS
```css
.modeSwitch {
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  padding: 3px;
  border: 1px solid var(--border-subtle);
  position: relative;
}
.option {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-family: var(--font-heading);
  font-weight: 500;
  cursor: pointer;
  z-index: 1;
  color: var(--text-muted);
  transition: color 300ms ease;
}
.optionActive {
  color: white;
}
.slider {
  position: absolute;
  height: calc(100% - 6px);
  width: 50%;
  border-radius: var(--radius-full);
  background: var(--accent);
  transition: transform 400ms var(--spring), background 600ms ease;
  top: 3px;
  left: 3px;
}
.sliderSpicy {
  transform: translateX(100%);
}
```

### Theme Switch Component CSS
```css
.themeSwitch {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 200ms ease, background 200ms ease;
}
.themeSwitch:hover {
  background: rgba(184, 115, 51, 0.08);
  color: var(--text-primary);
}
```

### useTheme Hook
```typescript
'use client';
export function useTheme() {
  const setTheme = (theme: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lustre-theme', theme);
  };

  const setMode = (mode: 'vanilla' | 'spicy') => {
    document.documentElement.setAttribute('data-mode', mode);
    // Sync to shared preferences store
    usePreferencesStore.getState().setMode(mode);
  };

  // Initialize from localStorage or system preference
  useEffect(() => {
    const saved = localStorage.getItem('lustre-theme');
    if (saved) setTheme(saved as 'light' | 'dark');
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);

  return { setTheme, setMode };
}
```

### Theme Transition CSS
```css
:root {
  transition:
    --bg-primary 600ms ease,
    --bg-secondary 600ms ease,
    --text-primary 600ms ease,
    --text-secondary 600ms ease,
    --text-muted 600ms ease,
    --accent-h 600ms ease,
    --accent-s 600ms ease,
    --accent-l 600ms ease;
}
```

Note: CSS custom property transitions require `@property` registration. For properties without `@property`, the body gets a temporary class that applies `transition: background-color 600ms, color 600ms` to relevant selectors.

## Definition of Done
- Mode switch pill toggler renders in header
- Toggling vanilla/spicy morphs accent color across entire page over 600ms
- All accent-dependent elements update: nav rail, buttons, cards, hearts, glows
- Theme switch (light/dark) also morphs smoothly
- All 4 combinations work: light+vanilla, light+spicy, dark+vanilla, dark+spicy
- Preference persisted in localStorage and synced to backend
- Browsers without `@property` support fall back to instant switch
- Content filtering updates on mode change
