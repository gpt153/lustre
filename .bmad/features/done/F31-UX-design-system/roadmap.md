# Roadmap: F31-UX-design-system

**Status:** DONE — all waves implemented and tested
**Created:** 2026-03-26
**Started:** 2026-03-26
**Completed:** 2026-03-26
**Waves:** 6
**Total epics:** 14

---

## Wave 1: Design Tokens, Typography & Logo Assets
**Status:** DONE
**Started:** 2026-03-26
**Completed:** 2026-03-26
**Epics:** 1a VERIFIED, 1b VERIFIED, 1c VERIFIED
**Learnings:** next/font loaders cannot be re-exported from shared packages — must be declared in Next.js app directly. Added base light/dark theme aliases for Tamagui provider compatibility.

### Parallelization groups:
**Group A (sequential):**
- wave-1a-tamagui-tokens (haiku) — New Tamagui config: 12 brand color tokens (copper, copperLight, copperMuted, gold, goldBright, goldDeep, warmWhite, warmCream, charcoal, warmGray, ember, sage), custom light/dark themes, vanilla/spicy sub-themes, shadow utilities.
- wave-1b-typography (haiku) — Register General Sans heading font + Inter body font in Tamagui. Font loading for Expo (expo-font) and Next.js (@next/font). Heading/body/caption size scales.
- wave-1c-logo-assets (haiku) — Logo PNG integration: web header (32px), mobile splash screen, web favicon. Optimize PNGs. Create logo component wrapper.

### Testgate Wave 1:
- [ ] All 12 color tokens resolve correctly in both light and dark themes
- [ ] Vanilla sub-theme uses sage accent, spicy sub-theme uses ember accent
- [ ] General Sans renders for headings, Inter for body text, no FOUT
- [ ] Logo PNG displays correctly in web header and mobile splash
- [ ] Dark mode background is #1A1614, surface is #2C2421

---

## Wave 2: Navigation Redesign
**Status:** DONE
**Started:** 2026-03-26
**Completed:** 2026-03-26
**Epics:** 2a VERIFIED (mobile 5 tabs), 2b VERIFIED (web glassmorphism header)
**Learnings:** Old tab files kept for safety — cleanup in later wave if needed.

### Parallelization groups:
**Group A (parallel):**
- wave-2a-mobile-tabs (haiku) — Restructure Expo Router from 12 tabs to 5 tabs (Discover, Connect, Explore, Learn, Profile). Each tab gets nested Stack layout. Move existing screen files to new paths. Update tab icons and active tint colors to copper/gold.
- wave-2b-web-header (haiku) — Replace flat pink header with glassmorphism header. Logo PNG + Sohne "Lustre" left, 4 centered nav links (Discover, Connect, Explore, Learn), right side: notification bell + avatar dropdown (Profile, Settings, SafeDate, Vault, Logout). Sticky, z-index 100.

### Testgate Wave 2:
- [ ] Mobile app shows exactly 5 bottom tabs with correct icons
- [ ] Tapping each tab navigates to the correct nested stack
- [ ] All previously accessible screens remain reachable via the new structure
- [ ] Web header uses glassmorphism with backdrop-filter blur
- [ ] Web header avatar dropdown shows all 5 items and navigates correctly
- [ ] Header degrades gracefully on browsers without backdrop-filter support

---

## Wave 3: Core Components
**Status:** DONE
**Started:** 2026-03-26
**Completed:** 2026-03-26
**Epics:** 3a VERIFIED, 3b VERIFIED, 3c VERIFIED
**Learnings:** Tamagui styled() with pressStyle scale works for button animations without Reanimated. ModalBase/BottomSheetBase use RN Animated for cross-platform spring physics; web glassmorphism via backdrop-filter would need platform-specific overlay.

### Parallelization groups:
**Group A (parallel):**
- wave-3a-card-components (haiku) — Redesign PostCard, ProfileCard, GroupCard, OrgCard: remove all borders, add copper-tinted shadows, warmCream background, borderRadius 16. Consistent card API via shared CardBase component.
- wave-3b-button-inputs (haiku) — Redesign LustreButton: borderRadius 12, gold fill for primary CTA, copper for secondary, scale 0.95 press animation (Reanimated). Redesign text inputs: warm tones, copper focus ring, rounded corners.
- wave-3c-modals-sheets (haiku) — Redesign modal/bottom sheet overlays: glassmorphism backdrop, slide-up spring animation, warmCream content background, rounded top corners (20px). Shared ModalBase and BottomSheetBase components.

### Testgate Wave 3:
- [x] All card components render without visible borders, using shadow-only depth
- [x] Cards display warmCream background and borderRadius 16
- [x] Primary button uses gold fill, secondary uses copper outline
- [x] Button press shows visible scale animation
- [x] Modals use glassmorphism overlay on supported platforms
- [x] Bottom sheets animate with spring physics

---

