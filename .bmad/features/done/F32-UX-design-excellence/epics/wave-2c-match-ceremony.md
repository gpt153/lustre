# Epic: Wave 2c — Match Ceremony 2.0 (Skia + Reanimated + Haptics)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 2 (Signature Interactions)
**Model:** sonnet (Skia particle system + Reanimated orchestration + Haptic synchronization)
**Estimate:** 3 days
**Dependencies:** Wave 1 complete

---

## Summary

Upgrade the existing match animation into a full native ceremony: Skia Canvas particle burst (60 particles with physics), expo-linear-gradient breathing background, expo-blur glassmorphism photo frames, Reanimated orchestrated entrance sequence, and Expo Haptics synchronized pattern. This is the signature moment that defines Lustre's emotional design.

## Acceptance Criteria

1. Match ceremony triggers fullscreen overlay with expo-linear-gradient background: 3 color stops (#B87333, #D4A843, #C85A3A) at 15% opacity, gradient angle animated via Reanimated `withRepeat(withTiming(360, {duration:8000}), -1)` — breathing copper warmth
2. Skia Canvas particle burst: 60 particles (randomly #B87333 or #D4A843), burst from screen center with radial velocity (random angle, speed 150-350px/s), gravity (vy += 0.5/frame), air resistance (v *= 0.98), size 2-6px random, opacity fades 1.0 to 0.0 over 2s lifetime, rendered as Skia Circle elements
3. Both users' photos animate via Reanimated: left from translateX -250, right from +250, `withSpring(0, { damping: 20, stiffness: 90, mass: 1 })`, 80x80 circular (borderRadius: 40), 3px copper border, expo-blur BlurView frame (intensity 60, tint 'light', backgroundColor rgba(253,248,243,0.7))
4. "Det ar en match!" text: General Sans Bold 28px copper, Reanimated entrance with 200ms delay after photos land, scale `withSpring(1, { damping: 12, stiffness: 150 })` from 0.8
5. Haptic sequence synchronized with visuals: `impactLight` at particle burst (t=0ms), `impactMedium` when photos land (~400ms), `notificationSuccess` at text appear (~600ms) — timing via `setTimeout` in Reanimated `runOnJS` callbacks
6. 5-second ceremony before CTAs appear: "Skicka meddelande" (primary button) and "Fortsatt upptacka" (ghost button) fade in via Reanimated opacity
7. Tap anywhere to skip: `Gesture.Tap` on overlay — all animations fast-forward (`cancelAnimation` on all shared values, set to final positions), CTAs appear immediately
8. Auto-dismiss after 8s with no interaction (fade out entire overlay via Reanimated opacity, return to discover)
9. Reduced motion: skip particles and gradient animation, show static overlay with photos and text immediately (no spring, instant position), haptics still fire
10. No Lottie dependency — particles + Reanimated + Skia are sufficient for the ceremony

## File Paths

1. `apps/mobile/components/MatchCeremony.tsx`
2. `apps/mobile/components/SkiaParticles.tsx`
3. `apps/mobile/hooks/useParticles.ts`
4. `apps/mobile/hooks/useMatchCeremony.ts`
5. `apps/mobile/components/GlassmorphismFrame.tsx`
6. `apps/mobile/app/(tabs)/discover.tsx`

## Implementation Notes

- Skia particle system:
  ```typescript
  // apps/mobile/components/SkiaParticles.tsx
  import { Canvas, Circle, useFrameCallback } from '@shopify/react-native-skia'

  interface Particle {
    x: number; y: number;
    vx: number; vy: number;
    size: number;            // 2-6px
    color: string;           // '#B87333' or '#D4A843'
    opacity: number;         // 1.0 -> 0.0
    lifetime: number;        // 1.5-3s total
    elapsed: number;         // time elapsed
  }

  function createBurst(cx: number, cy: number, count: number): Particle[] {
    return Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 150 + Math.random() * 200
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed / 60,  // per-frame velocity
        vy: Math.sin(angle) * speed / 60,
        size: 2 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#B87333' : '#D4A843',
        opacity: 1,
        lifetime: 1.5 + Math.random() * 1.5,
        elapsed: 0,
      }
    })
  }

  // useFrameCallback updates particle physics each frame
  useFrameCallback((info) => {
    const dt = info.timeSinceFirstFrame / 1000
    particles.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.5          // gravity
      p.vx *= 0.98         // air resistance
      p.vy *= 0.98
      p.elapsed += 1/60
      p.opacity = Math.max(0, 1 - p.elapsed / p.lifetime)
    })
  })
  ```

- Glassmorphism frame:
  ```typescript
  import { BlurView } from 'expo-blur'
  <BlurView intensity={60} tint="light" style={styles.photoFrame}>
    <View style={{
      backgroundColor: 'rgba(253,248,243,0.7)',
      borderWidth: 3,
      borderColor: '#B87333',
      borderRadius: 40,
      overflow: 'hidden',
    }}>
      <Image source={{ uri: photoUrl }} style={{ width: 80, height: 80 }} />
    </View>
  </BlurView>
  ```

- Haptic synchronization:
  ```typescript
  const startCeremony = useCallback(() => {
    // t=0: particles + haptic
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    startParticleBurst()

    // t=400ms: photos land + haptic
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }, 400)

    // t=600ms: text + haptic
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }, 600)
  }, [])
  ```

- Photo preloading: prefetch both users' avatar URLs during swipe when match probability is high
- Performance: Skia Canvas runs on GPU, Reanimated on UI thread — zero JS thread blocking
