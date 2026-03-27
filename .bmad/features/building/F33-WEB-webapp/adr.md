# ADR: F33 — Lustre Web App Architecture Decisions

**Feature ID:** F33-WEB
**Created:** 2026-03-27

---

## ADR-001: CSS Modules over Tailwind CSS

**Status:** Accepted
**Context:** The web app needs a styling approach that supports the warm UI design language (copper shadows, glassmorphism, CSS spring animations, breathing gradients) while maintaining performance and developer experience.

**Options Considered:**
1. **Tailwind CSS** — Utility-first, fast prototyping, large community
2. **CSS Modules** — Scoped CSS files, full CSS power, zero runtime
3. **Vanilla Extract** — Type-safe CSS-in-TS, zero runtime
4. **Styled Components** — CSS-in-JS, runtime cost

**Decision:** CSS Modules

**Rationale:**
- Lustre's warm UI requires complex CSS: `linear()` easing, `@property`, `backdrop-filter`, multi-layered `box-shadow`, `background-blend-mode`, `@keyframes`. These are verbose and unreadable as Tailwind utility classes.
- CSS Modules have zero runtime cost — critical for the <200KB bundle target.
- Full access to modern CSS features without abstraction layers.
- Co-located with components: `ProfileCard.module.css` alongside `ProfileCard.tsx`.
- Design tokens exported as CSS custom properties from `packages/tokens/`, consumed naturally in CSS.
- Next.js has first-class CSS Modules support with no configuration.

**Trade-offs:**
- Slower initial development vs Tailwind utility classes
- No utility shorthand — more verbose for simple spacing/layout
- Must manually ensure consistency (mitigated by CSS custom properties from tokens)

**Consequences:**
- All component styles in `.module.css` files
- Global styles in `apps/web/styles/globals.css` (resets, CSS custom properties, fonts)
- Theme variants via CSS custom properties on `:root` and `[data-theme]` / `[data-mode]`
- Responsive styles via standard `@media` queries in CSS modules

---

## ADR-002: Framer Motion Scope — Orchestrated Sequences Only

**Status:** Accepted
**Context:** The web app needs animations for UI polish. CSS handles most animations via `linear()` easing for spring-like curves, `transition`, and `@keyframes`. However, some complex sequences require orchestration.

**Decision:** Use Framer Motion exclusively for multi-element orchestrated animations. All other animations use pure CSS.

**Framer Motion use cases (exhaustive list):**
1. **Command palette** — staggered list items appearing, backdrop fade
2. **Page transitions** — cross-fade between routes with layout animation
3. **Toast notifications** — staggered stack with exit animations
4. **Mode switch morph** — coordinated color/shadow/gradient transition (if CSS `@property` animation proves insufficient)
5. **Drag and drop photo reorder** — layout animations during reorder (via `@dnd-kit` + Framer `layout` prop)

**CSS-only animations (everything else):**
- Button hover/press effects
- Card hover lift + shadow deepening
- Nav item underline slide-in
- Avatar scale + copper ring on hover
- Skeleton loading pulse
- Breathing ambient gradient
- Modal appear/disappear (CSS `@starting-style`)
- Profile card image crossfade on hover
- Focus ring animations

**Rationale:**
- CSS animations are GPU-accelerated and zero-JS-cost
- `linear()` easing provides spring-like curves without JS
- Framer Motion adds ~30KB to bundle — only justified for orchestration
- Tree-shaking: only import `motion`, `AnimatePresence`, `LayoutGroup`

**Consequences:**
- Framer Motion imported only in 4-5 client components
- Dynamic import for CommandPalette and Toast container
- CSS `--spring` variable defined globally for consistent spring curves

---

## ADR-003: React Server Components Strategy

**Status:** Accepted
**Context:** Next.js 16 App Router defaults to Server Components. We need a clear boundary between server and client components to maximize performance.

**Decision:** Server Components by default, with explicit `'use client'` boundaries at the interactive island level.

