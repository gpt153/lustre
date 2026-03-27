# Wave 3 Test Specs — Polish & Delight (Native Mobile)

**Runner:** Maestro (odin9) + Manual (physical devices)
**VM:** odin9 (34.34.42.75, ssh odin9, user samuel)
**Emulator:** emulator-5570 (Android 34, Google APIs, x86_64)
**Package:** com.lovelustre.app
**Flows path:** ~/lustre/e2e/maestro/
**Start emulator:** `ssh odin9 "~/start-emulator.sh 5570"`

---

## T3.1 — Micro-interactions (Reanimated + Gesture Handler)

**Type:** Automated + Manual
**Epic:** 3a

### Checks
1. Tap any AnimatedPressable — Reanimated scale to 0.97 visible, springs back on release
2. Press CardBase — card lifts (translateY -2px), shadow increases via Reanimated
3. Navigate to Chat list — FlashList items stagger in (each item delays 50ms via withDelay)
4. Switch tabs — copper underline slides to new tab via Reanimated spring (damping 20, stiffness 130)
5. Gesture.LongPress on profile photo — context bottom sheet appears after 400ms + Haptics impactMedium
6. Gesture.Tap numberOfTaps=2 on feed post — copper Heart overlay scales up and fades + Haptics impactLight
7. Pull-to-refresh — copper-colored RefreshControl visible
8. "Reduce animations" enabled — press is instant (no spring), list items appear without stagger
9. Rapid tapping (5 taps in 1s) — no visual glitch, no animation queue buildup
10. All micro-interactions maintain 60fps (gfxinfo 0 janky frames)

### Maestro Flow: `f32-micro-interactions.yaml`
```yaml
appId: com.lovelustre.app
---
- launchApp
- tapOn: "Connect"
- screenshot: "micro-chat-entrance"
- tapOn: "Discover"
- screenshot: "micro-discover"
- tapOn: "Profile"
- screenshot: "micro-profile"
- scroll:
    direction: "DOWN"
    distance: 200
- screenshot: "micro-pull-refresh"
```

### Performance Assertion
- AnimatedPressable spring: settles in <150ms (damping 25, stiffness 200)
- List stagger: 10 items visible in <600ms (50ms delay * 10 + spring settle)
- Tab underline: slides to new position in <250ms

---

## T3.2 — Parallax & Depth (Reanimated ScrollHandler)

**Type:** Manual (visual verification)
**Epic:** 3b

### Checks
1. Open profile view — scroll down — header photo moves at 0.5x speed (parallax visible)
2. Discover card stack — card behind active at 0.95 scale + 8px translateY
3. Second card behind at 0.9 scale + 16px translateY, lighter shadow
4. Scroll feed — card shadows shift subtly with scroll position
5. Fast scroll (fling) — no visual artifacts, parallax clipping correct (overflow: hidden works)
6. "Reduce animations" — parallax disabled, all elements at static positions
7. Performance: fast scroll 60fps maintained (gfxinfo during fling)
8. ParallaxHeader image doesn't overflow container (clipping verified)

### Manual Verification Protocol
```
On emulator-5570:
1. Navigate to profile view
2. Scroll slowly — observe header photo moves slower than content
3. Scroll quickly — verify no clipping artifacts
4. Navigate to Discover — observe 3-card depth stack
5. Screenshot comparison: card scale 1.0 vs 0.95 vs 0.9 measurable
```

### Performance Assertion
- useAnimatedScrollHandler: 0ms JS thread during scroll (all worklet)
- Profile parallax scroll: 60fps during continuous scroll via `adb shell dumpsys gfxinfo`

---

## T3.3 — Haptics Patterns (Expo Haptics)

**Type:** Manual ONLY (haptics cannot be verified on emulator)
**Epic:** 3c

