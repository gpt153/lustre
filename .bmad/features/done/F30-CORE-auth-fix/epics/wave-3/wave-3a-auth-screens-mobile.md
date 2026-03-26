# Epic: wave-3a-auth-screens-mobile
**Model:** haiku
**Wave:** 3
**Group:** A (parallel with wave-3b)

## Goal
Update Expo mobile auth screens: replace BankID launch with Swish payment initiation, add SPAR loading state, add email/password setup step, update login screen with email/password form + Google + Apple OAuth buttons.

## Codebase Context

### Current mobile auth screens
`apps/mobile/app/(auth)/` — currently has BankID flow screens (welcome, BankID launch, Swish payment, display name). BankID screen must be replaced.

### Shared auth store
`packages/app/src/stores/authStore.ts` — Zustand store, shared between mobile/web. Needs new methods: `loginWithEmail(email, password)`, `loginWithGoogle(idToken)`, `loginWithApple(identityToken)`, `completeRegistration(tempToken, email, password)`.

### Shared auth hooks
`packages/app/src/hooks/` — may contain useAuth or similar. Update to expose new login methods.

### New registration flow (mobile):
1. `welcome.tsx` — Welcome screen with "Create Account" and "Log In" buttons
2. `swish-verify.tsx` — Initiates Swish payment (opens Swish app via deep link), shows loading while waiting for callback
3. `verify-loading.tsx` — Shows "Verifying your identity..." while SPAR lookup runs
4. `set-credentials.tsx` — Email + password form (after Swish+SPAR success)
5. `display-name.tsx` — Choose display name (existing, keep)
6. `done.tsx` — Registration complete

### New login flow (mobile):
- `login.tsx` — Email/password form + "Continue with Google" + "Continue with Apple" buttons + "Forgot password?" link

### OAuth on mobile
- Google: `expo-auth-session` with Google provider
- Apple: `expo-apple-authentication` (iOS only, hide on Android)

## Acceptance Criteria
1. BankID launch screen removed from `apps/mobile/app/(auth)/`
2. New `swish-verify.tsx` screen initiates Swish payment and waits for callback
3. New `verify-loading.tsx` shows SPAR verification progress
4. New `set-credentials.tsx` collects email + password after verification
5. `login.tsx` has email/password form, Google OAuth button, Apple OAuth button (iOS only)
6. `packages/app/src/stores/authStore.ts` updated with `loginWithEmail`, `loginWithGoogle`, `loginWithApple`, `completeRegistration` methods
7. Registration flow order: welcome -> swish-verify -> verify-loading -> set-credentials -> display-name -> done
8. No BankID references remain in mobile auth screens

## Files to Create/Edit
- `apps/mobile/app/(auth)/swish-verify.tsx` (CREATE or EDIT)
- `apps/mobile/app/(auth)/verify-loading.tsx` (CREATE)
- `apps/mobile/app/(auth)/set-credentials.tsx` (CREATE)
- `apps/mobile/app/(auth)/login.tsx` (EDIT)
- `packages/app/src/stores/authStore.ts` (EDIT)
