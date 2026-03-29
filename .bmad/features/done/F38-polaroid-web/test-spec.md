# Test Spec: F38 — Polaroid Design System for Web (Next.js)

## Testing Strategy

Primarily visual/CSS feature. Testing: unit tests (Vitest + Testing Library), visual verification (screenshots with real data), interaction tests (keyboard, hover), accessibility, cross-browser.

ALL visual tests MUST use real seed data (20 profiles from `services/api/prisma/seed-dev-users.ts`). Empty/loading states NEVER valid.

---

## T1: PolaroidCard Unit Tests (`apps/web/components/common/__tests__/PolaroidCard.test.tsx`)

1. Renders image with correct src and alt
2. Renders caption text
3. Applies rotation via `--polaroid-rotation` CSS property
4. Applies `.stack` class when stack=true
5. No caption element when caption undefined
6. Children render inside card
7. Card has `aspect-ratio: 88 / 107`
8. onClick fires on click

## T2: PolaroidMasonryGrid Unit Tests (`apps/web/components/common/__tests__/PolaroidMasonryGrid.test.tsx`)

1. Renders all children
2. Wraps each child in `.item` container
3. Applies custom className

## T3: Visual Proportion Verification

### T3.1: PolaroidCard at 280px width

| Rule | Expected | Method | Tolerance | PASS/FAIL |
|---|---|---|---|---|
| Card aspect 88:107 | height = 340.45px | DevTools | ±2px | |
| Image aspect 79:77 | h=243.5px at w=251.4px | DevTools | ±2px | |
| Side border 5.11% | 14.3px | computed padding | ±1px | |
| Top border 7.39% | 20.7px | computed padding | ±1px | |
| Bottom border 26.70% | 74.8px | distance | ±3px | |
| Background | rgb(255,255,255) | computed | exact | |
| Caption font | "Caveat" | computed font-family | starts with | |
| Shadow | rgba(0,0,0,0.18) | computed | visual | |

### T3.2: Screen-Level Checks

**Screen: /discover/browse (1440px)**
| Rule | What to verify | PASS/FAIL |
|---|---|---|
| White Polaroid frames | Every profile has white border | |
| Varied rotation | Cards tilted differently | |
| Near-square image | Not tall rectangles | |
| Caveat captions | Handwritten name+age | |
| Actions ON Polaroid | Buttons on card | |
| 4-column masonry | 4 staggered columns | |
| Stack on featured | Peeking edges behind | |

**Screen: /discover/browse (600px)**
| Rule | What to verify | PASS/FAIL |
|---|---|---|
| Single column | One Polaroid per row | |
| Proportions preserved | White frame correct | |

**Screen: /feed (photo posts)**
| Rule | What to verify | PASS/FAIL |
|---|---|---|
| Polaroid frames | White frame around photos | |
| Text-only unchanged | No frame on text posts | |
| Caveat caption | Handwritten font | |

**Screen: /chat (image messages)**
| Rule | What to verify | PASS/FAIL |
|---|---|---|
| Polaroid frames | White frame on photos | |
| Slight rotation | Message tilted 2-4° | |
| Timestamp visible | Time below Polaroid | |

**Screen: /profile/[userId]**
| Rule | What to verify | PASS/FAIL |
|---|---|---|
| Scattered gallery | Varied angles | |
| Primary stack | First photo + peeking | |
| Lightbox works | Click opens full-size | |

**Screen: Match modal**
| Rule | What to verify | PASS/FAIL |
|---|---|---|
| Polaroid frames | Rectangular (not circles) | |
| ±10° rotation | Opposite directions | |
| Overlapping | Center overlap visible | |
| Caveat names | Handwritten captions | |

## T4: Interaction Tests

### T4.1: Hover
1. Discover: hover → straighten 0°, lift, shadow increase
2. Feed: hover → subtle lift
3. Profile: hover → straighten, lift
4. Spring transitions (not linear)

### T4.2: Keyboard
1. Discover: arrow keys move focus
2. Discover: L/P keys like/pass
3. Profile: Tab between gallery photos
4. Match: Escape closes modal
5. Focus ring: copper 2px solid

### T4.3: Reduced Motion
1. Rotations still applied (static)
2. Hover transitions instant (0ms)
3. No spring entrance animations

## T5: Regression Tests

### Discovery
1. Same profile count rendered
2. Like/pass buttons fire correctly
3. SparkButton still works
4. Empty state renders
5. Loading skeleton renders

### Feed
1. Infinite scroll works
2. Like mutation works
3. FeedAdCard at position 5 (no Polaroid)
4. PostComposer works

### Chat
1. Text messages send/appear
2. Auto-scroll on new messages
3. Typing indicator renders

### Profile
1. Photo upload works
2. Drag and drop works
3. Lightbox arrow navigation
4. All 6 slots render

## T6: Cross-Browser
- [ ] Chrome 120+
- [ ] Firefox 120+
- [ ] Safari 17+
- [ ] Mobile Safari (iOS 17+)
- [ ] Chrome Android

Key CSS: aspect-ratio, custom properties, ::before/::after, CSS columns, break-inside: avoid.

## T7: Performance
1. No CLS from Caveat font (display: swap)
2. PolaroidCard as Server Component (no 'use client')
3. Images lazy-loaded except first visible
4. 20-card masonry scrolls at 60fps
5. No JS bundle increase from CSS Module

## Blocking Rule
Every wave: screenshots with real seed data. ALL visual items PASS. `pnpm build` succeeds.