### Physical Device Test Protocol
```
Device: Physical Android (Pixel 6+ preferred) or iOS (iPhone 12+)
IMPORTANT: Haptics do NOT work on Android emulator. Must use physical device.

Steps:
1. Install app on physical device
2. Settings > ensure "Appvibrationer" toggle is ON

Test each pattern:
3. Tap any button → feel LIGHT tap haptic (subtle, single pulse)
4. Swipe card past threshold (35% screen width) → feel MEDIUM impact (stronger, once per swipe)
5. Trigger match → feel SEQUENCE: light...pause...medium...pause...heavy...pause...success
   (distinct escalation, should feel like a crescendo)
6. Unlock badge → feel TRIPLE-TAP: light...light...medium (celebratory)
7. Complete consent → feel SUCCESS notification (warm, affirming, single)
8. Submit form with errors → feel ERROR notification (sharp, alerting)
9. Scroll picker (if applicable) → feel SELECTION tick (subtle click on each item)

Disable test:
10. Settings > toggle "Appvibrationer" OFF → repeat steps 3-9 → NO haptics fire
11. Toggle back ON → haptics resume

Platform verification:
12. On iOS: verify haptic quality feels native (uses Taptic Engine)
13. On Android: verify haptics work (weaker motors = lighter patterns, but still present)

Silent mode test:
14. Set device to silent/vibrate mode → haptics still work (haptics != sound)
15. Passive scrolling → verify NO haptics fire
```

---

## T3.4 — Ambient Animations (Skia Shaders)

**Type:** Visual + Automated
**Epic:** 3d

### Checks
1. Profile view — Skia ParticleField visible: 10-12 small copper dots floating upward slowly
2. Particles drift at gentle pace with horizontal sine oscillation
3. Match screen — AmbientGradient rotates slowly (Skia shader, 8s cycle)
4. PaperGrain noise texture visible on warm backgrounds (very subtle, 2-3% opacity)
5. Ambient elements have pointerEvents="none" — tapping through them works
6. Particles and gradient don't obscure text readability
7. "Reduce animations" — all ambient stop, static backgrounds shown
8. App background (home button) — ambient animations pause (verified via CPU monitor)
9. Battery <20% mock — ambient auto-disables (test via expo-battery mock or wait)
10. 30fps cap verified: ambient runs at half frame rate of main UI

### Maestro Flow: `f32-ambient-animations.yaml`
```yaml
appId: com.lovelustre.app
---
- launchApp
- tapOn: "Discover"
- wait: 2000
- screenshot: "ambient-discover-t0"
- wait: 4000
- screenshot: "ambient-discover-t4"
- tapOn: "Profile"
- wait: 2000
- screenshot: "ambient-profile"
```

### Performance Assertion
- Skia Canvas GPU time: <8ms per frame (30fps cap means <8ms every other frame)
- Main thread unaffected: JS thread idle during ambient animation
- Memory: Skia Canvas adds <4MB to heap (verified via `adb shell dumpsys meminfo`)

---

## T3.5 — Sound Design (expo-av)

**Type:** Manual ONLY (sound cannot be verified via Maestro)
**Epic:** 3e

### Physical Device Test Protocol
```
Device: Physical device with speaker or headphones
IMPORTANT: Emulator audio may not represent real device experience.

Steps:
1. Fresh install — Settings > "Appljud" should be OFF by default
2. Toggle "Appljud" ON

Test each sound:
3. Trigger match → warm chime plays (~0.8s, not too loud, warm register)
4. Send a message → soft whoosh plays (~0.3s, subtle)
5. Unlock badge → metallic ding plays (~0.5s, warm not sharp)
6. View Copper Pick → ambient swell plays (~1.2s, gentle crescendo)
7. Complete consent → gentle bell plays (~0.6s, warm resonance)

Volume check:
8. All sounds at 60% of system media volume — not jarring, enhancement only

Sync check:
9. Match: chime starts at same moment as particle burst + haptic light
10. Badge: ding matches triple-tap haptic rhythm

Disable tests:
11. Toggle "Appljud" OFF → repeat steps 3-7 → NO sounds play
12. Toggle device to SILENT mode → sounds toggle ON → NO sounds play (system mute respected)
13. Toggle device to NORMAL → sounds ON → sounds resume

Edge cases:
14. Rapid message sends (3 in 2s) → each whoosh plays without overlap/distortion
15. App goes to background during sound → sound completes naturally (no zombie audio)
```