**Server Components (RSC):**
- All page layouts (`page.tsx` files)
- Data-fetching wrappers (profile data, feed data, event lists)
- Navigation structure (Header shell, NavRail shell)
- Static content (landing page, learn articles, settings labels)
- SEO metadata generation

**Client Components ('use client'):**
- `DiscoverGrid.tsx` — hover states, keyboard navigation
- `ProfileCard.tsx` — hover image crossfade, like/pass actions
- `ChatRoom.tsx` — real-time messages, input, WebSocket
- `ConversationList.tsx` — unread badges, selection state
- `CommandPalette.tsx` — search input, keyboard navigation, results
- `ThemeSwitcher.tsx` — theme/mode toggle
- `ModeSwitchButton.tsx` — vanilla/spicy toggle
- `PhotoReorder.tsx` — drag and drop
- `FeedPost.tsx` — like/comment interactions
- `Modal.tsx`, `Toast.tsx` — interactive overlays
- `Header.tsx` (interactive parts) — notification bell, user menu
- `NavRail.tsx` (interactive parts) — active state, tooltips

**Pattern:** Server component wraps client component, passing serialized data as props.

```
// page.tsx (Server Component)
export default async function DiscoverPage() {
  const profiles = await getProfiles(); // server-side fetch
  return <DiscoverGrid initialProfiles={profiles} />;
}

// DiscoverGrid.tsx (Client Component)
'use client';
export function DiscoverGrid({ initialProfiles }) {
  const { data } = useProfileQuery({ initialData: initialProfiles });
  // ... interactive grid
}
```

**Consequences:**
- First load is mostly HTML — fast FCP/LCP
- Interactive JS loads after initial render
- Shared hooks (Zustand, TanStack Query) only used in client components
- Server components can directly call tRPC server-side via `createCaller`

---

## ADR-004: Image Optimization Strategy

**Status:** Accepted
**Context:** Profile photos are the heaviest content. Web must load them fast while maintaining quality on large screens.

**Decision:** Use Next.js `<Image>` component with custom loader pointing to the CDN.

**Configuration:**
- **Formats:** WebP primary, AVIF for browsers that support it, JPEG fallback
- **Sizes:**
  - Grid thumbnails: 300x400 (3:4 ratio)
  - Profile view: 600x800
  - Chat avatars: 48x48, 96x96 (2x)
  - Feed images: 720px max width
- **Loading:** `loading="lazy"` for below-fold, `priority` for first 8 grid items
- **Placeholder:** Blurhash embedded in profile data, rendered as CSS gradient during load
- **CDN:** Cloudflare Images with on-the-fly resizing

**Consequences:**
- Custom `imageLoader` in `next.config.ts` for CDN URL construction
- Blurhash values stored in profile API response
- `sizes` attribute on all images for responsive serving
- No layout shift — dimensions always known from API

---

## ADR-005: Font Loading Strategy

**Status:** Accepted
**Context:** Lustre uses General Sans (headings) and Inter (body). Both must load fast without FOUT/FOIT.

**Decision:** Use `next/font` with local font files.

**Implementation:**
```typescript
// app/layout.tsx
import localFont from 'next/font/local';

const generalSans = localFont({
  src: [
    { path: './fonts/GeneralSans-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/GeneralSans-Semibold.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-heading',
  display: 'swap',
  preload: true,
});

const inter = localFont({
  src: [
    { path: './fonts/Inter-Regular.woff2', weight: '400', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
  preload: true,
});
```

**Rationale:**
- `next/font/local` inlines font CSS and preloads WOFF2 — fastest possible font delivery
- No external font service requests (no Google Fonts latency)
- `font-display: swap` prevents invisible text
- CSS variables (`--font-heading`, `--font-body`) used in CSS Modules

**Consequences:**
- Font files stored in `apps/web/app/fonts/`
- Only Medium (500) and Semibold (600) weights for General Sans (no unused weights)
- Only Regular (400) for Inter
- Total font payload: ~80KB (4 WOFF2 files)

