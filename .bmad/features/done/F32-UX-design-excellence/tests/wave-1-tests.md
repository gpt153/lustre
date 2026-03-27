# Wave 1 Test Specs — Design Foundation (Native Mobile)

**Runner:** Maestro (odin9)
**VM:** odin9 (34.34.42.75, ssh odin9, user samuel)
**Emulator:** emulator-5570 (Android 34, Google APIs, x86_64)
**Package:** com.lovelustre.app
**Flows path:** ~/lustre/e2e/maestro/
**Start emulator:** `ssh odin9 "~/start-emulator.sh 5570"`

---

## T1.1 — Spacing Consistency

**Type:** Visual / Maestro screenshots
**Epic:** 1a

### Checks
1. Open Discover tab — card padding is SPACING.md (16px) on all sides
2. Open Profile tab — section gaps are SPACING.lg (24px) between major sections
3. Open Settings — list item padding is SPACING.sm (8px) vertical, SPACING.md (16px) horizontal
4. Open Chat list — avatar-to-text gap is SPACING.sm (8px)
5. Bottom tab bar has SPACING.sm (8px) vertical padding and SPACING.md (16px) horizontal padding
6. No arbitrary pixel values remain in rendered output (spot-check 5 screens via screenshots)

### Maestro Flow: `f32-spacing-check.yaml`
```yaml
appId: com.lovelustre.app
---
- launchApp
- assertVisible: "Discover"
- screenshot: "spacing-discover"
- tapOn: "Profile"
- assertVisible: "Profile"
- screenshot: "spacing-profile"
- tapOn: "Connect"
- screenshot: "spacing-chat"
- tapOn: "Learn"
- screenshot: "spacing-learn"
- tapOn: "Explore"
- screenshot: "spacing-explore"
```

### Performance Assertion
- Cold launch to first tab visible: <2000ms
- `adb shell dumpsys gfxinfo com.lovelustre.app` — 0 janky frames during tab navigation

---

## T1.2 — Skeleton Loaders (Reanimated Shimmer)

**Type:** Automated + Visual
**Epic:** 1b

### Checks
1. Kill app, clear cache, launch — Discover tab shows skeleton cards (not ActivityIndicator) while loading
2. Skeleton card shape matches actual card dimensions (same height, width, border radius)
3. Shimmer animation visible: copper-tinted gradient sweeps left-to-right (Reanimated on UI thread)
4. Data loads — skeleton crossfades to content via Reanimated opacity (no flash/jump)
5. Navigate to Chat tab — chat list shows skeleton rows while loading
6. Navigate to Profile — profile shows skeleton layout (photo placeholder, text lines)
7. Enable "Reduce animations" in Android Accessibility — shimmer stops, static gray fill shown
8. TalkBack enabled — skeleton announces "Loading" (accessibilityState busy)

### Maestro Flow: `f32-skeleton-loaders.yaml`
```yaml
appId: com.lovelustre.app
---
- clearState
- launchApp
- assertVisible:
    id: "skeleton-card"
    timeout: 2000
- screenshot: "skeleton-discover-loading"
- waitForAnimationToEnd
- assertNotVisible:
    id: "skeleton-card"
- screenshot: "skeleton-discover-loaded"
- tapOn: "Connect"
- assertVisible:
    id: "skeleton-chat"
    timeout: 2000
- screenshot: "skeleton-chat-loading"
```

### Performance Assertion
- Shimmer animation: 60fps on emulator-5570 verified via `adb shell dumpsys gfxinfo`
- Skeleton-to-content transition: <100ms measured via Maestro timing

---

## T1.3 — Toast System (Reanimated + Gesture Handler)

**Type:** Automated
**Epic:** 1c

### Checks
1. Update profile — success toast appears ("Profil uppdaterad") with sage accent and CheckCircle icon
2. Toast slides in from top with spring animation (visible within 300ms of trigger)
3. Toast auto-dismisses after 4 seconds
4. Trigger error (submit invalid form) — error toast with ember accent and WarningCircle icon
5. Swipe up on toast (Gesture Handler Pan) — toast dismisses immediately
6. Trigger 4 toasts rapidly — only 3 visible, oldest dismissed (FIFO)
7. Toast with action button: tap action — callback fires, toast dismisses
8. TalkBack: toast content announced on appearance via AccessibilityInfo

### Maestro Flow: `f32-toast-system.yaml`
```yaml
appId: com.lovelustre.app
---
- launchApp
- tapOn: "Profile"
- tapOn: "Redigera profil"
- tapOn: "Spara"
- assertVisible:
    text: "Profil uppdaterad"
    timeout: 1000
- screenshot: "toast-success"
- wait: 5000
- assertNotVisible: "Profil uppdaterad"
```

---

## T1.4 — Empty States (react-native-svg)

**Type:** Automated + Visual
**Epic:** 1d

### Checks
1. New user with no matches — Matches screen shows empty state illustration + heading + CTA button
2. Empty state illustration is visible and correctly sized (~120px)
3. CTA button is tappable and navigates to Discover
4. No messages — Chat screen shows empty state with messaging
5. No events — Events screen shows empty state
6. Search with no results — "Inga resultat" empty state shown
7. Disable network (airplane mode) — offline empty state with retry button
8. TalkBack: empty state text readable, illustration ignored (accessible={false})