---

## Final Performance Audit (All Wave 3)

### Automated (adb + Maestro on odin9)
```bash
# Start emulator
ssh odin9 "~/start-emulator.sh 5570"

# Install and launch
adb -s emulator-5570 install app-release.apk
adb -s emulator-5570 shell am start -W com.lovelustre.app

# Cold start timing
# Target: TotalTime < 2000ms

# Full navigation test
maestro test ~/lustre/e2e/maestro/f32-full-navigation.yaml

# Frame rate audit
adb -s emulator-5570 shell dumpsys gfxinfo com.lovelustre.app
# Target: 95th percentile < 16ms, janky frames < 2%

# Memory audit
adb -s emulator-5570 shell dumpsys meminfo com.lovelustre.app
# Target: RSS increase < 40MB from pre-F32 baseline (includes Skia)

# Bundle size
ls -la apps/mobile/android/app/build/generated/assets/createBundleReleaseJsAndAssets/index.android.bundle
# Target: increase < 200KB from pre-F32 baseline
```

### Manual (Physical Devices)
1. 10-minute session on iPhone 13 with all features active — no thermal throttling, no battery drain anomaly
2. 10-minute session on Pixel 6 — same checks
3. Low-end device test (Pixel 4a or equivalent): all features functional, ambient at 30fps feels smooth
4. Network: 3G throttle — skeletons show, toasts work, empty states appear, no broken UI
5. All 4 themes verified: light_vanilla, light_spicy, dark_vanilla, dark_spicy — complete visual pass

### Founder Sign-off Checklist
```
Navigate all 5 tabs:
- [ ] Everything feels polished, consistent spacing, no visual noise

Swipe through 10 profiles:
- [ ] Story format feels natural (tap to navigate, swipe to like/pass)
- [ ] Ken Burns zoom on photos adds life
- [ ] Parallax creates depth on swipe
- [ ] Gesture discrimination works (taps don't accidentally swipe)

Trigger a match:
- [ ] Ceremony feels celebratory and unique
- [ ] Skia particles are smooth and satisfying
- [ ] Haptic sequence builds excitement (light -> medium -> heavy -> success)
- [ ] Sound chime is warm and pleasant (if enabled)

Switch vanilla <-> spicy:
- [ ] Transformation feels like a signature moment
- [ ] Color interpolation is smooth, no flicker
- [ ] Typography shift is noticeable but not jarring

View Copper Pick:
- [ ] Feels cinematic and premium
- [ ] Ken Burns + parallax create depth
- [ ] No accidental swipe (buttons only)

Complete consent flow:
- [ ] Feels like a ceremony, not a form
- [ ] Ring animation is elegant
- [ ] Staggered item reveal builds anticipation
- [ ] Confirmation moment feels warm (particles + haptic + optional sound)

General polish:
- [ ] Every button has spring press animation
- [ ] Every list has staggered entrance
- [ ] Haptics feel distinct per action
- [ ] Dark mode looks warm and readable
- [ ] Ambient animations are subtle (barely noticeable = perfect)

Overall UX rating: ___/10 (target: 9.5)
```

---

## Regression Tests

After all waves, re-run:
1. All existing Maestro flows in `~/lustre/e2e/maestro/` — zero regressions
2. All existing Jest/Vitest unit tests — zero failures
3. `pnpm build` for mobile — zero build errors
4. EAS Build for Android — successful
5. EAS Build for iOS — successful
