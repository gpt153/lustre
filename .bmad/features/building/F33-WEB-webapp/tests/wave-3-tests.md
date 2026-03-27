# Test Spec: Wave 3 — Secondary Pages & Polish

**Feature:** F33-WEB
**Wave:** 3
**Tools:** Playwright, Lighthouse CI, axe-core
**Created:** 2026-03-27

---

## 1. Playwright E2E Tests

### 3a: Events, Groups, Organizations

```
test/wave-3/events-groups.spec.ts
```

- **T3a-01:** Events listing shows cards in responsive grid (3 columns at 1200px, 2 at 900px, 1 at 600px)
- **T3a-02:** Event card hover lifts card (`translateY(-2px)`) and deepens shadow
- **T3a-03:** Clicking event card navigates to event detail page
- **T3a-04:** Event detail shows cover image, title, date, description, attendee list, RSVP button
- **T3a-05:** Groups listing shows group cards with member count and join button
- **T3a-06:** Group detail page shows header, member grid, and group feed posts
- **T3a-07:** Category filter dropdown filters events/groups listing correctly
- **T3a-08:** "Ladda fler" button loads next page of results

### 3b: Learn, Coach, Achievements

```
test/wave-3/learn-coach-achievements.spec.ts
```

- **T3b-01:** Learn listing shows module cards with progress bars
- **T3b-02:** Module detail renders article content with heading hierarchy
- **T3b-03:** Scroll progress indicator updates as user scrolls through module content
- **T3b-04:** "Markera som klar" button marks module complete and updates progress bar to 100%
- **T3b-05:** Coach page shows chat interface with coach avatar
- **T3b-06:** Coach page shows "Röstläge finns i appen" banner
- **T3b-07:** Coach suggested prompt chips: clicking chip populates message input
- **T3b-08:** Achievements page shows badge grid — unlocked badges in color, locked in grayscale
- **T3b-09:** Streak counter shows current streak number and flame icon
- **T3b-10:** Achievement badge hover shows description tooltip

### 3c: Marketplace

```
test/wave-3/marketplace.spec.ts
```

- **T3c-01:** Marketplace grid shows product cards in responsive columns (4/3/2)
- **T3c-02:** Product card hover crossfades to second image
- **T3c-03:** Product detail shows image gallery — clicking thumbnail switches main image
- **T3c-04:** Filter sidebar filters by category and price range
- **T3c-05:** Business shop page shows shop header and product grid
- **T3c-06:** P2P listing form: upload photos, enter title/description/price, preview listing
- **T3c-07:** Search bar with `/` shortcut focuses and shows autocomplete suggestions

### 3d: Settings Panel

```
test/wave-3/settings.spec.ts
```

- **T3d-01:** Settings page shows sidebar navigation + content area at >900px
- **T3d-02:** Settings sidebar collapses to top navigation at <900px
- **T3d-03:** Clicking sidebar item loads corresponding settings section
- **T3d-04:** Toggle switch: click toggles `aria-checked` attribute and knob position
- **T3d-05:** Toggle switch: keyboard accessible — Space/Enter toggles
- **T3d-06:** Theme toggle in Appearance section changes `data-theme` attribute live
- **T3d-07:** Delete account shows confirmation modal with destructive button
- **T3d-08:** Settings changes persist after page reload

### 3e: Warm UI Polish

```
test/wave-3/warm-ui.spec.ts
```

- **T3e-01:** Paper grain texture applied to page background (verify `background-image` computed style contains `paper-grain`)
- **T3e-02:** Breathing gradient animates (verify `.appShell::after` has `animation` containing "breathe")
- **T3e-03:** Sound manager initializes on first user interaction (click any button, verify AudioContext created)
- **T3e-04:** Like action triggers like sound (mock AudioContext and verify `createBufferSource` called)
- **T3e-05:** Nav rail icon scales to 1.05 on hover (verify computed transform)
- **T3e-06:** Avatar hover shows copper ring (verify box-shadow contains copper color)
- **T3e-07:** `prefers-reduced-motion: reduce` disables animations (emulate via Playwright and verify no animations)

### 3f: App-Only Prompts

```
test/wave-3/app-only-prompts.spec.ts
```

- **T3f-01:** Navigating to `/consent-vault` shows AppOnlyPrompt with "ConsentVault finns i appen" title
- **T3f-02:** Navigating to `/safe-date` shows AppOnlyPrompt with "SafeDate kräver mobilappen" title
- **T3f-03:** AppOnlyPrompt shows app store badges (at least one store badge image visible)
- **T3f-04:** AppOnlyPrompt shows QR code on desktop viewport
- **T3f-05:** "Tillbaka" button navigates back to previous page
- **T3f-06:** Spicy content (nudity MEDIUM/HIGH) in feed shows inline gate instead of content
- **T3f-07:** Call button in chat shows CallGateModal
- **T3f-08:** CallGateModal closes on Escape key or backdrop click

---

## 2. Lighthouse CI — Final Audit

