# Epic: wave-2b-oauth-google-apple
**Model:** sonnet
**Wave:** 2
**Group:** A (parallel with wave-2a)

## Goal
Implement Google and Apple OAuth login. Verify ID tokens server-side, link OAuth accounts to existing users via the oauth_accounts table, and handle the case where an OAuth email has no Lustre account (redirect to registration).

## Codebase Context

### OAuthAccount table (from wave-1a)
`services/api/prisma/schema.prisma` — OAuthAccount model with provider, providerId, userId, email

### Google OAuth flow
1. Client obtains ID token via Google Sign-In SDK (mobile: expo-auth-session, web: @react-oauth/google)
2. Client sends ID token to API
3. API verifies token with Google's public keys (`https://www.googleapis.com/oauth2/v3/tokeninfo`)
4. Extract: sub (providerId), email, email_verified
5. Look up oauth_accounts for (provider="google", providerId=sub)
6. If found: generate JWT pair for linked userId
7. If not found but email matches existing user: create oauth_account link, generate JWT
8. If not found and no matching email: return error indicating registration required

### Apple Sign In flow
1. Client obtains identity token via Apple Sign In (mobile: expo-apple-authentication, web: apple-signin-auth)
2. Client sends identity token to API
3. API verifies token with Apple's public keys (`https://appleid.apple.com/auth/keys`)
4. Extract: sub (providerId), email (may be private relay)
5. Same linking logic as Google

### Token verification
- Google: verify JWT signature against Google JWKS, check iss, aud (GOOGLE_CLIENT_ID), exp
- Apple: verify JWT signature against Apple JWKS, check iss (`https://appleid.apple.com`), aud (APPLE_CLIENT_ID), exp

### Env vars
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google OAuth
- `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` — Apple Sign In

## Acceptance Criteria
1. `services/api/src/auth/oauth.ts` created with `verifyGoogleToken(idToken)` and `verifyAppleToken(identityToken)` functions
2. Google token verification validates signature against Google JWKS, checks issuer and audience
3. Apple token verification validates signature against Apple JWKS, checks issuer and audience
4. Auth router has `loginWithGoogle` mutation: accepts idToken, verifies, links or finds oauth_account, returns JWT pair
5. Auth router has `loginWithApple` mutation: accepts identityToken, verifies, links or finds oauth_account, returns JWT pair
6. OAuth login for unregistered email returns structured error with `code: "REGISTRATION_REQUIRED"`
7. Env vars (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`) added to env validation
8. No TODO/FIXME comments

## Files to Create/Edit
- `services/api/src/auth/oauth.ts` (CREATE)
- `services/api/src/trpc/auth-router.ts` (EDIT — add OAuth mutations)
- `services/api/src/lib/env.ts` (EDIT — add OAuth env vars)
