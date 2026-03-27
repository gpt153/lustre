# Epic: Wave 3d — Ambient Animations (Skia Shaders + Reanimated)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 3 (Polish & Delight)
**Model:** sonnet (Skia shader complexity)
**Estimate:** 2 days
**Dependencies:** Wave 2 complete (uses SkiaParticles from 2c)

---

## Summary

Add ambient "living" animations to key screens using Skia GPU-accelerated shaders and Reanimated frame callbacks. Breathing copper gradients via Skia RuntimeShader, floating Skia particles, and paper-grain noise texture. All ambient effects run at 30fps cap on the UI thread with automatic battery-conservation and reduced-motion support. The app should feel warm and alive even when the user isn't interacting.

## Acceptance Criteria

1. AmbientGradient component: Skia Canvas rendering a breathing gradient shader — 3 color stops (#B87333, #D4A843, #C85A3A) at 15% opacity, gradient angle rotates via Reanimated `useFrameCallback` driving a shared value, 8s full rotation cycle for default, 12s for calm contexts
2. ParticleField component: Skia Canvas renders 10-12 floating particles — copper (#B87333) circles at 20% opacity, 2-4px radius, drift upward (0.2px/frame), gentle horizontal oscillation (sin wave: amplitude 10px, period 6s driven by `Math.sin(elapsed * 0.001 + phase) * 10`), wrap to bottom when y < 0
3. PaperGrain component: Skia RuntimeShader noise function at 2-3% opacity overlaid on warm backgrounds — GLSL `fract(sin(dot(uv * 200.0, vec2(12.9898, 78.233))) * 43758.5453) * 0.03` — gives tactile printed-paper feel
4. 30fps cap on all ambient animations: Reanimated `useFrameCallback` with frame-skip logic — render every other frame to conserve battery while maintaining smooth perception
5. Battery conservation: ambient animations auto-disable when battery <20% — checked via `expo-battery` `Battery.getBatteryLevelAsync()` on app foreground
6. App background detection: ambient animations pause when app goes to background via `AppState.addEventListener('change')` — Skia Canvas stops drawing, frame callbacks deactivate
7. All ambient elements render with `pointerEvents="none"` and position behind content — zero interference with touch targets or text readability
8. Reduced motion: all ambient animations stop completely — static warm backgrounds shown, no gradient rotation, no particles, no grain shader. Checked via `useReducedMotion()`
9. AmbientGradient used on: match screen (copper/gold/ember), profile view background (copper/warmWhite), Copper Pick (copper/gold)
10. Performance: ambient animations maintain <8ms GPU time on Pixel 6, verified via Skia Canvas performance overlay

## File Paths

1. `apps/mobile/components/AmbientGradient.tsx`
2. `apps/mobile/components/ParticleField.tsx`
3. `apps/mobile/components/PaperGrain.tsx`
4. `apps/mobile/hooks/useAmbientAnimation.ts`
5. `apps/mobile/app/profile/[userId].tsx`
6. `apps/mobile/app/(tabs)/discover.tsx`

## Implementation Notes

- AmbientGradient with Skia:
  ```typescript
  import { Canvas, Shader, Fill, Skia } from '@shopify/react-native-skia'
  import { useFrameCallback, useSharedValue } from 'react-native-reanimated'

  const GRADIENT_SHADER = Skia.RuntimeEffect.Make(`
    uniform float angle;
    uniform float opacity;

    half4 main(float2 xy) {
      float2 center = float2(0.5, 0.5);
      float2 uv = xy / float2(width, height);
      float2 dir = float2(cos(angle), sin(angle));
      float t = dot(uv - center, dir) + 0.5;
      t = clamp(t, 0.0, 1.0);

      // 3-stop gradient: copper -> gold -> ember
      vec3 copper = vec3(0.722, 0.451, 0.2);
      vec3 gold = vec3(0.831, 0.659, 0.263);
      vec3 ember = vec3(0.784, 0.353, 0.227);

      vec3 color = mix(mix(copper, gold, t * 2.0), ember, max(0.0, t * 2.0 - 1.0));
      return half4(color, opacity);
    }
  `)

  // Drive angle via useFrameCallback at 30fps
  const angle = useSharedValue(0)
  let frameCount = 0
  useFrameCallback((info) => {
    frameCount++
    if (frameCount % 2 === 0) return  // 30fps cap
    angle.value = (info.timeSinceFirstFrame / 8000) * Math.PI * 2  // 8s full rotation
  })
  ```

- ParticleField with Skia:
  ```typescript
  import { Canvas, Circle } from '@shopify/react-native-skia'

  // 10-12 particles, each with:
  const particles = useRef(
    Array.from({ length: 10 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      baseX: Math.random() * width,
      size: 2 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.15 + Math.random() * 0.1,
      speed: 0.15 + Math.random() * 0.1,
    }))
  ).current

  useFrameCallback((info) => {
    frameCount++
    if (frameCount % 2 === 0) return  // 30fps cap
    const elapsed = info.timeSinceFirstFrame
    particles.forEach(p => {
      p.y -= p.speed  // drift upward
      p.x = p.baseX + Math.sin(elapsed * 0.001 + p.phase) * 10  // oscillate
      if (p.y < -10) { p.y = height + 10; p.baseX = Math.random() * width }  // wrap
    })
  })
  ```

- PaperGrain with Skia RuntimeShader:
  ```typescript
  const NOISE_SHADER = Skia.RuntimeEffect.Make(`
    half4 main(float2 xy) {
      float noise = fract(sin(dot(xy * 0.5, float2(12.9898, 78.233))) * 43758.5453);
      return half4(noise, noise, noise, 0.025);  // 2.5% opacity
    }
  `)
  // Static noise — no animation needed, rendered once
  // Canvas with pointerEvents="none", absolute fill
  ```

- useAmbientAnimation hook:
  ```typescript
  export function useAmbientAnimation() {
    const reducedMotion = useReducedMotion()
    const [batteryOk, setBatteryOk] = useState(true)
    const [appActive, setAppActive] = useState(true)

    useEffect(() => {
      Battery.getBatteryLevelAsync().then(level => setBatteryOk(level > 0.2))
      const sub = AppState.addEventListener('change', state => setAppActive(state === 'active'))
      return () => sub.remove()
    }, [])

    const enabled = !reducedMotion && batteryOk && appActive
    return { enabled }
  }
  ```

- Subtlety is key: if a user notices the ambient animations, they're too aggressive. The goal is subconscious warmth.
- Memory: Skia Canvas is lightweight (~2-4MB GPU for all ambient effects combined)