### All Pages Performance Targets
| Page | Performance | Accessibility | Best Practices | SEO |
|------|------------|---------------|----------------|-----|
| Landing | >95 | >95 | >95 | >95 |
| Discover | >95 | >95 | >95 | >90 |
| Chat | >90 | >95 | >95 | >85 |
| Profile | >95 | >95 | >95 | >90 |
| Feed | >90 | >95 | >95 | >85 |
| Events | >95 | >95 | >95 | >90 |
| Learn | >95 | >95 | >95 | >95 |
| Marketplace | >90 | >95 | >95 | >90 |
| Settings | >95 | >95 | >95 | >85 |

### Core Web Vitals Final Targets
| Metric | Target | Max Acceptable |
|--------|--------|----------------|
| FCP | <1.2s | <1.5s |
| LCP | <2.5s | <3.0s |
| CLS | <0.1 | <0.15 |
| FID/INP | <100ms | <200ms |
| Total JS (first load) | <200KB | <250KB |

### Bundle Analysis
```bash
# Run in CI
npx @next/bundle-analyzer
# Verify:
# - No single chunk >100KB
# - Framer Motion only in CommandPalette and Toast chunks
# - Phoenix JS client in shared chunk
# - No unused packages in bundle
```

---

## 3. Accessibility — Final Audit

### Full-Site axe-core Sweep

```typescript
const allPages = [
  '/', '/login', '/register', '/forgot-password',
  '/discover', '/chat', '/profile/test-id', '/profile/edit',
  '/feed', '/events', '/events/test-id', '/groups', '/groups/test-id',
  '/learn', '/learn/test-id', '/coach', '/achievements',
  '/marketplace', '/marketplace/test-id',
  '/settings',
  '/consent-vault', '/safe-date',
];

for (const url of allPages) {
  test(`${url} passes WCAG 2.1 AA`, async ({ page }) => {
    await page.goto(url);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
```

### Manual Accessibility Checks (not automatable)
- [ ] Screen reader walkthrough of discover -> profile -> like flow (NVDA/VoiceOver)
- [ ] Screen reader walkthrough of chat message flow
- [ ] Keyboard-only complete user journey: login -> discover -> like -> chat -> send message
- [ ] High contrast mode rendering check
- [ ] 200% zoom rendering check (no overflow, no truncation of essential content)
- [ ] `prefers-reduced-motion` full walkthrough — all animations disabled, app still functional

---

## 4. Visual Regression — Final

### Full Page Screenshots
Capture at 1440px and 375px for all pages:

```typescript
const screenshotPages = [
  { name: 'landing', url: '/' },
  { name: 'discover', url: '/discover' },
  { name: 'chat', url: '/chat' },
  { name: 'profile', url: '/profile/test-id' },
  { name: 'profile-edit', url: '/profile/edit' },
  { name: 'feed', url: '/feed' },
  { name: 'events', url: '/events' },
  { name: 'event-detail', url: '/events/test-id' },
  { name: 'groups', url: '/groups' },
  { name: 'learn', url: '/learn' },
  { name: 'achievements', url: '/achievements' },
  { name: 'marketplace', url: '/marketplace' },
  { name: 'settings', url: '/settings' },
  { name: 'consent-vault', url: '/consent-vault' },
];

for (const p of screenshotPages) {
  for (const width of [1440, 375]) {
    test(`Visual: ${p.name} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
      await page.goto(p.url);
      await expect(page).toHaveScreenshot(`${p.name}-${width}.png`, {
        maxDiffPixelRatio: 0.01,
      });
    });
  }
}
```

### Theme Variant Screenshots (at 1440px)
For discover page only (representative):
- light_vanilla, light_spicy, dark_vanilla, dark_spicy

---

## 5. Cross-Browser — Final

### Full Browser Matrix

| Browser | Engine | Test Scope |
|---------|--------|------------|
| Chrome 120+ | Chromium | Full E2E suite |
| Firefox 120+ | Gecko | Full E2E suite |
| Safari 17+ | WebKit | Full E2E suite |
| Edge 120+ | Chromium | Smoke tests (layout, auth, discover) |

### Browser-Specific Regression Tests
- **Safari:** `backdrop-filter` renders on header and modals
- **Safari:** `@property` CSS property transitions work (or fallback)
- **Firefox:** `linear()` easing renders spring animation
- **Firefox:** `backdrop-filter` renders (with prefix if needed)
- **All:** WebSocket connection establishes and messages flow
- **All:** Drag-and-drop photo reorder works
- **All:** Font loading without FOUT

---

## 6. Performance Regression Prevention

### CI Pipeline Integration
```yaml
# In GitHub Actions workflow
- name: Build
  run: npm run build
- name: Lighthouse CI
  run: npx lhci autorun
- name: Bundle Size Check
  run: |
    SIZE=$(stat -f%z .next/static/chunks/*.js | awk '{s+=$1} END {print s}')
    if [ $SIZE -gt 200000 ]; then
      echo "Bundle too large: ${SIZE} bytes"
      exit 1
    fi
- name: Playwright Tests
  run: npx playwright test
```

### Performance Monitoring Checklist
- [ ] No JS chunk exceeds 100KB
- [ ] Total first-load JS <200KB
- [ ] No unoptimized images (all via Next.js Image)
- [ ] No unnecessary client-side rendering (verify RSC boundaries)
- [ ] No memory leaks (check via Chrome DevTools heap snapshot after 5min session)
- [ ] WebSocket reconnection works after network interruption
- [ ] Page navigation <300ms (client-side, after initial load)