---

## ADR-006: State Management — Web-Specific Patterns

**Status:** Accepted
**Context:** Shared Zustand stores in `packages/hooks/` handle business logic (auth, user profile, matches). The web app needs additional UI state that's platform-specific.

**Decision:** Web-specific Zustand stores in `apps/web/hooks/` for UI-only state.

**Shared stores (packages/hooks/):**
- `useAuthStore` — auth tokens, user identity
- `useProfileStore` — current user profile
- `useMatchStore` — matches, likes, passes
- `useChatStore` — conversations, messages
- `useFeedStore` — feed posts
- `usePreferencesStore` — user preferences (mode, filters)

**Web-specific stores (apps/web/hooks/):**
- `useLayoutStore` — context panel open/closed, nav rail state, active panel content
- `useKeyboardStore` — active shortcuts context, command palette open/closed
- `useThemeStore` — light/dark theme (web-specific, mobile handles its own)
- `useDiscoverGridStore` — grid selection index, hover state, column count

**Pattern:** Web hooks compose shared hooks with web-specific state.

```typescript
// apps/web/hooks/useWebDiscover.ts
import { useMatchStore } from '@lustre/hooks';
import { useDiscoverGridStore } from './useDiscoverGridStore';

export function useWebDiscover() {
  const { profiles, like, pass } = useMatchStore();
  const { selectedIndex, setSelectedIndex } = useDiscoverGridStore();
  // Combine for web-specific behavior
}
```

**Consequences:**
- Clear separation: business logic shared, UI state platform-specific
- No UI imports in shared packages
- Web stores can be tested independently

---

## ADR-007: Real-Time Communication — Phoenix WebSocket

**Status:** Accepted
**Context:** Chat requires real-time message delivery. The backend uses Phoenix (Elixir) with Phoenix Channels over WebSocket.

**Decision:** Use Phoenix JS client (`phoenix` npm package) for WebSocket connection, wrapped in a TanStack Query-compatible hook in `packages/hooks/`.

**Implementation:**
- `packages/hooks/useChat.ts` manages Phoenix Channel subscriptions
- Messages arrive via WebSocket, update Zustand store
- TanStack Query handles initial message history fetch (HTTP)
- WebSocket handles live updates (new messages, typing indicators, read receipts)

**Web-specific:**
- Desktop notification via Notification API when window is not focused
- Badge count in browser tab title: `(3) Lustre`
- Sound via Web Audio API on new message

**Consequences:**
- Phoenix JS client (~8KB) included in shared bundle
- WebSocket connection managed in a client component high in the tree
- Reconnection logic handled by Phoenix client's built-in exponential backoff

---

## ADR-008: CSS Custom Properties for Theming

**Status:** Accepted
**Context:** Lustre has 4 theme variants (light_vanilla, light_spicy, dark_vanilla, dark_spicy). Theme switching must be smooth (600ms morph) and affect the entire page.

**Decision:** All themeable values as CSS custom properties on `:root`, switched via `data-theme` and `data-mode` attributes on `<html>`.

**Token structure:**
```css
:root {
  /* Base palette — constant */
  --color-copper: #B87333;
  --color-gold: #D4A843;
  --color-warm-white: #FDF8F3;
  --color-charcoal: #2C2421;
  --color-ember: #C85A3A;
  --color-sage: #7A9E7E;

  /* Semantic tokens — change per theme */
  --bg-primary: #FDF8F3;
  --bg-secondary: #FFFBF7;
  --bg-elevated: #FFFFFF;
  --text-primary: #2C2421;
  --text-secondary: #4A3F39;
  --text-muted: #8B7E74;
  --border-subtle: rgba(184, 115, 51, 0.08);
  --shadow-card: 0 1px 2px rgba(184, 115, 51, 0.06), 0 4px 8px rgba(184, 115, 51, 0.04), 0 12px 24px rgba(44, 36, 33, 0.03);

  /* Mode accent — changes with vanilla/spicy */
  --accent: #7A9E7E;
  --accent-glow: rgba(122, 158, 126, 0.15);

  /* Transitions */
  --theme-transition: 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

:root[data-theme="dark"] {
  --bg-primary: #1A1614;
  --bg-secondary: #231F1C;
  --bg-elevated: #2C2724;
  --text-primary: #FDF8F3;
  --text-secondary: #C4B8AD;
  --text-muted: #8B7E74;
  --border-subtle: rgba(212, 168, 67, 0.12);
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.1);
}

:root[data-mode="spicy"] {
  --accent: #C85A3A;
  --accent-glow: rgba(200, 90, 58, 0.15);
}
```

