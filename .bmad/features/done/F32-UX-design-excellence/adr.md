# F32 — UX Design Excellence (Native Mobile)
## Architecture Decision Records

---

## ADR-001: Spacing System — Design Token Constants (No Tamagui)

**Status:** Accepted
**Date:** 2026-03-27
**Updated:** 2026-03-27 (rewritten for native-only)

### Context
Current spacing is arbitrary. Components use inconsistent padding/margins, creating visual noise. Need a predictable, named scale as plain TypeScript constants consumed by StyleSheet.create.

### Decision
Adopt a **semantic spacing scale** as TS constants in `packages/tokens/spacing.ts`, consumed via `apps/mobile/constants/tokens.ts`:

```typescript
// packages/tokens/spacing.ts
export const SPACING = {
  xs:  4,    // Tight inline gaps (icon-to-label)
  sm:  8,    // Compact spacing (list item padding)
  md:  16,   // Standard spacing (card padding, section gaps)
  lg:  24,   // Generous spacing (between sections)
  xl:  32,   // Large spacing (screen padding, major sections)
  xxl: 48,   // Extra large (hero spacing, modal padding)
} as const
```

Base unit: **8px grid** (sm). All values are multiples of 4 (allowing xs half-step).

### Implementation
- Define in `packages/tokens/spacing.ts` (shared plain TS constants)
- Import in `apps/mobile/constants/tokens.ts` for re-export
- Use in StyleSheet.create: `padding: SPACING.md`
- Migrate all mobile screens incrementally
- No Tamagui dependency for spacing

### Consequences
- (+) Zero runtime cost — plain constants inlined by Hermes
- (+) No Tamagui dependency for design tokens
- (+) Works with StyleSheet.create, inline styles, and Reanimated animated styles
- (-) Migration touches every screen file — high diff count but low risk per change

---

## ADR-002: Icon Library — phosphor-react-native Only

**Status:** Accepted
**Date:** 2026-03-27
**Updated:** 2026-03-27 (rewritten for native-only)

### Context
Need a single, comprehensive icon set for the native app. No web variant needed.

### Decision
Use **phosphor-react-native** exclusively. No phosphor-react (web) package.

