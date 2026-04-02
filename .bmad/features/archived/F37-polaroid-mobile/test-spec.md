# Test Spec: F37 — Polaroid Design System for Mobile

## Test Infrastructure
- **Unit tests:** Vitest
- **Component tests:** React Native Testing Library
- **Visual verification:** On-device screenshots with real seed data (20 profiles from `services/api/prisma/seed-dev-users.ts`)
- **Performance:** React Native Perf Monitor — confirm <16ms render

## Seed Data Requirement
ALL visual tests MUST use real data. Run `npx prisma db seed`. Empty screens/spinners/placeholders are NEVER valid.

---

## Wave 1: Foundation

### T1.1: Token Snapshot Tests (`packages/tokens/__tests__/polaroid.test.ts`)
1. `POLAROID.CARD_ASPECT` → toBeCloseTo(0.8224, 3)
2. `POLAROID.IMAGE_ASPECT` → toBeCloseTo(1.026, 2)
3. `POLAROID.BORDER_SIDE` → toBe(0.0511)
4. `POLAROID.BORDER_TOP` → toBe(0.0739)
5. `POLAROID.BORDER_BOTTOM` → toBe(0.2670)
6. `POLAROID.IMAGE_WIDTH_RATIO` → toBe(0.8977)
7. `getPolaroidDimensions(300)` → cardHeight ~365, imageWidth ~269, borderBottom ~80
8. No runtime dependencies
9. Full snapshot for regression

### T1.2: Font Loading (`packages/ui/src/fonts/__tests__/expo-loader.test.ts`)
1. `loadLustreFonts` calls `Font.loadAsync` with `Caveat_400Regular` and `Caveat_700Bold`

### T1.3: PolaroidCard (`packages/ui/src/__tests__/PolaroidCard.test.tsx`)
1. Renders image with source
2. Renders caption text
3. Caption has `numberOfLines={1}`
4. Caption uses `fontFamily: 'Caveat_400Regular'`
5. Rotation=3 → transform includes `rotate: '3deg'`
6. No rotation → 0deg or absent
7. accessibilityLabel set on outer view
8. Children render in overlay
9. White background #FFFFFF

### T1.4: PolaroidStack (`packages/ui/src/__tests__/PolaroidStack.test.tsx`)
1. 3 images → 3 PolaroidCard instances
2. Front card highest zIndex
3. Behind cards have non-zero rotation

### T1.5: Visual Verification (Manual)

| # | Rule | Expected | PASS/FAIL |
|---|---|---|---|
| V1.1 | Card aspect 88:107 | Ratio = 1.216 ±0.02 | |
| V1.2 | Image 79:77 | Ratio = 0.975 ±0.02 | |
| V1.3 | Side border 5.11% | 0.051 ±0.01 | |
| V1.4 | Top border 7.39% | 0.074 ±0.01 | |
| V1.5 | Bottom border 26.70% | 0.267 ±0.02 | |
| V1.6 | Bottom 5.22x sides | Clearly ~5x | |
| V1.7 | White background | #FFFFFF | |
| V1.8 | Shadow visible | Soft, not harsh | |
| V1.9 | Caveat caption | Handwritten cursive | |
| V1.10 | Stack peeking | 2 edges visible | |

---

## Wave 2: Discovery

### T2.1: Functional Tests (`apps/mobile/__tests__/discover-polaroid.test.tsx`)
1. Profile renders as PolaroidCard (not SwipeCard)
2. Caption contains "Emma, 28"
3. Swipe right calls like
4. Swipe left calls pass
5. Tap right → next segment
6. Action buttons within PolaroidCard bounds
7. Empty state unchanged

### T2.2: Gesture Regression (Manual)
1. Pan right → like
2. Pan left → pass
3. Tap right → next segment
4. Tap left → prev segment
5. Long press → Ken Burns pause
6. Release → resume
7. Quick successive taps — no double-fire

### T2.3: Visual Verification

| # | Rule | Expected | PASS/FAIL |
|---|---|---|---|
| V2.1 | Card aspect 88:107 | 1.216 ±0.02 | |
| V2.2 | Image near-square | 0.975 ±0.02 | |
| V2.3 | Bottom border 26.70% | Wide white strip | |
| V2.4 | Caveat caption | Handwritten name+age | |
| V2.5 | Buttons ON card | Within Polaroid bounds | |
| V2.6 | Progress bar inside | Inside image area | |
| V2.7 | Prev/next peek | Visible at rotation | |
| V2.8 | Shadow present | Soft charcoal | |
| V2.9 | Real photo loaded | Celebrity photo visible | |
| V2.10 | Prompt in frame | Inside image area | |

---

## Wave 3: Feed + Chat

### T3.1: Feed Tests (`packages/app/src/components/__tests__/PostImageGallery.test.tsx`)
1. Single photo → PolaroidCard renders
2. 3 photos → 3 PolaroidCards in ScrollView
3. Rotation varies per card
4. Caption shows post text

### T3.2: Chat Tests (`packages/app/src/screens/__tests__/ChatRoomScreen.test.tsx`)
1. IMAGE message → PolaroidCard renders
2. PolaroidCard width ≤ 220
3. TEXT message → no PolaroidCard

### T3.3: Performance
1. Feed scroll 10+ posts — no dropped frames
2. Chat scroll 5+ photos — no dropped frames

### T3.4: Visual Verification

| # | Rule | Expected | PASS/FAIL |
|---|---|---|---|
| V3.1 | Feed photo in Polaroid | White frame | |
| V3.2 | Feed aspect 88:107 | Correct at 280px | |
| V3.3 | Scattered rotation | Different angles | |
| V3.4 | Feed actions ON card | On/near strip | |
| V3.5 | Feed caption | One line, Caveat | |
| V3.6 | Chat in Polaroid | White frame | |
| V3.7 | Chat fits bubble | ≤220px | |
| V3.8 | Chat caption | Below photo | |

---

## Wave 4: Profile + Match

### T4.1: Profile Tests (`packages/app/src/components/__tests__/PhotoGallery.test.tsx`)
1. Photos → PolaroidStack renders
2. Editable → delete overlay exists
3. <10 photos + editable → empty Polaroid with "+"

### T4.2: Match Tests (`apps/mobile/components/__tests__/MatchCeremony.test.tsx`)
1. visible=true → 2 PolaroidCard instances
2. Rotation -8 and +8
3. Captions show names
4. Send message + continue buttons exist

### T4.3: Visual Verification

| # | Rule | Expected | PASS/FAIL |
|---|---|---|---|
| V4.1 | Profile stack | Front + 1-2 peeking | |
| V4.2 | Profile aspect | 88:107 | |
| V4.3 | Profile swipe | Next photo springs | |
| V4.4 | Profile caption | Caveat font | |
| V4.5 | Match two cards | Overlapping center | |
| V4.6 | Match ±8° | Visually angled | |
| V4.7 | Match names | Caveat, one line | |
| V4.8 | Match animation | Spring from sides | |
| V4.9 | Particles | Behind cards | |
| V4.10 | Edit mode | Delete + upload work | |

---

## Blocking Rule
Every wave: screenshots on real device with seed data loaded. ALL visual items PASS. `pnpm build` succeeds. No regression in gestures/interactions.
