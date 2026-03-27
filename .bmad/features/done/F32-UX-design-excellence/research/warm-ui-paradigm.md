# Warm UI — A Native Mobile Design Paradigm for Lustre

**Platform:** Native mobile only (iOS + Android via Expo/React Native)

## 1. The Thesis

Every major dating app follows one of three visual identities:
- **Cold/Energetic:** Tinder (neon gradients, black backgrounds, high contrast)
- **Neutral/Clean:** Hinge, Bumble (white backgrounds, muted accents, corporate warmth)
- **Dark/Editorial:** Feeld (deep grays, moody, art-house aesthetic)

Nobody owns **warm** on native mobile. Not "warm-ish" like Hinge's gentle serif. Actually, viscerally warm — like candlelight, copper jewelry, sunlit linen, golden hour photography. And nobody combines visual warmth with tactile warmth: spring physics that feel organic, haptic patterns that feel like touch, sounds that feel like resonance.

Lustre's copper (#B87333) and gold (#D4A843) palette already suggests this direction. F32 codifies "Warm UI" as a deliberate, systematic native mobile design paradigm that leverages every native capability: Reanimated 3 worklets on UI thread, Skia GPU-accelerated rendering, Expo Haptics, expo-av sound, and platform-specific affordances.

## 2. Defining Warm UI on Native

### 2.1 Visual Characteristics

