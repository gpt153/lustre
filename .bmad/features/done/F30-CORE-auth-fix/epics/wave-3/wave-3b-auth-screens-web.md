# Epic: wave-3b-auth-screens-web
**Model:** haiku
**Wave:** 3
**Group:** A (parallel with wave-3a)

## Goal
Update Next.js web auth pages: replace BankID flow with Swish payment initiation, add SPAR loading state, add email/password setup step, update login page with email/password form + Google + Apple OAuth buttons.

## Codebase Context

### Current web auth pages
`apps/web/app/(auth)/` — currently has BankID flow pages. Must be replaced with Swish-first flow.

### Shared auth store
`packages/app/src/stores/authStore.ts` — same Zustand store updated in wave-3a. Web uses the same methods.

### New registration flow (web):
1. `/register` — Welcome page with "Create Account" button
2. `/register/swish` — Shows Swish QR code or phone number input for Swish payment, polls for callback
3. `/register/verifying` — Shows "Verifying your identity..." while SPAR runs
4. `/register/credentials` — Email + password form
5. `/register/display-name` — Choose display name
6. `/register/complete` — Registration complete, redirect to app

### New login flow (web):
- `/login` — Email/password form + "Continue with Google" + "Continue with Apple" buttons + "Forgot password?" link
- `/reset-password` — Password reset request form
- `/reset-password/[token]` — New password form

### OAuth on web
- Google: `@react-oauth/google` GoogleLogin component
- Apple: Sign In with Apple JS SDK

### Swish on web
Web users cannot open Swish app directly. Show Swish QR code (generated from payment request) or let user enter phone number to receive Swish push.

## Acceptance Criteria
1. BankID pages removed from `apps/web/app/(auth)/`
2. New `/register/swish` page shows Swish QR code or phone number entry, polls for payment confirmation
3. New `/register/verifying` page shows SPAR verification progress
4. New `/register/credentials` page collects email + password
5. `/login` page has email/password form, Google OAuth button, Apple OAuth button
6. `/reset-password` and `/reset-password/[token]` pages implement password reset flow
7. Registration flow order: register -> swish -> verifying -> credentials -> display-name -> complete
8. No BankID references remain in web auth pages

## Files to Create/Edit
- `apps/web/app/(auth)/register/swish/page.tsx` (CREATE)
- `apps/web/app/(auth)/register/verifying/page.tsx` (CREATE)
- `apps/web/app/(auth)/register/credentials/page.tsx` (CREATE)
- `apps/web/app/(auth)/login/page.tsx` (EDIT)
- `apps/web/app/(auth)/reset-password/page.tsx` (CREATE)
- `apps/web/app/(auth)/reset-password/[token]/page.tsx` (CREATE)