- Default weight: **Regular** (1.5px stroke)
- Active/selected states: **Fill** weight
- Tab bar: Fill weight with copper tint (#B87333)
- Size scale: 16px (inline), 20px (default), 24px (prominent), 32px (hero)

### Implementation
- Install `phosphor-react-native` only
- Tree-shake via direct imports: `import { Heart } from 'phosphor-react-native'`
- Create size/weight helper in `apps/mobile/components/LustreIcon.tsx`
- Remove all @expo/vector-icons imports

### Consequences
- (+) Single package, no platform branching
- (+) Tree-shakeable — only ships icons actually used (~30KB for ~80 icons)
- (+) Fill/Regular toggle gives "active" state for free
- (+) Warm, rounded aesthetic matches copper brand

---

## ADR-003: Skeleton Loader — Reanimated 3 Shimmer Only

**Status:** Accepted
**Date:** 2026-03-27
**Updated:** 2026-03-27 (rewritten for native-only)

### Context
All loading states currently show generic `<ActivityIndicator>` spinners. Need skeleton loaders with shimmer running entirely on UI thread.

### Decision
Build **custom skeleton components** using React Native Views + Reanimated 3 for shimmer animation. No Tamagui styled(). No CSS fallback.

Architecture:
```
<SkeletonGroup>           // Wraps content, shows skeletons when loading
  <Skeleton.Box />        // Rectangular placeholder (cards, images)
  <Skeleton.Text />       // Text line placeholder (configurable lines)
  <Skeleton.Circle />     // Avatar/icon placeholder
</SkeletonGroup>
```

Shimmer implementation:
- Reanimated `useSharedValue` drives translateX of a LinearGradient overlay
- Gradient: warmWhite (#FDF8F3) to copper at 10% opacity to warmWhite
- 1.5s cycle, `withRepeat(withTiming(...), -1)` on UI thread
- MaskedView clips shimmer to skeleton shape
- expo-linear-gradient for the shimmer gradient

Reduced motion: static warm gray fill (#E8DDD3), no animation.

### Implementation
- Components in `apps/mobile/components/Skeleton.tsx`
- `apps/mobile/hooks/useSkeletonTransition.ts` for crossfade
- Per-screen skeleton layouts co-located with screens

### Consequences
- (+) 100% UI thread — zero JS thread involvement
- (+) Copper-tinted shimmer reinforces brand on native
- (+) Zero layout shift (skeleton matches content dimensions)
- (-) Each screen needs its own skeleton layout — more work but better UX

---

## ADR-004: Toast System — Zustand + Reanimated + Gesture Handler

**Status:** Accepted
**Date:** 2026-03-27
**Updated:** 2026-03-27 (rewritten for native-only)

### Context
No notification/feedback system exists. Need a toast system that is accessible, stackable, and brand-consistent on native.

### Decision
Build **custom toast system** using:
- **Zustand store** for toast state (callable from anywhere via `toastStore.getState().success(msg)`)
- **Reanimated 3** for enter/exit animations (UI thread)
- **Gesture Handler** `Gesture.Pan` for swipe-to-dismiss

Variants:
- **success**: sage background (#7A9E7E at 15%), CheckCircle icon
- **error**: ember background (#C85A3A at 15%), WarningCircle icon
- **info**: copper background (#B87333 at 15%), Info icon
- **warning**: gold background (#D4A843 at 15%), Warning icon

Animation:
- Enter: `withSpring(0, { damping: 20, stiffness: 150 })` on translateY from -100
- Exit: `withTiming(-100, { duration: 200 })` on translateY
- Swipe dismiss: `Gesture.Pan` with velocity threshold 500, fling up to dismiss
- Auto-dismiss: 4000ms default

### Implementation
- Store: `packages/hooks/stores/toastStore.ts` (Zustand, shared)
- Components: `apps/mobile/components/Toast.tsx` (ToastProvider, ToastContainer, ToastItem)
- Hook: `apps/mobile/hooks/useToast.ts`
- Mount in: `apps/mobile/app/_layout.tsx`

### Consequences
- (+) Zero external dependencies
- (+) Zustand allows toasting from anywhere (including tRPC error handlers)
- (+) Gesture Handler swipe-to-dismiss feels native
- (+) Reanimated spring animations feel premium
- (-) Need to test stacking on small screens and notch/dynamic island

---

## ADR-005: Animation Framework — Reanimated 3 Exclusively

**Status:** Accepted
**Date:** 2026-03-27
**Updated:** 2026-03-27 (rewritten for native-only, replaces dual-track strategy)

### Context
F31 established Reanimated 3 for swipe/match animations. F32 expands animation surface area significantly. With native-only architecture, there is no need for CSS/Framer Motion fallbacks. Everything runs on the native UI thread via Reanimated worklets.

### Decision
**Reanimated 3 for 100% of animations.** No CSS fallbacks. No Animated API. No LayoutAnimation (except for FlashList item insertion/removal where Reanimated layout animations aren't practical).

Animation Configs (in `apps/mobile/constants/animations.ts`):

```typescript
export const SPRING = {
  default: { damping: 20, stiffness: 90, mass: 1 },          // Swipe, general
  snappy: { damping: 25, stiffness: 200, mass: 0.8 },        // Button press, toast
  gentle: { damping: 15, stiffness: 60, mass: 1.2 },         // Mode transform, reveals
  bouncy: { damping: 12, stiffness: 150, mass: 0.9 },        // Match ceremony, celebrations
  stiff: { damping: 30, stiffness: 300, mass: 0.7 },         // Tab switch, toggle
  rubber: { damping: 40, stiffness: 400, mass: 1 },          // Rubber-band scroll limit
} as const

export const TIMING = {
  instant: 100,       // Button press scale
  fast: 200,          // Tab switch, crossfade
  medium: 300,        // Toast enter, card flip
  slow: 600,          // Mode transformation
  cinematic: 800,     // Copper Pick entrance
  ambient: 8000,      // Background gradient cycle
} as const

export const INTERACTION = {
  pressScale: 0.97,
  pressScaleActive: 0.94,    // Long press
  staggerDelay: 50,          // ms between list items
  swipeThreshold: 0.35,      // % of screen width
  swipeVelocity: 500,        // min velocity for fling
  kenBurnsScale: 1.05,       // photo zoom target
  kenBurnsDuration: 8000,    // photo zoom duration
  parallaxRatio: 0.5,        // header scroll ratio
} as const

export const REDUCED_MOTION = {
  spring: { damping: 100, stiffness: 1000, mass: 1 },  // Instant, no bounce
  timing: 0,                                              // No duration
} as const
```

### Consequences
- (+) All animations on UI thread — 0ms JS thread blocking
- (+) Single animation API — no platform branching
- (+) Shared values enable coordinated multi-property animations
- (+) Worklets enable gesture-driven animations without bridge
- (+) Spring physics feel naturally native on both iOS and Android
- (-) Reanimated learning curve for team (mitigated: team already uses it from F31)

---

## ADR-006: Skia vs Reanimated for Particle Effects

**Status:** Accepted
**Date:** 2026-03-27

### Context
Match ceremony, consent confirmation, and badge unlock need particle burst effects (30-60 particles with physics). Two options: Reanimated-driven Views or Skia Canvas.

### Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| **React Native Skia Canvas** | GPU-accelerated, handles 100+ particles at 60fps, shader support, true circles/gradients | Additional dependency (~2MB), learning curve |
| Reanimated + Views | No extra dependency, familiar API | 60 Animated.Views may cause layout thrashing, no true gradients |
| Lottie pre-rendered | Easy to implement | No dynamic physics, large file per animation, can't customize colors |

### Decision
Use **@shopify/react-native-skia** for particle effects. Skia Canvas renders on GPU, can handle 100+ particles without frame drops, and provides shader support for ambient gradient effects.

Particle rendering:
```typescript
// Skia Canvas with useFrameCallback
<Canvas style={{ ...StyleSheet.absoluteFillObject, pointerEvents: 'none' }}>
  {particles.map(p => (
    <Circle key={p.id} cx={p.x} cy={p.y} r={p.size} color={p.color} opacity={p.opacity} />
  ))}
</Canvas>
```

Also use Skia for:
- Ambient breathing gradients (Skia RuntimeShader)
- Consent ring glow effect (Skia blur filter)
- Paper grain noise texture (Skia noise shader)

Use Reanimated for everything else (transforms, opacity, color interpolation).

### Consequences
- (+) 60fps particle physics even on mid-range devices
- (+) GPU-accelerated gradients and blur
- (+) Single Canvas for multiple ambient effects (particles + gradient = one draw call)
- (-) ~2MB addition to app binary
- (-) Skia API is lower-level than Reanimated

---

## ADR-007: FlashList vs FlatList for List Rendering

**Status:** Accepted
**Date:** 2026-03-27

### Context
Multiple screens render scrollable lists (chat, feed, events, matches, badges). Standard FlatList can struggle at 60fps with complex items. Need to choose the right list component.

### Decision
Use **@shopify/flash-list** for ALL scrollable lists in the app.

Rationale:
- FlashList uses recycling (like UITableView/RecyclerView) — dramatically fewer component mounts
- Blank area tracking built in — warns when scroll speed exceeds render speed
- estimatedItemSize enables instant initial render
- Compatible with Reanimated animated items

Configuration:
```typescript
<FlashList
  data={items}
  renderItem={renderItem}
  estimatedItemSize={80}  // Varies per list
  drawDistance={250}       // Render ahead by 250px
/>
```

Lists to migrate: ChatList, FeedList, MatchesList, EventsList, BadgesList, SearchResults, ConversationMessages.

### Consequences
- (+) 60fps scrolling even with complex items (verified in Shopify's benchmarks: 5x fewer blank frames)
- (+) Lower memory usage via recycling
- (+) Drop-in replacement for FlatList API
- (-) Slightly more complex setup (estimatedItemSize required, some layout constraints)

---

## ADR-008: StyleSheet.create vs Tamagui on Native

**Status:** Accepted
**Date:** 2026-03-27

### Context
F31 used Tamagui for cross-platform styled components. With native-only architecture, Tamagui's main value (compiling to CSS on web) is irrelevant. Need to decide the styling approach.

### Decision
Use **StyleSheet.create** + design token constants for all new F32 components. Do NOT add new Tamagui dependencies.

Rationale:
- StyleSheet.create is zero-overhead on native (pre-processed at init)
- Design tokens as TS constants (`SPACING.md`, `COLORS.copper`) give type safety without Tamagui
- Reanimated `useAnimatedStyle` works directly with StyleSheet-compatible objects
- No Tamagui theme provider overhead or re-render cost

Pattern:
```typescript
import { SPACING, COLORS, SHADOWS } from '@/constants/tokens'

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    backgroundColor: COLORS.warmWhite,
    ...SHADOWS.sm,
    borderRadius: 12,
  },
})
```

Existing Tamagui components (LustreButton, CardBase, etc.) remain until migrated in a future refactor. New components use StyleSheet.

### Consequences
- (+) Zero overhead — StyleSheet.create is native RN
- (+) No Tamagui import/config/provider for new components
- (+) Full compatibility with Reanimated useAnimatedStyle
- (+) Simpler mental model — just React Native
- (-) No automatic dark mode theme switching (handle via token sets and context)
- (-) Existing Tamagui components coexist temporarily
