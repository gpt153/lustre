# Test Spec: Wave 2 — Core Pages

**Feature:** F33-WEB
**Wave:** 2
**Tools:** Playwright, Lighthouse CI, axe-core
**Created:** 2026-03-27

---

## 1. Playwright E2E Tests

### 2a: Discover Grid

```
test/wave-2/discover-grid.spec.ts
```

- **T2a-01:** Grid displays profile cards in 4 columns at 1440px viewport
- **T2a-02:** Grid displays 3 columns at 1000px, 2 columns at 700px
- **T2a-03:** Hovering a card for 300ms shows second image (check opacity change on `.photoSecondary`)
- **T2a-04:** Hovering a card reveals info overlay (name, age visible in `.infoOverlay`)
- **T2a-05:** Clicking a card at >1200px opens profile in context panel (context panel content changes)
- **T2a-06:** Clicking a card at <1200px navigates to `/profile/[id]`
- **T2a-07:** Pressing `L` key on focused card triggers like action (card shows like feedback animation)
- **T2a-08:** Pressing `P` key on focused card triggers pass action (card fades)
- **T2a-09:** Arrow keys navigate focus between cards (verify `.cardFocused` class moves)
- **T2a-10:** Scrolling to bottom triggers infinite scroll — new skeleton cards appear, then real cards load
- **T2a-11:** First 8 images have `loading="eager"` or `priority` attribute; remaining have `loading="lazy"`
- **T2a-12:** Filter sidebar updates grid when filters change (e.g., toggling age range)

### 2b: Chat Layout

```
test/wave-2/chat-layout.spec.ts
```

- **T2b-01:** At >900px: two-column layout visible — conversation list (300px) and chat room
- **T2b-02:** At <900px: only conversation list visible initially; clicking conversation shows chat room
- **T2b-03:** Clicking a conversation in list selects it (active state with copper left border)
- **T2b-04:** Selected conversation shows messages in chat room
- **T2b-05:** Typing in message input and pressing Enter sends message (new bubble appears right-aligned with copper background)
- **T2b-06:** Shift+Enter inserts a newline in message input (message not sent)
- **T2b-07:** Escape key in chat at <900px returns to conversation list
- **T2b-08:** Unread badge shows correct count on conversation items
- **T2b-09:** Browser tab title updates with unread count (e.g., "(3) Lustre")
- **T2b-10:** Send button is disabled when input is empty, enabled when text entered
- **T2b-11:** Typing indicator (animated dots) displays when other user is typing (mock WebSocket event)

### 2c: Profile View & Edit

```
test/wave-2/profile.spec.ts
```

- **T2c-01:** Profile view shows hero photo at 3:4 aspect ratio
- **T2c-02:** Scrolling past hero photo shows sticky header with name/age (verify visibility transition)
- **T2c-03:** Profile prompt cards render with correct typography (question in text-muted, answer in text-body)
- **T2c-04:** Like button on profile has hover glow effect (verify `::before` pseudo-element opacity changes)
- **T2c-05:** Profile edit shows 3x2 photo grid
- **T2c-06:** Drag-and-drop photo reorder: drag first photo to third position, verify order changes (using Playwright drag)
- **T2c-07:** Profile edit auto-saves after 1 second of inactivity (verify "Saved" toast appears)
- **T2c-08:** Profile in context panel (320px): photos stack vertically, Like/Pass buttons fixed at bottom

### 2d: Feed Page

```
test/wave-2/feed.spec.ts
```

- **T2d-01:** Feed displays post cards in centered 720px max-width column
- **T2d-02:** Post card shows author avatar, name, timestamp, content text
- **T2d-03:** Clicking like button toggles heart icon (filled/unfilled) and updates count
- **T2d-04:** Like button animation: verify heart scales on click (check computed transform during animation)
- **T2d-05:** Clicking "comments" expands comment section below post
- **T2d-06:** Scrolling to bottom loads more posts (infinite scroll via IntersectionObserver)
- **T2d-07:** Every 5th card is a sponsored post (verify ".sponsoredLabel" text "Sponsrad" present)
- **T2d-08:** Post composer: focus textarea, type text, click submit — new post appears at top

### 2e: Mode Switch

```
test/wave-2/mode-switch.spec.ts
```

- **T2e-01:** Mode switch pill displays in header with Vanilla and Spicy options
- **T2e-02:** Clicking Spicy sets `data-mode="spicy"` on `<html>` element
- **T2e-03:** After switching to spicy: `--accent` resolves to ember color (verify computed style)
- **T2e-04:** After switching back to vanilla: `--accent` resolves to sage color
- **T2e-05:** Theme switch (light/dark) sets `data-theme` attribute correctly
- **T2e-06:** All 4 combinations render without visual errors (screenshot comparison)
- **T2e-07:** Mode preference persists after page reload (check `data-mode` attribute on load)