**Morph transition:**
```css
:root {
  transition:
    --bg-primary var(--theme-transition),
    --bg-secondary var(--theme-transition),
    --text-primary var(--theme-transition),
    --accent var(--theme-transition),
    --accent-glow var(--theme-transition);
}
```

Note: CSS `@property` registration needed for custom property transitions in browsers that support it.

**Consequences:**
- Theme switch is zero-JS after initial attribute change — CSS handles all transitions
- All components reference semantic tokens, never raw colors
- Dark mode respects `prefers-color-scheme` as default, user can override
- Mode (vanilla/spicy) is user preference, persisted in shared preferences store

---

## ADR-009: Sound Design — Web Audio API

**Status:** Accepted
**Context:** Mobile app uses expo-av for sound effects. Web needs equivalent audio feedback using web APIs.

**Decision:** Web Audio API with a custom `SoundManager` singleton.

**Implementation:**
```typescript
// apps/web/lib/sound-manager.ts
class SoundManager {
  private context: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();

  async init() {
    this.context = new AudioContext();
    // Preload common sounds
    await this.load('like', '/sounds/like.mp3');
    await this.load('match', '/sounds/match.mp3');
    await this.load('message', '/sounds/message.mp3');
    await this.load('send', '/sounds/send.mp3');
  }

  play(name: string, volume = 0.5) {
    if (!this.context || !this.buffers.has(name)) return;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = this.buffers.get(name)!;
    gain.gain.value = volume;
    source.connect(gain).connect(this.context.destination);
    source.start();
  }
}
```

**Sounds:**
- `like.mp3` — soft copper chime (~2KB)
- `match.mp3` — warm celebration (~5KB)
- `message.mp3` — subtle notification (~2KB)
- `send.mp3` — whoosh (~2KB)

**Constraints:**
- AudioContext requires user interaction to start (browser policy) — init on first click
- Respect user's sound preference setting
- Total sound assets <15KB

**Consequences:**
- SoundManager initialized lazily on first user interaction
- Sounds disabled by default, user opts in via settings
- No dependency on any audio library

---

## ADR-010: Testing Strategy

**Status:** Accepted
**Context:** Mobile app uses DroidRun/Maestro for E2E testing. Web needs its own testing approach.

**Decision:** Playwright for E2E, Lighthouse CI for performance, axe-core for accessibility.

**Layers:**
1. **Unit tests:** Vitest for shared hooks and utilities
2. **Component tests:** Vitest + Testing Library for isolated component behavior
3. **E2E tests:** Playwright for full user flows across Chrome, Firefox, Safari
4. **Performance:** Lighthouse CI in GitHub Actions, fail build if score <90
5. **Accessibility:** axe-core integrated in Playwright tests, fail on any critical violation
6. **Visual regression:** Playwright screenshot comparison for key pages at all breakpoints

**Responsive testing breakpoints:**
- 1440px (full desktop)
- 1200px (compact desktop)
- 900px (tablet)
- 600px (mobile landscape)
- 375px (mobile portrait)

**Consequences:**
- Playwright config targets 3 browsers
- CI runs Lighthouse on every PR
- Accessibility audits run automatically in E2E tests
- Screenshot baselines stored in repo for visual regression
