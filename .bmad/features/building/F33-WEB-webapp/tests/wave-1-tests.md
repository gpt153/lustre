# Test Spec: Wave 1 — Design Foundation

**Feature:** F33-WEB
**Wave:** 1
**Tools:** Playwright, Lighthouse CI, axe-core
**Created:** 2026-03-27

---

## 1. Playwright E2E Tests

### 1a: CSS Tokens & Typography

```
test/wave-1/tokens-typography.spec.ts
```

- **T1a-01:** Verify CSS custom property `--color-copper` resolves to `#B87333` on `:root`
- **T1a-02:** Verify `--bg-primary` changes from `#FDF8F3` to `#1A1614` when `data-theme="dark"` is set on `<html>`
- **T1a-03:** Verify `--accent` changes from `#7A9E7E` to `#C85A3A` when `data-mode="spicy"` is set on `<html>`
- **T1a-04:** Verify heading text uses General Sans font-family (computed style check)
- **T1a-05:** Verify body text uses Inter font-family (computed style check)
- **T1a-06:** Verify hero text is 48px font-size, 56px line-height, -0.02em letter-spacing
- **T1a-07:** Verify `--spring` easing variable is defined and contains `linear()` function

### 1b: Three-Zone Layout

```
test/wave-1/three-zone-layout.spec.ts
```

- **T1b-01:** At 1440px viewport: verify grid has 3 columns (72px rail, flexible main, 320px context panel)
- **T1b-02:** Header is sticky — scroll down 500px and verify header is still at top (position: sticky)
- **T1b-03:** Header has backdrop-filter blur (computed style `backdrop-filter` contains "blur")
- **T1b-04:** Header bottom border uses copper-tinted color
- **T1b-05:** Nav rail items show tooltip on hover (wait for tooltip element to be visible after 300ms)
- **T1b-06:** Nav rail active item has copper left border
- **T1b-07:** Main content area has `max-width: 720px`
- **T1b-08:** Context panel is 320px wide and independently scrollable
- **T1b-09:** Paper grain background image is applied to page container

### 1c: Core Components

```
test/wave-1/core-components.spec.ts
```

- **T1c-01:** Card component: verify border-radius 16px, box-shadow matches `--shadow-md`
- **T1c-02:** Card hover: verify `translateY(-2px)` transform on hover
- **T1c-03:** Button primary: verify copper background `#B87333`, white text
- **T1c-04:** Button active: verify scale(0.97) transform on mousedown
- **T1c-05:** Button focus-visible: verify copper outline appears on Tab focus
- **T1c-06:** Input focus: verify copper ring box-shadow on focus
- **T1c-07:** Modal: open modal, verify backdrop visible, ESC key closes it
- **T1c-08:** Modal: click backdrop closes modal
- **T1c-09:** Modal: focus is trapped inside modal (Tab cycles within modal elements)
- **T1c-10:** Toast: trigger toast, verify it auto-dismisses after 4 seconds

### 1d: Skeleton & Empty States

```
test/wave-1/skeleton-empty-states.spec.ts
```

- **T1d-01:** Skeleton component has shimmer animation (verify `animation` computed style)
- **T1d-02:** Skeleton has `aria-hidden="true"`
- **T1d-03:** Parent container has `aria-busy="true"` when skeleton is displayed
- **T1d-04:** EmptyState shows title, description, and CTA button
- **T1d-05:** SkeletonProfileGrid renders correct column count per breakpoint (4/3/2)

### 1e: Keyboard Shortcuts & Command Palette

```
test/wave-1/keyboard-shortcuts.spec.ts
```

- **T1e-01:** Ctrl+K opens command palette
- **T1e-02:** ESC closes command palette
- **T1e-03:** Typing in command palette search shows results
- **T1e-04:** Arrow keys navigate command palette results (verify `.resultItemActive` class moves)
- **T1e-05:** Enter selects active result (navigates to correct page)
- **T1e-06:** Number keys 1-5 switch tabs when not in an input field
- **T1e-07:** Keyboard shortcuts are disabled when focus is in a text input
- **T1e-08:** `?` key shows keyboard shortcut overlay

### 1f: Responsive Breakpoints

```
test/wave-1/responsive.spec.ts
```

- **T1f-01:** At 1440px: three-zone layout visible (rail + content + context)
- **T1f-02:** At 1200px: three-zone with narrower context panel
- **T1f-03:** At 900px: two-zone layout (rail + content), no context panel
- **T1f-04:** At 600px: bottom nav visible, no rail
- **T1f-05:** At 375px: single-column layout, simplified header
- **T1f-06:** Bottom nav has 5 items with correct icons
- **T1f-07:** No horizontal scrollbar at any breakpoint (check `document.body.scrollWidth <= window.innerWidth`)

---

## 2. Lighthouse CI

### Configuration
```yaml
# .lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.90 }],
        "categories:accessibility": ["error", { "minScore": 0.90 }],
        "categories:best-practices": ["error", { "minScore": 0.90 }],
        "categories:seo": ["warn", { "minScore": 0.85 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1500 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 3000 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-byte-weight": ["warn", { "maxNumericValue": 500000 }]
      }
    }
  }
}
```

### Targets for Wave 1
| Metric | Target | Notes |
|--------|--------|-------|
| Performance | >90 | Allow 90 for Wave 1 shell (no data yet), target 95 by Wave 3 |
| Accessibility | >90 | All components have proper ARIA |
| Best Practices | >90 | CSP headers, HTTPS, etc. |
| FCP | <1.5s | Shell only, should be fast |
| LCP | <3.0s | Relaxed for Wave 1, tighten to <2.5s in Wave 3 |
| CLS | <0.1 | No layout shifts in shell |

---

## 3. Accessibility Audit (axe-core)

### Integration with Playwright
```typescript
import AxeBuilder from '@axe-core/playwright';

test('Wave 1 shell passes accessibility audit', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Key Checks
- All interactive elements are keyboard-focusable
- Focus order follows visual layout
- Color contrast ratios meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
- All images have alt text or are aria-hidden
- Modal focus trapping works correctly
- ARIA roles and labels on custom components (nav, dialog, switch)
- Skip-to-content link present

---

## 4. Visual Regression Screenshots

### Breakpoints to Capture
Capture full-page screenshots at each breakpoint for visual regression baseline:

```typescript
const breakpoints = [
  { name: 'wide', width: 1440, height: 900 },
  { name: 'desktop', width: 1200, height: 900 },
  { name: 'tablet', width: 900, height: 1200 },
  { name: 'mobile-landscape', width: 600, height: 400 },
  { name: 'mobile-portrait', width: 375, height: 812 },
];

for (const bp of breakpoints) {
  test(`Visual regression: ${bp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto('/');
    await expect(page).toHaveScreenshot(`shell-${bp.name}.png`);
  });
}
```

### Theme Variants to Capture
At 1440px, capture:
- light + vanilla
- light + spicy
- dark + vanilla
- dark + spicy

---

## 5. Cross-Browser Matrix

| Browser | Version | Priority |
|---------|---------|----------|
| Chrome | Latest | P0 |
| Firefox | Latest | P0 |
| Safari | Latest | P1 |
| Edge | Latest | P2 |

### Playwright Browser Config
```typescript
// playwright.config.ts
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]
```