### 2f: Landing Page & Auth

```
test/wave-2/landing-auth.spec.ts
```

- **T2f-01:** Landing page loads with hero section showing title, subtitle, CTA button
- **T2f-02:** Landing page has correct Open Graph meta tags (check `<meta property="og:title">`)
- **T2f-03:** Login page: submit with empty fields shows validation errors
- **T2f-04:** Login page: submit with valid credentials redirects to `/discover`
- **T2f-05:** Login page: "Glömt lösenord?" link navigates to forgot-password page
- **T2f-06:** Register page: multi-step flow advances on valid input (step indicator updates)
- **T2f-07:** Register page: step validation prevents advancing with invalid data
- **T2f-08:** Forgot password: submit email shows success confirmation message
- **T2f-09:** Visiting `/discover` when not authenticated redirects to `/login`
- **T2f-10:** Visiting `/login` when authenticated redirects to `/discover`

---

## 2. Lighthouse CI — Wave 2

### Pages to Audit
| Page | Target Performance | Target Accessibility |
|------|-------------------|---------------------|
| Landing page | >95 | >95 |
| Discover (with profiles) | >90 | >90 |
| Chat | >90 | >90 |
| Profile view | >90 | >90 |
| Feed | >90 | >90 |

### Key Performance Checks
- Landing page LCP <2.0s (SSG, should be fast)
- Discover grid FCP <1.5s (RSC initial render)
- Chat page TTI <3.0s (WebSocket connection overhead)
- First load JS bundle <200KB (check via `total-byte-weight`)
- No layout shift on discover grid load (CLS <0.1)

---

## 3. Accessibility — Wave 2

### Per-Page axe-core Audits

```typescript
const pages = [
  { name: 'discover', url: '/discover' },
  { name: 'chat', url: '/chat' },
  { name: 'profile-view', url: '/profile/test-id' },
  { name: 'profile-edit', url: '/profile/edit' },
  { name: 'feed', url: '/feed' },
  { name: 'login', url: '/login' },
  { name: 'register', url: '/register' },
];

for (const p of pages) {
  test(`${p.name} page passes accessibility audit`, async ({ page }) => {
    await page.goto(p.url);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
```

### Specific Accessibility Tests
- **A2-01:** Discover grid keyboard navigation: Tab reaches first card, arrow keys navigate, all cards focusable
- **A2-02:** Chat message input: label associated, error messages linked via `aria-describedby`
- **A2-03:** Profile action buttons: `aria-label` for Like ("Gilla"), Pass ("Passa"), SuperLike ("Copper Pick")
- **A2-04:** Modal focus management: opening profile from grid traps focus in context panel/modal
- **A2-05:** Feed post images: all have meaningful `alt` text or `aria-hidden` for decorative images
- **A2-06:** Mode switch: `role="radiogroup"` with `aria-label`, each option has `role="radio"` with `aria-checked`
- **A2-07:** Conversation list: `role="listbox"` with `aria-label`, each item has `role="option"`

---

## 4. Visual Regression — Wave 2

### Screenshots at 1440px
- Discover grid with 8 profile cards
- Chat two-column layout with conversation selected
- Profile view scrolled to prompts section
- Feed with 3 posts (including 1 sponsored)
- Landing page hero section
- Login page
- Mode switch: all 4 theme combinations on discover page

### Screenshots at 375px (Mobile)
- Discover grid (2 columns)
- Chat conversation list
- Chat room (single column)
- Feed (single column)
- Landing page hero
- Login page

---

## 5. Cross-Browser — Wave 2

### Priority Tests Per Browser
| Test | Chrome | Firefox | Safari |
|------|--------|---------|--------|
| Discover grid layout | P0 | P0 | P0 |
| Card hover crossfade | P0 | P0 | P1 |
| Chat WebSocket | P0 | P0 | P1 |
| CSS `linear()` easing | P0 | P0 | P1 |
| `backdrop-filter` blur | P0 | P1 | P0 |
| CSS `@property` transitions | P0 | P1 | P1 |
| Drag-and-drop photo reorder | P0 | P0 | P1 |

### Known Browser Considerations
- Firefox: `backdrop-filter` may need `-webkit-` prefix or may not be supported — test fallback
- Safari: `@property` support is newer — verify mode switch fallback works
- All browsers: `linear()` easing supported in modern versions, verify spring animation plays
