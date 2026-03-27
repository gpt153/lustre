# PRD: F33 — Lustre Web App (Next.js)

**Feature ID:** F33-WEB
**Status:** Planned
**Owner:** Samuel
**Created:** 2026-03-27
**Dependencies:** F01 (Backend API), F02 (Auth), F32 (shares packages/hooks, packages/api, packages/tokens)

---

## 1. Problem Statement

Lustre's mobile app (F32) delivers the core dating experience with native gestures, haptics, and swipe interactions. However, a significant user segment wants to engage with Lustre from their desktop — writing longer messages, multitasking between chat and discovery, managing their profile with drag-and-drop convenience, and exploring events/groups with full keyboard/mouse productivity.

Without a web app, Lustre loses engagement from users who sit at their computers during work breaks, evenings at home, or any time a phone isn't their primary device. Competitors (Tinder, Hinge, Bumble) all offer web companions.

## 2. Vision

The Lustre Web App is a **companion experience**, not "mobile in a browser." It leverages desktop affordances — keyboard shortcuts, hover states, multi-panel layouts, drag-and-drop — to create a premium experience that feels native to the web platform while maintaining Lustre's warm, copper-toned design language.

## 3. Target Users

### Primary
- Existing Lustre mobile users who want to continue conversations and browse from desktop
- Users who prefer typing on a physical keyboard for longer messages
- Power users who want keyboard shortcuts and multi-panel views

### Secondary
- New users discovering Lustre via web search (SEO-driven acquisition)
- Admin/moderator users who need desktop tooling
- Business users managing marketplace shops or ad campaigns

## 4. User Stories

### Discovery
- **US-W01:** As a user, I can browse profiles in a grid layout with hover previews so I can evaluate matches faster than swiping one-by-one.
- **US-W02:** As a user, I can use keyboard shortcuts (L to like, P to pass, arrow keys to navigate) so I can discover profiles without touching the mouse.
- **US-W03:** As a user, I can click a profile card to open it in the context panel without leaving the grid, so I can keep browsing while reviewing a profile.

### Chat
- **US-W04:** As a user, I can see my conversation list and active chat simultaneously in a two-column layout, so I can switch between conversations instantly.
- **US-W05:** As a user, I can type messages with Enter to send and Shift+Enter for newline, matching standard desktop messaging conventions.
- **US-W06:** As a user, I can use Escape to close modals and panels, maintaining keyboard-centric workflow.

### Profile
- **US-W07:** As a user, I can drag and drop photos to reorder them in profile edit, using standard desktop interaction patterns.
- **US-W08:** As a user, I can scroll through a profile with a sticky header showing name/age, rather than tapping through story-format cards.

### Navigation
- **US-W09:** As a user, I can press Ctrl+K to open a command palette and search for profiles, conversations, events, or settings from anywhere.
- **US-W10:** As a user, I can use number keys (1-5) to switch between main tabs instantly.

### Content Policy
- **US-W11:** As a user trying to access ConsentVault on web, I see an "Öppna i appen" prompt explaining why this feature requires the mobile app.
- **US-W12:** As a user trying to access spicy content with nudity MEDIUM/HIGH, I see a tasteful "Öppna i appen" prompt directing me to download the app.
- **US-W13:** As a user trying to initiate SafeDate or video calls, I see an "Öppna i appen" prompt explaining mobile-only requirement.

### Responsive
- **US-W14:** As a user on a tablet or small laptop, the layout gracefully degrades from three-zone to two-zone to single-column.
- **US-W15:** As a mobile browser user, I get a simplified single-column experience with a bottom navigation bar.

### Performance
- **US-W16:** As a user, the web app loads in under 2.5 seconds (LCP) and feels instant when navigating between pages.
- **US-W17:** As a user, pages that don't need interactivity load as server-rendered HTML for maximum speed.

