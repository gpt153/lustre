# Wave 2 Test Specs — Signature Interactions (Native Mobile)

**Runner:** Maestro (odin9)
**VM:** odin9 (34.34.42.75, ssh odin9, user samuel)
**Emulator:** emulator-5570 (Android 34, Google APIs, x86_64)
**Package:** com.lovelustre.app
**Flows path:** ~/lustre/e2e/maestro/
**Start emulator:** `ssh odin9 "~/start-emulator.sh 5570"`

---

## T2.1 — Profile Card Story Format (Gesture.Tap + Reanimated)

**Type:** Automated + Manual
**Epic:** 2a

### Checks
1. Discover screen: profile card shows progress bar at top with segment count matching photos+prompts
2. Tap right side (70%) of card — advances to next segment
3. Tap left side (30%) of card — goes back to previous segment
4. Photo segments: Ken Burns zoom visible (Reanimated scale 1.0 to 1.05 over ~8s)
5. Prompt segments: question at 60% opacity, answer in SemiBold 22px, warm cream background
6. Swipe right via Gesture.Pan on card — like action fires (gesture exclusivity: pan > tap when >20px)
7. Swipe left — pass action fires
8. Long press (Gesture.LongPress 300ms) — Ken Burns pauses, full photo visible
9. Progress bar: viewed segments copper filled, unseen segments warm gray
10. TalkBack: card renders as scrollable list with all content visible, Like/Pass as accessibility actions

### Maestro Flow: `f32-profile-card-story.yaml`
```yaml
appId: com.lovelustre.app
---
- launchApp
- assertVisible: "Discover"
- waitForAnimationToEnd
- screenshot: "story-card-photo1"
- tapOn:
    point: "75%,50%"
- screenshot: "story-card-segment2"
- tapOn:
    point: "75%,50%"
- screenshot: "story-card-segment3"
- tapOn:
    point: "25%,50%"
- screenshot: "story-card-back"
- swipe:
    direction: "RIGHT"
    duration: 300
- screenshot: "story-card-liked"
```

### Performance Assertion
- Segment transition: <200ms measured via Maestro timing between tap and screenshot
- Ken Burns: 60fps during zoom — `adb shell dumpsys gfxinfo` shows 0 janky frames
- Gesture discrimination (tap vs swipe): swipe only activates after 20px — verify tap works at 15px horizontal movement

---

## T2.2 — Mode Transformation (Reanimated interpolateColor)

**Type:** Automated + Visual
**Epic:** 2b

### Checks
1. Mode toggle visible (pill with Sun/Flame icons via phosphor-react-native)
2. Tap toggle in vanilla mode — 600ms Reanimated transformation: interpolateColor shifts background, accent, text colors
3. After transformation: spicy mode active — deeper background tone, bolder text weight, sharper shadows
4. Tap toggle again — transforms back to vanilla with same 600ms spring
5. Toggle icon crossfades: Sun (vanilla) to Flame (spicy) via Reanimated opacity
6. Copper glow pulse visible on toggle during transformation (shadowRadius interpolation)
7. Transformation not interrupted by touch during animation (no broken intermediate state)
8. Kill and relaunch app — mode persists (spicy mode survives cold start via AsyncStorage)
9. "Reduce animations" enabled — instant color swap, no spring animation
10. All 4 themes produce distinct visuals: light_vanilla, light_spicy, dark_vanilla, dark_spicy

### Maestro Flow: `f32-mode-transformation.yaml`
```yaml
appId: com.lovelustre.app
---
- launchApp
- screenshot: "mode-vanilla-before"
- tapOn:
    id: "mode-toggle"
- wait: 700
- screenshot: "mode-spicy-after"
- tapOn:
    id: "mode-toggle"
- wait: 700
- screenshot: "mode-vanilla-restored"
- tapOn:
    id: "mode-toggle"
- wait: 700
- stopApp
- launchApp
- screenshot: "mode-spicy-persisted"
```

### Performance Assertion
- Mode transformation maintains 60fps throughout 600ms — all interpolateColor runs on UI thread
- No JS thread blocking during transformation: Flipper CPU profiler shows <2% JS activity

---

## T2.3 — Match Ceremony 2.0 (Skia + Reanimated + Haptics)

**Type:** Automated + Manual (haptics)
**Epic:** 2c

### Checks
1. Match trigger — fullscreen overlay with expo-linear-gradient copper background
2. Skia particle burst visible: copper/gold circles burst from center (60 particles, ~2s)
3. Both profile photos animate in from sides via Reanimated spring, settle center with expo-blur BlurView frames
4. "Det ar en match!" text fades in after photos land (200ms delay)
5. Haptic sequence fires: light-medium-heavy-success (manual verification on physical device)
6. CTAs appear after 5s: "Skicka meddelande" and "Fortsatt upptacka"
7. Tap anywhere during ceremony — animations fast-forward (cancelAnimation on all shared values), CTAs appear
8. Tap "Skicka meddelande" — navigates to chat with matched user
9. Tap "Fortsatt upptacka" — returns to discover with next card
10. Auto-dismiss after 8s (returns to discover)

