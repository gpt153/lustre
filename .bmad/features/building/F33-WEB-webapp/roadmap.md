# Roadmap: F33 — Lustre Web App (Next.js)

**Feature ID:** F33-WEB
**Created:** 2026-03-27
**Total Duration:** 8 weeks (3 waves)

---

## CHECKPOINT FILE

This file tracks wave completion and approval status.

### Wave Status

| Wave | Name | Weeks | Status | Approved |
|------|------|-------|--------|----------|
| 1 | Design Foundation | 1-2 | IN_PROGRESS (2026-03-27) | - |
| 2 | Core Pages | 3-5 | NOT STARTED | - |
| 3 | Secondary Pages & Polish | 6-8 | NOT STARTED | - |

---

## Wave 1: Design Foundation (Weeks 1-2)

**Goal:** Build the core design system, layout infrastructure, and interaction framework for the web app. After this wave, the shell is fully functional with responsive layout, keyboard shortcuts, and all base components styled.

### Epics

| Epic | Name | Size | Depends On |
|------|------|------|------------|
| 1a | CSS Design Tokens & Typography | haiku | - |
| 1b | Three-Zone Layout | haiku | 1a |
| 1c | Core Components | haiku | 1a |
| 1d | Skeleton Loaders & Empty States | haiku | 1a, 1c |
| 1e | Keyboard Shortcuts & Command Palette | haiku | 1b |
| 1f | Responsive Breakpoints & Mobile Fallback | haiku | 1b |

### Wave 1 Checkpoint Criteria
- [ ] All 4 theme variants render correctly (light/dark x vanilla/spicy)
- [ ] Three-zone layout displays at all breakpoints (1440, 1200, 900, 600, 375px)
- [ ] All core components (Card, Button, Input, Modal, Toast) match design spec
- [ ] Keyboard shortcuts functional (Ctrl+K, 1-5 tabs, Escape)
- [ ] Lighthouse score >90 on empty shell
- [ ] axe-core reports 0 critical accessibility violations
- [ ] CSS spring animation (`--spring` variable) renders smoothly at 60fps

### Wave 1 Deliverables
- Next.js 16 project scaffolded in `apps/web/`
- CSS custom properties for all design tokens
- Responsive three-zone layout with glassmorphism header
- 6 core components with all theme variants
- Keyboard shortcut system with command palette
- Skeleton and empty state components
- Playwright tests for layout and responsiveness

---

## Wave 2: Core Pages (Weeks 3-5)

**Goal:** Build the main user-facing pages with web-optimized UX. Discover, Chat, Profile, Feed, and Auth flows are all functional with real data from shared hooks.

### Epics

| Epic | Name | Size | Depends On |
|------|------|------|------------|
| 2a | Discover Grid | haiku | 1a-1f |
| 2b | Chat Two-Column Layout | haiku | 1a-1f |
| 2c | Profile View & Edit | haiku | 1a-1f |
| 2d | Feed Page | haiku | 1a-1f |
| 2e | Mode Switch (Vanilla/Spicy) | haiku | 1a |
| 2f | Landing Page & Auth Flows | haiku | 1a, 1c |

### Wave 2 Checkpoint Criteria
- [ ] Discover grid shows profiles with hover preview (2nd image crossfade)
- [ ] Keyboard navigation works in discover (arrow keys, L/P/S, Enter)
- [ ] Chat two-column layout: conversation list + active chat visible simultaneously
- [ ] Real-time messages via Phoenix WebSocket
- [ ] Profile scroll view with sticky header
- [ ] Profile edit with drag-and-drop photo reordering
- [ ] Feed infinite scroll with post cards
- [ ] Vanilla/spicy mode switch with 600ms CSS morph
- [ ] Landing page scores >95 Lighthouse performance
- [ ] Auth flows (login, register, forgot password) functional
- [ ] All pages work at all responsive breakpoints

### Wave 2 Deliverables
- Discover page with grid layout and hover previews
- Chat page with two-column persistent layout
- Profile view (scroll) and profile edit (drag & drop)
- Feed page with infinite scroll
- Mode switch with CSS morph transition
- Landing page (SSG) and auth flows
- Playwright E2E tests for all core flows

---

## Wave 3: Secondary Pages & Polish (Weeks 6-8)

**Goal:** Complete all remaining pages, implement warm UI polish, add sound design, and build "open in app" prompts for app-only features.

### Epics

| Epic | Name | Size | Depends On |
|------|------|------|------------|
| 3a | Events, Groups, Organizations | haiku | 2a-2f |
| 3b | Learn, Coach, Achievements | haiku | 2a-2f |
| 3c | Marketplace | haiku | 2a-2f |
| 3d | Settings Panel | haiku | 2a-2f |
| 3e | Warm UI Polish | haiku | 2a-2f |
| 3f | App-Only Prompts | haiku | 2a-2f |

### Wave 3 Checkpoint Criteria
- [ ] Events, groups, organizations pages render with correct layouts
- [ ] Learn modules display with progress tracking
- [ ] Coach text-mode sessions functional
- [ ] Marketplace browse/purchase flow works
- [ ] Settings panel covers all user preferences
- [ ] Warm UI polish: paper grain texture, breathing gradient, ambient copper glow
- [ ] Sound effects play on like, match, message (Web Audio API)
- [ ] "Öppna i appen" prompts display for ConsentVault, SafeDate, spicy MEDIUM/HIGH, calls
- [ ] All pages pass Lighthouse >95
- [ ] All pages pass axe-core accessibility audit
- [ ] Cross-browser testing passes (Chrome, Firefox, Safari, Edge)
- [ ] Total first-load JS <200KB

### Wave 3 Deliverables
- Events, groups, organizations pages
- Learn modules, coach (text), achievements
- Marketplace with P2P + business shops
- Unified settings panel
- Warm UI polish (textures, sounds, micro-interactions)
- App-only feature prompts
- Final Playwright suite, Lighthouse CI, accessibility audit

---

## Dependency Graph

```
Wave 1:  1a ──┬── 1b ──┬── 1e
              │        └── 1f
              ├── 1c ──┬── 1d
              │        │
Wave 2:       └────────┴── 2a, 2b, 2c, 2d
         1a ────────────── 2e, 2f

Wave 3:  All Wave 2 ────── 3a, 3b, 3c, 3d, 3e, 3f
```

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| CSS `@property` animation not supported in all browsers | Medium | Low | Fallback to instant switch, progressive enhancement |
| Shared hooks API changes break web | Medium | High | Pin shared package versions, integration tests |
| Lighthouse <95 with rich UI | Medium | Medium | Performance budget per component, lazy loading |
| Phoenix WebSocket reconnection issues | Low | High | Built-in Phoenix client reconnection + UI indicator |
| Font loading FOUT on slow connections | Low | Low | `font-display: swap` + preload critical weights |

## Notes

- Each wave must pass its checkpoint criteria before proceeding to the next
- Epics are sized for haiku/flash model execution unless otherwise noted
- All epics respect SV2 constraints: max 10 acceptance criteria, max 8 file_paths
- No React Native, Expo, Reanimated, or Gesture Handler in any web code