### Theming
- **US-W18:** As a user, I can switch between vanilla and spicy mode and see the entire page smoothly morph colors, shadows, and glows over 600ms.
- **US-W19:** As a user, I can switch between light and dark theme, with the dark theme using warm dark backgrounds (#1A1614) rather than cold black.

## 5. Content Policy

### Available on Web
| Content Type | Details |
|---|---|
| Profile photos | Only photos marked "public" by the user |
| Feed posts | SFW/vanilla-filtered content |
| Chat messages | Text + shared images |
| Coach sessions | Text mode only (no voice) |
| Events, groups, organizations | Full access |
| Marketplace | Full browse + purchase |
| Gamification | Achievements, streaks, badges |
| Profile editing | Full edit with drag-and-drop photos |
| Discover | Grid format with hover previews |
| Settings | Full settings access |

### App-Only (blocked on web with "Öppna i appen" prompt)
| Feature | Reason |
|---|---|
| ConsentVault | No screenshot prevention on desktop |
| Spicy content (nudity MEDIUM/HIGH) | No screenshot protection |
| SafeDate GPS tracking | Requires mobile GPS |
| Voice/video calls | App-only UX decision |
| Push notifications | Use badge count + email instead |

## 6. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Lighthouse Performance | >95 | Lighthouse CI in pipeline |
| First Contentful Paint | <1.2s | Web Vitals |
| Largest Contentful Paint | <2.5s | Web Vitals |
| Cumulative Layout Shift | <0.1 | Web Vitals |
| First Load JS Bundle | <200KB | Bundle analyzer |
| Web DAU / Mobile DAU | >15% | Analytics |
| Avg session duration (web) | >8 min | Analytics |
| Messages sent from web | >20% of total | Analytics |
| App download conversion from web | >5% of web users | Deep link tracking |
| Accessibility score | >95 | axe-core audit |
| Cross-browser compat | 0 P1 bugs | Manual + Playwright |

## 7. Non-Functional Requirements

### Performance
- React Server Components for all data-fetching pages
- Static generation for landing pages
- Image optimization via Next.js Image component with WebP/AVIF
- Font loading: General Sans + Inter with `font-display: swap` and preload
- Code splitting per route with dynamic imports for heavy components (command palette, drag-and-drop)

### Accessibility
- WCAG 2.1 AA compliance
- Full keyboard navigation for all interactive elements
- Screen reader support with proper ARIA labels
- Focus management for modals, panels, and route transitions
- Reduced motion support: `prefers-reduced-motion` disables all animations

### Security
- CSP headers preventing XSS
- Sanitized user content (chat messages, profile text)
- HttpOnly cookies for auth tokens
- No sensitive data in URL parameters

### SEO
- Server-rendered landing page with structured data
- Open Graph tags for shared profiles/events
- Sitemap generation for public pages
- Robots.txt excluding authenticated routes

## 8. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16, App Router |
| Rendering | React Server Components + Client Components |
| Language | TypeScript |
| Styling | CSS Modules (see ADR) |
| Animation | CSS `linear()` easing + Framer Motion (orchestrated only) |
| Sound | Web Audio API |
| State (shared) | Zustand (packages/hooks/) |
| Data fetching (shared) | TanStack Query (packages/hooks/) |
| API client (shared) | tRPC (packages/api/) |
| Design tokens (shared) | TS constants (packages/tokens/) |
| Icons | Phosphor Icons (phosphor-react) |
| Testing | Playwright, Lighthouse CI, axe-core |

## 9. Architecture Overview

### Shared Packages (with F32 mobile)
```
packages/
  hooks/     → Zustand stores, TanStack Query hooks (business logic, NO UI)
  api/       → tRPC client, Zod schemas
  tokens/    → Design token values as plain TS constants
```

### Web-Only Code
```
apps/web/
  app/                → Next.js App Router
    (landing)/        → Public landing page (SSG)
    (auth)/           → Login, register, forgot password
    (app)/            → Authenticated routes
      discover/       → Grid discovery
      chat/           → Two-column chat
      profile/        → Profile view + edit
      feed/           → Social feed
      events/         → Events listing + detail
      groups/         → Groups
      learn/          → Educational content + coach
      marketplace/    → P2P + business shops
      settings/       → Unified settings panel
  components/         → Web-specific React components
  hooks/              → Web-specific hooks
  styles/             → CSS modules, global styles, tokens as CSS vars
  lib/                → Utilities, sound manager, notification manager
  public/             → Static assets
```

### RSC Strategy
- **Server Components (default):** All page layouts, data-fetching wrappers, static content
- **Client Components ('use client'):** Interactive elements — buttons, inputs, chat messages, discover grid cards (hover state), modals, command palette, theme switcher
- Boundary: Each interactive island is a client component embedded in a server component shell

## 10. Layout: Three-Zone Architecture

```
┌─────────────────────────────────────────────────────┐
│  HEADER (glassmorphism, sticky, 64px)               │
│  Logo    Discover  Connect  Explore  Learn    🔔 👤 │
├────────┬────────────────────────────┬───────────────┤
│        │                            │               │
│  NAV   │      MAIN CONTENT          │   CONTEXT     │
│  RAIL  │      (max 720px)           │   PANEL       │
│  72px  │                            │   320px       │
│        │                            │               │
│  Icons │   Page content here        │  Previews,    │
│  with  │                            │  filters,     │
│  tips  │                            │  chat sidebar │
│        │                            │               │
└────────┴────────────────────────────┴───────────────┘
```

### Responsive Breakpoints
| Breakpoint | Layout |
|---|---|
| >1440px | Full three-zone (rail 72px + content max 720px + context 320px) |
| 1200-1440px | Three-zone, narrower context panel |
| 900-1200px | Two-zone (rail + content), context panel hidden |
| 600-900px | Bottom nav replaces rail, single column |
| <600px | Mobile browser, single column, simplified |

## 11. Out of Scope

- Native mobile features (handled by F32)
- Voice/video calling on web
- ConsentVault on web
- SafeDate GPS tracking on web
- Spicy content with nudity level MEDIUM/HIGH on web
- Push notifications (use badge count + email)
- Offline mode (web requires connectivity)
- PWA/installable app (future consideration)

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Bundle size exceeding 200KB | Slow first load | Aggressive code splitting, RSC, dynamic imports |
| CSS complexity across 4 themes | Maintenance burden | CSS custom properties for all theme values |
| Shared packages diverging | Breaking mobile | Strict interface contracts, shared CI |
| Screenshot concerns for sensitive content | Privacy violation | Block sensitive content on web entirely |
| SEO vs SPA trade-off | Poor discoverability | RSC + SSG for public pages, SPA feel for app |
