# Epic: wave-3b-profile-screens-web
**Model:** haiku
**Wave:** 3, Group A (parallel)

## Description
Build web profile pages: onboarding wizard, profile view page, profile edit page, photo gallery.

## Acceptance Criteria
1. Onboarding wizard at /onboarding with same 5 steps as mobile, using shared components from packages/app where possible
2. Profile view page at /profile showing user's own profile
3. Profile view page at /profile/[userId] showing another user's public profile
4. Profile edit page at /profile/edit
5. Photo upload with drag-and-drop support
6. Responsive design — works on mobile and desktop viewports
7. Reuse shared screens/components from packages/app/src/screens/ and components/
8. Navigation: redirect to /onboarding after auth if no profile exists

## File Paths
1. `apps/web/app/(app)/onboarding/page.tsx` — onboarding wizard
2. `apps/web/app/(app)/profile/page.tsx` — own profile view (update existing)
3. `apps/web/app/(app)/profile/[userId]/page.tsx` — public profile view
4. `apps/web/app/(app)/profile/edit/page.tsx` — profile edit
5. `packages/app/src/components/OnboardingWizard.tsx` — shared wizard logic
6. `packages/app/src/components/ProfileCard.tsx` — shared profile display card

## Context
- Next.js 16 with app router in apps/web/app/
- (app) group has auth-guard.tsx and providers.tsx
- (landing) group for public marketing pages
- Use Tamagui for styling (shared with mobile)
- tRPC hooks available via packages/api
- Shared components preferred — put reusable UI in packages/app/src/components/