**Color Temperature (TS Constants in packages/tokens/):**
- All neutrals skew warm: cream (#FDF8F3) not white, charcoal (#2C2421) not black
- Shadows have warm tint: `{ shadowColor: '#2C2421', shadowOpacity: 0.08 }` not pure black
- Even grays are warm: `#8B7E75` not `#888888`
- Error red is ember (#C85A3A, warm red) not pure red (#FF0000)
- Success green is sage (#7A9E7E, warm green) not pure green (#00FF00)

**Texture (Skia Shaders):**
- Subtle paper grain via Skia noise shader at 2-3% opacity over backgrounds
- Not flat, not skeuomorphic — tactile, like high-quality paper
- Gradient backgrounds via `expo-linear-gradient` with 2-3 warm stops
- Skia RuntimeShader for animated grain: `noise(uv * 200.0) * 0.03`

**Light & Shadow (StyleSheet + Reanimated):**
- Shadows are soft and warm, never harsh black
- Light source implied from top-left (consistent across all elevations)
- Shadow implementation:

```typescript
// packages/tokens/shadows.ts
export const SHADOWS = {
  sm: {
    shadowColor: '#2C2421',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#2C2421',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2C2421',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: '#2C2421',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 48,
    elevation: 16,
  },
} as const
```

**Glassmorphism (expo-blur BlurView):**
```typescript
// apps/mobile/components/GlassmorphismFrame.tsx
<BlurView intensity={60} tint="light" style={styles.glassFrame}>
  <View style={{
    backgroundColor: 'rgba(253,248,243,0.7)',  // warm white, not pure white
    borderWidth: 1,
    borderColor: 'rgba(184,115,51,0.1)',        // copper tint border
  }}>
    {children}
  </View>
</BlurView>
```

### 2.2 Motion Characteristics (Reanimated 3)

**Spring Physics (All on UI Thread):**
- Warm UI prefers spring animations over linear/ease — springs feel organic
- Default spring: `{ damping: 20, stiffness: 90, mass: 1 }` (existing swipe config)
- Springs should "breathe" — slight overshoot creates life
- No hard stops — `withSpring` decelerates naturally, no `withTiming` for interactive elements
- iOS-equivalent spring curves: `{ damping: 18, stiffness: 120, mass: 0.9 }` matches UIKit spring

**Animation Speed by Context (Reanimated Shared Values):**
- Vanilla mode: 1.0x speed multiplier — calm, deliberate
- Spicy mode: 0.77x duration = 1.3x perceived speed — energetic, confident
- Speed applied via: `withTiming(value, { duration: baseDuration * speedMultiplier })`
- Spring damping adjusted: vanilla `damping: 15`, spicy `damping: 25` (snappier)

**Ambient Motion (Skia + Reanimated):**
- Skia RuntimeShader for breathing gradients (3 warm color stops, 8s cycle)
- Reanimated `useFrameCallback` capped at 30fps for ambient particle drift
- Floating Skia particles: copper circles at 20% opacity, gentle upward drift
- Idle animations on key screens: subtle copper shimmer via Reanimated `withRepeat`
- Everything moves slowly enough to be calming, never distracting

**Rubber-Band Physics (Native Feel):**
- ScrollView overscroll: iOS native rubber-band preserved, not disabled
- Android: `overScrollMode="always"` with Reanimated `useAnimatedScrollHandler` for custom spring at limits
- Swipe cards: rubber-band resistance at +-40% screen width before snap-back or fly-off
- Gesture velocity threshold: 500px/s for fling recognition

### 2.3 Typography Characteristics

**Warmth in Type:**
- General Sans (headings): slightly rounded terminals, humanist proportions — loaded via `expo-font`
- Inter (body): clean but not cold, x-height balanced — loaded via `expo-font`
- Letter-spacing on native: `letterSpacing: 0.3` on body (React Native uses px, not em)
- Line-height generous: body `lineHeight: 24` for 16px font, headings `lineHeight: 1.3 * fontSize`

**Weight Variation by Mode:**
- Vanilla: headings at fontWeight '600', body at '400'
- Spicy: headings at fontWeight '700', body at '500'
- Font weight can't be smoothly interpolated on native — use opacity crossfade between two Text elements with Reanimated

### 2.4 Tactile Characteristics (Expo Haptics)

**Haptic Language (Unique to Lustre):**
- Every meaningful interaction has a distinct haptic signature
- Light impact for UI feedback (button press, toggle)
- Medium impact for thresholds (swipe boundary, scroll snap)
- Heavy impact for celebrations (match, achievement)
- Selection for continuous feedback (picker scroll, slider drag)
- NotificationSuccess for confirmations (consent, profile save)
- NotificationWarning for caution (leaving unsaved form)
- NotificationError for failures (validation shake, send failure)
- Custom sequences for signature moments: match = `light-50ms-medium-100ms-heavy-50ms-success`

**Haptic + Sound Synchronization:**
- Match: haptic heavy fires at same frame as chime sound start
- Badge: haptic triple-tap pattern matches metallic ding rhythm
- Consent confirm: haptic success synced with bell sound
- Timing via Reanimated `useFrameCallback` ensures frame-accurate sync

### 2.5 Sound Characteristics (expo-av)

**Warm Sound Palette:**
- All sounds in warm register (200-500Hz dominant frequency)
- Short durations: none >1.2s (ambient swell is longest)
- Gentle attack, natural decay — no sharp transients
- 60% of system media volume — enhancement, not interruption
- Preloaded via `Audio.Sound.createAsync` on settings enable
- Sound files: AAC compressed, 20-50KB each, total <250KB

### 2.6 Interaction Characteristics (Gesture Handler 2)

**Touch Response (Composable Gestures):**
- `Gesture.Tap` for story navigation (left 30% / right 70% regions)
- `Gesture.Pan` for swipe cards (with velocity tracking and fling detection)
- `Gesture.LongPress` for context actions (profile section comment, photo save)
- `Gesture.Fling` for quick dismiss (toast, bottom sheet)
- `Gesture.Pinch` for photo zoom (profile photo detail view)
- Composed gestures: `Gesture.Simultaneous(pan, tap)` for story-card swipe+tap
- `Gesture.Exclusive(fling, pan)` for prioritizing fling over slow drag

**Pressable Animation Pattern:**
```typescript
// apps/mobile/components/AnimatedPressable.tsx
const scale = useSharedValue(1)
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}))

const gesture = Gesture.Tap()
  .onBegin(() => {
    scale.value = withSpring(0.97, { damping: 25, stiffness: 200, mass: 0.8 })
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
  })
  .onFinalize(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150, mass: 0.8 })
  })
```

## 3. Warm UI vs. Competitors (Native Mobile)

| Aspect | Cold UI (Tinder) | Neutral UI (Hinge) | Dark UI (Feeld) | **Warm UI (Lustre)** |
|--------|-------------------|---------------------|------------------|----------------------|
| Background | Pure black | Pure white | Deep charcoal | Warm cream (#FDF8F3) |
| Accent | Neon pink/red | Rose/salmon | Muted pastels | Copper/gold (#B87333/#D4A843) |
| Shadows | None or harsh | Subtle gray | None | Warm-tinted via `shadowColor: '#2C2421'` |
| Texture | Flat | Flat | Flat | Skia noise shader (paper grain) |
| Motion | UIKit springs | Minimal | JS thread (janky) | Reanimated 3 worklets (UI thread) |
| Haptics | 2 patterns | 3 patterns | None | 7+ patterns with custom sequences |
| Sound | 1 chime | None | None | 5-sound warm palette (expo-av) |
| Typography | Bold sans | Serif + sans | Editorial serif | Humanist sans (warm) |
| Physics | Native springs | ScrollView momentum | Linear timing | Spring + rubber-band + momentum |
| Emotional response | Excitement, urgency | Thoughtfulness | Sophistication | **Intimacy, comfort, trust** |

## 4. Native Implementation Strategy

### 4.1 Background Textures (Skia)

**Paper Grain (Skia RuntimeShader):**
```glsl
// Skia shader for paper grain noise
uniform float opacity;
half4 main(float2 xy) {
  float noise = fract(sin(dot(xy, float2(12.9898, 78.233))) * 43758.5453);
  return half4(noise, noise, noise, opacity);
}
```
- Rendered once per frame at 30fps cap via `useFrameCallback`
- Overlaid on warm backgrounds with `pointerEvents="none"`
- ~0 CPU cost (GPU shader), ~0.5MB GPU memory

**Living Gradient (Skia + Reanimated):**
```typescript
// Match screen breathing gradient
const progress = useSharedValue(0)
useEffect(() => {
  progress.value = withRepeat(
    withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
    -1, true
  )
}, [])

// Skia Canvas with animated gradient stops driven by progress
```

### 4.2 Warm Shadows System (Native)

iOS: Uses native `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` — all support warm tint.

Android: `elevation` provides shadows but no color control. For warm shadows on Android:
- Use `elevation` for basic depth
- Overlay a semi-transparent warm View behind the card for color tint
- Or accept platform difference (Android shadows are gray, iOS are warm)

### 4.3 Copper Glow Effect (Reanimated)

Used for: active states, match moments, Copper Pick highlight, consent ring.

```typescript
// Animated copper glow via border + shadow
const glowOpacity = useSharedValue(0)
const glowStyle = useAnimatedStyle(() => ({
  borderWidth: 2,
  borderColor: `rgba(184,115,51,${glowOpacity.value * 0.5})`,
  shadowColor: '#B87333',
  shadowOpacity: glowOpacity.value * 0.3,
  shadowRadius: interpolate(glowOpacity.value, [0, 1], [0, 12]),
  shadowOffset: { width: 0, height: 0 },
}))
```

### 4.4 Particle System (Skia Canvas)

For match ceremony, badge unlocks, Copper Pick reveal, consent confirmation:

```typescript
interface Particle {
  x: number           // position (shared value)
  y: number
  size: number        // 2-6px
  color: string       // '#B87333' or '#D4A843' (random)
  vx: number          // velocity x
  vy: number          // velocity y
  opacity: number     // 1.0 -> 0.0 over lifetime
  lifetime: number    // 1.5-3s
}

// Rendered in Skia Canvas via useFrameCallback
// 60 particles for match burst, 30 for badge, 10-12 for ambient float
// Physics: gravity (vy += 0.5/frame), air resistance (vx *= 0.99, vy *= 0.99)
// Burst: radial velocity from center, random angle, speed 100-300px/s
```

## 5. Emotional Design Framework (Native)

### 5.1 The Lustre Emotion Scale

Each interaction maps to an emotional intensity level with corresponding native treatment:

| Level | Emotion | Visual | Haptic | Sound |
|-------|---------|--------|--------|-------|
| 0 | Neutral | Standard UI | None | None |
| 1 | Interest | Subtle copper highlight | None | None |
| 2 | Engagement | Warm glow, scale 0.97 press | impactLight | None |
| 3 | Excitement | Skia particles, gradient | impactMedium + impactHeavy | Chime |
| 4 | Celebration | Full Skia ceremony — particles, gradient, blur | Custom sequence | Chime + swell |
| 5 | Intimacy | Soft dim, BlurView cocoon, gentle pulse | notificationSuccess | Bell |

### 5.2 Mode-Specific Emotional Tuning

**Vanilla Mode — The Warm Embrace:**
- Colors: Full warmth, lighter tones, more cream
- Springs: `{ damping: 15, stiffness: 60, mass: 1.2 }` — gentler, slower
- Typography: fontWeight '400'/'600', letterSpacing 0.3
- Haptics: lighter impacts, longer pauses between sequence elements
- Feeling: Like a warm coffee shop — comfortable, approachable, safe

**Spicy Mode — The Candlelit Room:**
- Colors: Deeper copper, more gold, charcoal accents
- Springs: `{ damping: 25, stiffness: 120, mass: 0.8 }` — snappier, faster
- Typography: fontWeight '500'/'700', letterSpacing 0
- Haptics: stronger impacts, tighter sequence timing
- Feeling: Like a dimly lit lounge — confident, intimate, electric

## 6. Accessibility in Warm UI (Native)

**Color Contrast (WCAG AA):**
- Charcoal on cream: #2C2421 on #FDF8F3 = 12.8:1 (passes AAA)
- Copper on cream: #B87333 on #FDF8F3 = 3.8:1 (passes AA for large text only)
  - Solution: Copper only for text 18px+, icons 24px+, or decorative elements
  - Body links: charcoal with copper underline
- Dark mode warm cream: #F5EDE4 on #2C2421 = 10.2:1 (passes AAA)

**Reduced Motion (AccessibilityInfo):**
```typescript
import { AccessibilityInfo } from 'react-native'
import { useReducedMotion } from 'react-native-reanimated'

// Reanimated provides useReducedMotion() hook
// All springs become instant: { damping: 100, stiffness: 1000 }
// All withTiming becomes duration: 0
// Skia ambient animations stop
// Particles don't render
// Opacity transitions still allowed
```

**VoiceOver/TalkBack:**
- All Pressables have `accessibilityRole`, `accessibilityLabel`, `accessibilityHint`
- Story-format profiles render as scrollable list when VoiceOver active
- Toasts announced via `AccessibilityInfo.announceForAccessibility(message)`
- Minimum 44x44pt touch targets (Apple HIG requirement)
- Haptics fire regardless of VoiceOver state (tactile feedback aids navigation)

**High Contrast Mode:**
- Copper accent strengthened to #8B5A2B (darker copper) for higher contrast
- Detected via `AccessibilityInfo.isBoldTextEnabled()` (iOS) or system settings

## 7. Platform-Specific Optimizations

### iOS
- UIKit spring curves: match Reanimated springs to iOS system animations
- Rubber-band scrolling: preserve native ScrollView bounce
- BlurView with `.systemMaterial` style for glassmorphism
- SF Symbols consideration: use Phosphor but match SF Symbol sizing/weight conventions
- ProMotion: animations render at 120fps on supported devices automatically
- Haptic Engine: full `UIFeedbackGenerator` support via Expo Haptics

### Android
- Material You: consider reading `DynamicColorAndroid` for accent color adaptation
- Edge-to-edge: transparent status bar and navigation bar
- `elevation` for Material-style shadows (supplement with warm overlay)
- Predictive back gesture: ensure animations are reversible
- Ripple effect: preserve `android_ripple` on Pressables alongside spring scale
- Hermes engine: bytecode precompilation for faster cold start

## 8. Measuring Warmth

1. **User testing prompt**: "Describe how this app makes you feel in 3 words"
   - Target words: warm, intimate, safe, beautiful, premium, thoughtful, alive
   - Anti-target words: cold, generic, corporate, basic, cheap, confusing, laggy

2. **Performance metrics**: 60fps P95 on Pixel 6 and iPhone 12 — warmth fails if it stutters

3. **Haptic testing**: Physical device test — does the match ceremony sequence feel like a celebration?

4. **App Store reviews**: Monitor for aesthetic comments ("beautiful app" in first 100 reviews)

5. **Screenshot sharing**: Track screenshot events on native — are people sharing the UI?
