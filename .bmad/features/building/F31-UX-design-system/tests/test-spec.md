# Test Spec: F31-UX-design-system

## Wave 1 Tests

### T1: Color tokens resolve correctly
- Import tamagui config — verify all 12 color tokens exist with correct hex values
- Render a component with `backgroundColor="$copper"` in light mode — verify rendered color is #B87333
- Render same component in dark mode — verify `$copper` resolves to `$copperLight` (#D4A574) as mapped in dark theme
- Verify `$warmWhite` (#FDF8F3) is the light mode background (not #FFFFFF)
- Verify dark mode background is #1A1614 (not #121212)

### T2: Theme sub-themes for vanilla/spicy
- Apply `light_vanilla` sub-theme — verify `$modeAccent` resolves to sage (#7A9E7E)
- Apply `light_spicy` sub-theme — verify `$modeAccent` resolves to ember (#E05A33)
- Apply `dark_vanilla` sub-theme — verify sage accent is readable on dark background
- Apply `dark_spicy` sub-theme — verify ember accent is readable on dark background

### T3: Typography rendering
- Render heading text — verify fontFamily includes "GeneralSans" (or "General Sans")
- Render body text — verify fontFamily includes "Inter"
- Render brand text — verify letter-spacing is applied (2px or equivalent)
- Verify no `createInterFont` calls remain in tamagui config

### T4: Logo integration
- Render LustreLogo with variant='light' — verify white-bg logo PNG and charcoal text render
- Render LustreLogo with variant='dark' — verify transparent-bg logo PNG and warmCream text render
- Verify logo height prop works (default 32px, custom 48px)
- Verify favicon exists at correct web path

### T5: Font loading (no FOUT)
- On mobile: verify fonts are loaded before splash screen hides (expo-font useFonts returns true)
- On web: verify General Sans has `display: swap` and preload link in document head

## Wave 2 Tests

### T6: Mobile 5-tab navigation
- Launch mobile app — verify exactly 5 bottom tabs are visible
- Tap each tab — verify it navigates to the correct initial screen
- Verify Discover tab default screen shows the swipe/feed view
- Verify Connect tab default screen shows chat list
- Verify Explore tab default screen shows the hub with links to groups, orgs, events, shop
- Verify Learn tab default screen shows module list
- Verify Profile tab default screen shows profile view

### T7: Mobile nested navigation
- From Discover tab, navigate to Search — verify search screen loads within the tab (tab bar stays visible)
- From Connect tab, open a conversation — verify chat room loads within the tab
- From Explore tab, navigate to Groups then to a specific group — verify back navigation returns to groups list
- From Learn tab, navigate to Coach then start a session — verify coach session loads within the tab
- From Profile tab, navigate to Settings — verify settings screen loads within the tab

### T8: Web header glassmorphism
- Load web app — verify header has backdrop-filter CSS property with blur and saturate values
- Verify header background color is rgba(44,36,33,0.85)
- Verify header is sticky (position: sticky, top: 0)
- Verify header z-index is 100
- Verify logo PNG is visible at approximately 32px height
- Verify 4 center nav links are present: Discover, Connect, Explore, Learn

### T9: Web header dropdown
- Click avatar in header — verify dropdown opens with 5 items
- Click each dropdown item — verify it navigates to correct route (Profile, Settings, SafeDate, Vault, Logout)
- Click outside dropdown — verify it closes
- Verify notification bell icon is present

### T10: Glassmorphism fallback
- Simulate browser without backdrop-filter support (CSS @supports check) — verify header background becomes more opaque (rgba(44,36,33,0.95))

## Wave 3 Tests

### T11: Card components — no borders
- Render PostCard — verify no borderWidth or borderColor CSS/style is applied
- Verify PostCard has box-shadow or shadowColor with copper tint (#C4956A)
- Verify PostCard backgroundColor is warmCream in light mode
- Verify PostCard borderRadius is 16

### T12: Card elevation levels
- Render CardBase with elevation=1 — verify shadowRadius is 8
- Render CardBase with elevation=2 — verify shadowRadius is 12
- Render CardBase with elevation=3 — verify shadowRadius is 16
- Verify all elevations use copperMuted (#C4956A) as shadow color

### T13: Button redesign
- Render LustreButton variant="primary" — verify backgroundColor is gold (#D4A843)
- Render LustreButton variant="secondary" — verify copper border, transparent background
- Render LustreButton variant="danger" — verify ember (#E05A33) background
- Verify borderRadius is 12 on all variants

### T14: Button press animation
- Press LustreButton — verify scale animates to 0.95 (via Reanimated animated style)
- Release button — verify scale animates back to 1.0 with spring physics
- Verify animation uses withSpring (not withTiming or legacy Animated)

### T15: Modal glassmorphism
- Open ModalBase — verify backdrop has blur effect
- Verify modal content has warmCream background and borderRadius 20
- Tap backdrop — verify modal closes (onClose called)
- Open BottomSheetBase — verify slide-up spring animation plays
- Verify drag handle is visible at top of bottom sheet

## Wave 4 Tests

### T16: Reanimated swipe — basic gesture
- Pan card right 50px — verify card rotates clockwise (positive rotation)
- Pan card left 50px — verify card rotates counter-clockwise (negative rotation)
- Pan card 150px right — verify Like stamp appears with green glow
- Pan card 150px left — verify Nope stamp appears with red/ember glow
- Release card below threshold — verify it snaps back to center with spring animation

### T17: Reanimated swipe — threshold and fly-off
- Pan card right past 100px offset and release — verify card flies off screen right
- Pan card with velocity >500px/s right and release — verify card flies off (velocity threshold)
- Verify fly-off animation duration is approximately 200ms
- After fly-off, verify next card animates into position (scale from 0.95 to 1.0)

### T18: Card visual design
- Verify swipe card dimensions are approximately 90% screen width and 75% screen height
- Verify photo covers entire card (no white space around photo)
- Verify gradient overlay is present on bottom portion of card
- Verify name, age, and distance text are visible over gradient in white
- Verify 2 stacked cards are visible behind current card at reduced scale

### T19: Legacy API removal
- Search DiscoverScreen for `Animated.ValueXY` — verify zero occurrences
- Search DiscoverScreen for `PanResponder` — verify zero occurrences
- Search DiscoverScreen for `Animated.event` — verify zero occurrences

### T20: Web discover styling
- Load web discover page — verify background is warmWhite (not pure white)
- Verify profile cards have gradient overlay on images
- Verify Like/Pass buttons use copper/gold colors (not pink)
- Verify no #E91E63 appears in the web discover page styles

## Wave 5 Tests

### T21: Prompt schema
- Create a ProfilePrompt with valid promptKey and response — verify stored correctly
- Attempt to create prompt with invalid promptKey — verify validation error
- Attempt to create 4th prompt (order=4) — verify rejected (max 3)
- Call profile.getPrompts — verify returns array of user's prompts
- Call profile.setPrompts with 3 prompts — verify all 3 upserted correctly
- Verify existing bio field on Profile is not affected

### T22: Profile view layout
- Load profile view — verify it renders as a scrollable page (not a card grid)
- Verify first photo is full-width with gradient overlay
- Verify prompt responses appear between photos
- Verify each photo section has a heart/like button
- Verify each prompt section has a heart/like button

### T23: Profile prompt interactions
- Like a specific photo via heart button — verify like action includes `{ type: 'photo', photoId }`
- Like a specific prompt via heart button — verify like action includes `{ type: 'prompt', promptKey }`
- If like creates a match — verify conversation includes context of liked content

### T24: Profile edit with prompts
- Open profile edit — verify "Prompts" section with 3 slots is visible
- Tap "Add prompt" — verify picker opens with all available prompt options
- Select a prompt and write response — verify it appears in the slot
- Save profile — verify prompts are persisted (profile.setPrompts called)
- Verify free-text bio field is NOT shown in the edit UI

## Wave 6 Tests

### T25: Match animation
- Trigger a match — verify Lottie animation plays (not just scale/opacity)
- Verify haptic feedback fires during match animation
- Verify copper shimmer effect is visible on matched profile photos
- Verify "It's a Match!" text appears in gold color
- Verify animation auto-dismisses after approximately 4 seconds

### T26: Match animation fallback
- Mock lottie-react-native to fail loading — verify match still displays (fallback animation)
- Verify match is never blocked by animation failure

### T27: Micro-interactions
- Press a button — verify haptic feedback fires
- Verify pull-to-refresh indicator is copper-colored (not default blue/gray)
- Switch tabs — verify active tab icon has a brief scale bounce
- Tap like button — verify heart scales up then back with spring

### T28: Dark mode audit
- Switch to dark mode — navigate through all major screens (Discover, Connect, Explore, Learn, Profile)
- On each screen, verify no pure white (#FFFFFF) backgrounds or elements appear
- Verify no pure black (#000000) text appears
- Verify background is #1A1614 on all screens
- Verify card/surface backgrounds are #2C2421
- Verify accent color (buttons, links, badges) is goldBright (#E8B84B)
- Verify copper text uses copperLight (#D4A574) for adequate contrast

### T29: Old color removal
- Search entire codebase for #E91E63 — verify zero occurrences in non-comment, non-documentation code
- Search for `#121212` and `#1E1E1E` (old Material dark colors) — verify zero occurrences in themed components
- Search for `backgroundColor: '#FFFFFF'` or `background: '#fff'` — verify zero occurrences in themed components
