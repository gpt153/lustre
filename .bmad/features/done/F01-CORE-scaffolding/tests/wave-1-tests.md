# Test Specification: F01 Wave 1 — Monorepo & App Shells

## API Tests
- N/A (no API in wave 1)

## Build Tests
- [ ] `pnpm install` from clean clone completes without errors
- [ ] `pnpm turbo build` compiles all packages (exit code 0)
- [ ] `pnpm turbo typecheck` passes for all packages
- [ ] `pnpm turbo lint` passes for all packages

## Mobile App Tests
- [ ] Expo dev server starts without errors
- [ ] App renders on iOS simulator (splash screen visible)
- [ ] App renders on Android emulator (splash screen visible)
- [ ] Tab navigation between Home, Discover, Chat, Profile works
- [ ] Tamagui components display with Lustre brand colors (#E91E63 primary)

## Web App Tests
- [ ] Next.js dev server starts on :3000
- [ ] View source shows server-rendered HTML
- [ ] Navigation between pages works
- [ ] Tamagui CSS extraction produces optimized styles
- [ ] Meta tags present in HTML head (title: "Lustre")

## Integration Tests
- [ ] @lustre/ui Button component renders identically on web and mobile
- [ ] Shared hook from @lustre/app importable by both apps
- [ ] TypeScript path aliases (@lustre/*) resolve in all packages