## Wave 4: Discover Screen Redesign
**Status:** DONE
**Started:** 2026-03-26
**Completed:** 2026-03-26
**Epics:** 4a VERIFIED, 4b VERIFIED
**Learnings:** @tamagui/linear-gradient works for SwipeCard gradient overlay on RN. Web uses raw CSS linear-gradient div. Tamagui hoverStyle needs Tamagui props (backgroundColor), not CSS style objects.

### Parallelization groups:
**Group A (sequential):**
- wave-4a-swipe-reanimated (sonnet) — Rewrite DiscoverScreen swipe mechanics using React Native Reanimated 3 + Gesture Handler. Fullscreen cards (90% width, 75% height), photo covers entire card, gradient overlay from bottom. Rotation +/-15 degrees, spring snap-back (damping 20, stiffness 90), fly-off 200ms. Like/Nope stamps with glow effect. Stacked cards visible behind (scale 0.95, 0.90).
- wave-4b-discover-web (haiku) — Update web discover page to match new card styling. Gradient overlay on profile images, copper-tinted action buttons, warm backgrounds. Like/Pass circles with copper border, gold fill on hover/press.

### Testgate Wave 4:
- [x] Swipe cards use Reanimated 3 (no Animated.ValueXY references remain)
- [x] Card rotation reaches +/-15 degrees at full swipe
- [x] Snap-back animation uses spring physics (not linear/bezier)
- [x] Fly-off animation completes in approximately 200ms
- [x] Like/Nope stamp overlays appear during swipe with glow
- [x] Stacked cards behind current card are visible at reduced scale
- [x] Web discover page shows gradient overlay on profile images

---

## Wave 5: Profile Redesign
**Status:** DONE
**Started:** 2026-03-26
**Completed:** 2026-03-26
**Epics:** 5a VERIFIED, 5b VERIFIED, 5c VERIFIED
**Learnings:** PROMPT_OPTIONS duplicated in services/api (backend) and packages/api (frontend) — both needed since they serve different contexts. BottomSheetBase from @lustre/ui reused for PromptPicker.

### Parallelization groups:
**Group A (sequential):**
- wave-5a-prompt-schema (haiku) — Add ProfilePrompt Prisma model (id, profileId, promptKey, response, order, createdAt). Add PromptKey enum with curated prompt options. tRPC: profile.getPrompts, profile.setPrompts (upsert up to 3). Seed 10+ prompt options in Swedish.
- wave-5b-profile-view (haiku) — Rebuild profile view as scrollable full-page: photos interspersed with prompt responses, each section individually likeable (heart icon). Gradient overlay on photos. Like on prompt/photo starts conversation with context. Works on both mobile and web.

**Group B (after A):**
- wave-5c-profile-edit (haiku) — Rebuild profile edit: prompt selector (choose 3 from list), drag-to-reorder photos and prompts, preview mode. Photo upload unchanged (existing R2 pipeline). Deprecate free-text bio field in UI (keep in API).

### Testgate Wave 5:
- [x] ProfilePrompt model exists with all fields and migration applies
- [x] User can set up to 3 prompts via tRPC
- [x] Profile view renders as scrollable page with photos and prompts interspersed
- [x] Each photo and prompt section has a working like button
- [x] Liking a prompt or photo includes context in conversation initiation
- [x] Profile edit allows selecting and reordering 3 prompts
- [x] Free-text bio field is hidden in new UI but API still returns it

---

## Wave 6: Animations, Haptics & Polish
**Status:** DONE
**Started:** 2026-03-26
**Completed:** 2026-03-26
**Epics:** 6a VERIFIED, 6b VERIFIED, 6c VERIFIED
**Learnings:** Lottie conditionally loaded via try/catch require() for web fallback. expo-haptics only works on native — Platform.OS check required. Pull-to-refresh copper color set via tintColor (iOS) + colors (Android).

### Parallelization groups:
**Group A (parallel):**
- wave-6a-match-animation (haiku) — Replace basic scale/opacity match animation with Lottie animation + haptic feedback + copper shimmer effect. Design copper/gold themed Lottie JSON. Haptic pattern: medium impact on match reveal, light on dismiss.
- wave-6b-micro-interactions (haiku) — Add spring-physics micro-interactions: button press (scale 0.95, damping 10, stiffness 200), navigation shared element transitions, list item press feedback, pull-to-refresh with copper spinner. Haptic feedback on key actions.

**Group B (after A):**
- wave-6c-dark-mode-polish (haiku) — Audit all screens in dark mode. Fix any hardcoded colors. Verify warm dark tones (#1A1614 bg, #2C2421 surface, #3D332E surfaceUp). Ensure goldBright (#E8B84B) is used as accent in dark mode. Test copper readability on dark surfaces.

### Testgate Wave 6:
- [x] Match animation plays a Lottie animation (not just scale/opacity)
- [x] Haptic feedback fires on match reveal
- [x] Button press animation uses spring physics
- [x] All screens render correctly in dark mode with warm dark tones
- [x] No hardcoded white (#FFFFFF) or black (#000000) colors remain in themed components
- [x] Dark mode accent color is goldBright (#E8B84B)