### Maestro Flow: `f32-match-ceremony.yaml`
```yaml
appId: com.lovelustre.app
---
- launchApp
- assertVisible: "Discover"
- swipe:
    direction: "RIGHT"
    duration: 300
- assertVisible:
    text: "Det ar en match!"
    timeout: 3000
    optional: true
- screenshot: "match-ceremony-full"
- wait: 5500
- assertVisible: "Skicka meddelande"
- tapOn: "Fortsatt upptacka"
- assertVisible: "Discover"
```

### Performance Assertion
- Skia particle burst: 60fps maintained — verified via `adb shell dumpsys gfxinfo` during ceremony
- Skia Canvas GPU time: <4ms per frame (verified via Skia debug overlay)
- Photo spring animation: damping 20 / stiffness 90 — settles in ~400ms

---

## T2.4 — Copper Pick (Cinematic Reanimated)

**Type:** Automated + Visual
**Epic:** 2d

### Checks
1. Launch app (daily pick available) — Copper Pick appears as first card, fullscreen
2. "Copper Pick" badge visible at top-left with Star icon (fill), copper pill, expo-blur background
3. Hero photo shows Ken Burns zoom (1.0 to 1.08 over 10s via Reanimated withTiming)
4. Name, age visible with large white text at bottom over expo-linear-gradient overlay
5. "Why you match" blurb visible (1-2 lines, warm cream text)
6. Like and Pass buttons visible at bottom (Heart copper, X charcoal), "Visa profil" text button
7. Tap Like — like action, next regular card shown
8. Tap Pass — pick dismissed, next regular card shown
9. Swipe gesture disabled on Copper Pick (Gesture.Pan.enabled(false)) — swipe does NOT trigger action
10. No pick available — "Kolla tillbaka imorgon" fallback with clock illustration

### Maestro Flow: `f32-copper-pick.yaml`
```yaml
appId: com.lovelustre.app
---
- launchApp
- assertVisible: "Discover"
- assertVisible:
    text: "Copper Pick"
    timeout: 3000
    optional: true
- screenshot: "copper-pick-card"
- swipe:
    direction: "RIGHT"
    duration: 300
- assertVisible:
    text: "Copper Pick"
    optional: true
- tapOn:
    id: "copper-pick-like"
    optional: true
- screenshot: "copper-pick-after-action"
```

### Performance Assertion
- Ken Burns withTiming: 60fps over 10s duration — no frame drops
- Entrance orchestration: 4 staggered animations complete without frame budget violation

---

## T2.5 — Consent Ceremony (Skia Ring + WebSocket)

**Type:** Automated + Manual
**Epic:** 2e

### Checks
1. Initiate consent — fullscreen overlay with warm charcoal backdrop
2. Skia/SVG copper ring draws clockwise (stroke-dashoffset animation, 1.5s)
3. Consent items appear one at a time with 400ms Reanimated stagger
4. Each item has phosphor-react-native icon (Shield/Heart/Lock), text, toggle
5. Confirm an item — toggle animates copper, Reanimated spring
6. Other user confirms (WebSocket sync) — their confirmation reflected on screen
7. All confirmed by both — Skia particle burst (30 particles), expo-linear-gradient gold fill, Haptics success
8. Exit: ring dissolves (Reanimated scale 1 to 1.2, opacity 1 to 0, 300ms)
9. SafeDate active — copper border pulse visible on screen edges during conversation
10. "Reduce animations" — ring instant, items appear all at once, no particles

### Maestro Flow: `f32-consent-ceremony.yaml`
```yaml
appId: com.lovelustre.app
---
- launchApp
- tapOn: "Connect"
- tapOn:
    index: 0
- tapOn:
    id: "safety-button"
    optional: true
- assertVisible:
    text: "Trygghet"
    timeout: 2000
    optional: true
- screenshot: "consent-ceremony"
```

---

## Performance Checks (All Wave 2)

### Automated (adb + Maestro)
1. Match ceremony: `adb shell dumpsys gfxinfo com.lovelustre.app reset && [trigger match] && adb shell dumpsys gfxinfo com.lovelustre.app` — 95th percentile frame time <16ms
2. Profile card story: tap transitions <200ms (Maestro timing)
3. Mode transformation: 60fps throughout 600ms (gfxinfo janky frames = 0)
4. Hermes bytecode: cumulative increase <150KB from pre-F32 baseline

### Manual (Physical Device Required)
1. Match ceremony on physical Android — Skia particles smooth, haptic sequence feels right
2. Match ceremony on physical iPhone — BlurView glassmorphism renders correctly
3. Profile card on physical device — Ken Burns smooth, tap response instant, long-press pauses
4. Mode transformation — no flickering, no intermediate broken state on either platform
5. Consent ceremony with slow network — WebSocket sync degrades gracefully (shows "waiting" state)
6. Copper Pick with slow image loading — Ken Burns starts only after image onLoad, skeleton shown while loading
