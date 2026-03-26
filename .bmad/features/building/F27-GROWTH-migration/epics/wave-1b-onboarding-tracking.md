# Epic: wave-1b-onboarding-tracking
**Model:** haiku
**Wave:** 1, Group A

## Goal
Add step-completion tracking to the `OnboardingWizard` so we can measure drop-off rates across the 5-step onboarding funnel.

## Context
- Wizard: `packages/app/src/components/OnboardingWizard.tsx`
- Web onboarding page: `apps/web/app/(app)/onboarding/page.tsx`
- Root layout has Umami analytics: `apps/web/app/layout.tsx`
- The wizard is shared (mobile + web). Use an optional callback prop so mobile can ignore tracking.
- Tracking approach: optional `onStep?: (step: number, stepName: string) => void` prop in the wizard; web page wires it to `window.umami?.track()`

## Acceptance Criteria
1. `OnboardingWizard` accepts a new optional prop: `onStep?: (step: number, stepName: string) => void`
2. Step names map: 1→'basics', 2→'identity', 3→'preferences', 4→'photos', 5→'bio'
3. `onStep` is called immediately when a step becomes active (on mount for step 1, and after each `setStep` call)
4. `onStep` is also called with step=6, stepName='complete' when `onComplete` fires
5. In `apps/web/app/(app)/onboarding/page.tsx`, pass `onStep` to `OnboardingWizard`:
   - Call `window.umami?.track('onboarding_step', { step, stepName })` for steps 1-5
   - Call `window.umami?.track('onboarding_complete')` for step 6 / complete
6. No TypeScript errors — declare `window.umami` as `{ track: (event: string, props?: Record<string, unknown>) => void } | undefined` in the page file (not globally)
7. No changes to mobile app files

## File Paths
- `packages/app/src/components/OnboardingWizard.tsx` — EDIT (add onStep prop + calls)
- `apps/web/app/(app)/onboarding/page.tsx` — EDIT (wire onStep to umami)