### Maestro Flow: `f32-empty-states.yaml`
```yaml
appId: com.lovelustre.app
---
- clearState
- launchApp
- tapOn: "Connect"
- assertVisible: "Inkorgen ar tom"
- screenshot: "empty-chat"
- tapOn: "Discover"
- screenshot: "empty-discover"
```

---

## T1.5 — Form Validation (Reanimated)

**Type:** Automated
**Epic:** 1e

### Checks
1. Profile edit: clear required field (display name), tap away — error message slides in with Reanimated spring, border turns ember via interpolateColor
2. Error message entrance is animated (not instant pop)
3. Type valid value — error disappears, sage CheckCircle appears at right edge
4. Submit form with multiple errors — form shakes (Reanimated translateX 3 cycles) + Expo Haptics error
5. Email field: enter invalid email — "Ogiltig e-post" error on blur
6. Fix all errors and submit — success toast, no error styling remains
7. Scroll to first error when error field is off-screen
8. TalkBack: error messages linked to inputs via accessibilityDescribedBy

### Maestro Flow: `f32-form-validation.yaml`
```yaml
appId: com.lovelustre.app
---
- launchApp
- tapOn: "Profile"
- tapOn: "Redigera profil"
- clearText:
    id: "display-name-input"
- tapOn:
    id: "bio-input"
- assertVisible: "Visningsnamn kravs"
- screenshot: "validation-error"
- inputText:
    id: "display-name-input"
    text: "Samuel"
- assertNotVisible: "Visningsnamn kravs"
- screenshot: "validation-success"
```

---

## T1.6 — Icon System (phosphor-react-native)

**Type:** Visual / Maestro screenshots
**Epic:** 1f

### Checks
1. Bottom tab bar: 5 icons visible — Compass, ChatCircle, MagnifyingGlass, BookOpen, User
2. Active tab icon uses Fill weight with copper (#B87333) tint
3. Inactive tab icons use Regular weight with warm gray color
4. Profile screen: all icons are phosphor-react-native style (consistent stroke weight)
5. Settings screen: Gear, Bell, Lock icons — all Phosphor
6. No @expo/vector-icons imports remain in `apps/mobile/` (codebase grep check)
7. Dark mode: icons use warm cream foreground color
8. Icons vertically aligned with adjacent text (no visual misalignment)

### Maestro Flow: `f32-icons.yaml`
```yaml
appId: com.lovelustre.app
---
- launchApp
- screenshot: "icons-discover-tab"
- tapOn: "Profile"
- screenshot: "icons-profile"
- tapOn: "Installningar"
- screenshot: "icons-settings"
```

### Codebase Verification
```bash
# Run on build machine — must return 0 results
grep -r "@expo/vector-icons" apps/mobile/ --include="*.tsx" --include="*.ts" | wc -l
```

---

## T1.7 — Accessibility (VoiceOver/TalkBack)

**Type:** Manual + Automated
**Epic:** 1g

### Checks
1. Enable TalkBack on emulator-5570 — navigate Discover screen — all elements announced correctly with role and label
2. Navigate Profile screen — edit button, settings, each section announced
3. All Pressable elements have accessibilityRole="button" and accessibilityLabel
4. Enable "Reduce animations" in Accessibility settings — swipe spring is instant, skeleton shimmer stops
5. Dark mode: charcoal on cream contrast passes AAA (10.2:1 measured)
6. Copper accent text: only on text 18px+ (verify no body text in copper)
7. Minimum 44x44pt touch targets on all interactive elements (spot-check via layout inspector)
8. Modal opens — TalkBack focus moves to first element in modal
9. Modal closes — TalkBack focus returns to trigger element

### Maestro Flow: `f32-accessibility.yaml`
```yaml
appId: com.lovelustre.app
---
- launchApp
- tapOn: "Profile"
- assertVisible:
    id: "edit-profile-button"
- screenshot: "a11y-profile"
- tapOn: "Discover"
- screenshot: "a11y-discover"
```

### TalkBack Manual Protocol
```
Device: emulator-5570 on odin9
Steps:
1. ssh odin9
2. Enable TalkBack: adb -s emulator-5570 shell settings put secure enabled_accessibility_services com.google.android.marvin.talkback/com.google.android.marvin.talkback.TalkBackService
3. Navigate each tab via swipe gestures
4. Verify every element is announced
5. Test modal focus trap
6. Disable TalkBack after test
```

---

## Performance Checks (All Wave 1)

### Automated (Maestro + adb)
1. Cold start to interactive: `adb shell am start -W com.lovelustre.app` — TotalTime <2000ms
2. Navigate all 5 tabs rapidly (10 switches in 5s): `adb shell dumpsys gfxinfo com.lovelustre.app` — 0 janky frames (>16ms)
3. Hermes bytecode size: `ls -la apps/mobile/android/app/build/generated/assets/createBundleReleaseJsAndAssets/index.android.bundle` — increase <80KB from baseline
4. Memory: `adb shell dumpsys meminfo com.lovelustre.app` — RSS increase <20MB from pre-F32

### Manual
1. Test on low-end emulator config (2GB RAM, 2 cores) — all animations smooth
2. Test with slow network throttle (3G via Charles Proxy) — skeletons appear, toasts work, no blank screens
