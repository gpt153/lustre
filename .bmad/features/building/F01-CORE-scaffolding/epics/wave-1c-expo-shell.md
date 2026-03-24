# Epic: Expo Mobile App Shell | Wave-1c

**Wave:** 1
**Model:** haiku
**Dependencies:** wave-1a, wave-1b

## Description

Create the Expo mobile app in apps/mobile using Expo Router for file-based navigation. Configure Tamagui provider from @lustre/ui, set up the app layout with a tab navigator (Home, Discover, Chat, Profile placeholders), configure splash screen and app icon, and set up EAS build configuration. The app should launch on both iOS and Android simulators showing the placeholder home screen with Lustre branding.

## File paths
1. apps/mobile/package.json
2. apps/mobile/app.json
3. apps/mobile/app/_layout.tsx
4. apps/mobile/app/(tabs)/_layout.tsx
5. apps/mobile/app/(tabs)/index.tsx
6. apps/mobile/eas.json
7. apps/mobile/metro.config.js

## Implementation steps
1. Create apps/mobile with `npx create-expo-app@latest` using blank-typescript template
2. Install dependencies: expo-router, @lustre/ui, @lustre/app, @lustre/api, tamagui, react-native-reanimated, react-native-gesture-handler, react-native-safe-area-context
3. Configure metro.config.js for monorepo workspace resolution (watchFolders pointing to packages/)
4. Create app/_layout.tsx with TamaguiProvider wrapping the root Stack navigator
5. Create app/(tabs)/_layout.tsx with bottom tab navigator: Home, Discover, Chat, Profile icons
6. Create app/(tabs)/index.tsx as Home screen with Lustre logo and "Coming Soon" text using Tamagui components
7. Create placeholder screens for Discover, Chat, Profile tabs
8. Configure app.json with: name "Lustre", slug "lustre", scheme "lustre", ios.bundleIdentifier "com.lovelustre.app", android.package "com.lovelustre.app"
9. Create eas.json with development, preview, production build profiles
10. Test: `npx expo start` launches dev server, app renders on simulator

## Acceptance Criteria
1. `npx expo start` launches without errors
2. App displays splash screen then navigates to Home tab
3. Bottom tab navigation works between all four tabs
4. Tamagui components from @lustre/ui render correctly (brand colors visible)
5. EAS build config valid (eas build --platform ios --profile preview passes validation)
