# Test Specification: F30-CORE-auth-fix

## Wave 1 Tests — Schema Migration + SPAR + Swish Identity

### Schema Migration (FR-1)
- [ ] Migration adds `email` (String?, unique) column to User table
- [ ] Migration adds `passwordHash` (String?) column to User table
- [ ] Migration adds `phone` (String?, unique) column to User table
- [ ] Migration adds `phoneHash` (String?, unique) column to User table
- [ ] Migration creates `oauth_accounts` table with correct columns and constraints
- [ ] Migration drops BankID-specific columns (criipto_sub, personnummer_hash)
- [ ] `@@unique([provider, providerId])` constraint exists on oauth_accounts
- [ ] Existing encrypted_identities table and data unaffected

### SPAR Service (FR-3)
- [ ] `lookupSpar("John Doe", "46701234567")` returns birthdate and name (mocked API)
- [ ] SPAR lookup for person aged 18+ returns `isAdult: true`
- [ ] SPAR lookup for person aged 17 returns `isAdult: false`
- [ ] SPAR lookup for person turning 18 today returns `isAdult: true` (boundary case)
- [ ] SPAR API failure triggers retry (up to 3 attempts)
- [ ] SPAR API all-retries-exhausted throws SparLookupError
- [ ] SPAR API person-not-found throws SparNotFoundError

### Swish Identity (FR-2)
- [ ] Swish callback extracts `payerAlias` (phone) and `payerName` from payload
- [ ] Successful Swish+SPAR flow creates User with phone and phoneHash set
- [ ] Duplicate phone number (existing active account) returns 409 conflict
- [ ] Under-18 SPAR result triggers Swish refund API call
- [ ] Under-18 user is NOT created in database
- [ ] Swish callback is idempotent — duplicate callback does not create duplicate user
- [ ] Real name from SPAR stored via encryptIdentity (AES-256-GCM)
- [ ] Registration returns temporary token (15min expiry) for email setup step

## Wave 2 Tests — Email/Password + OAuth + BankID Removal

### Email/Password Auth (FR-4)
- [ ] `completeRegistration` with valid temp token + email + password activates user and returns JWT pair
- [ ] `completeRegistration` with expired temp token returns 401
- [ ] `completeRegistration` with duplicate email returns 409
- [ ] `loginWithEmail` with correct credentials returns access token (24h) + refresh token (30d)
- [ ] `loginWithEmail` with wrong password returns 401
- [ ] `loginWithEmail` rate limited after 5 failed attempts in 15min (returns 429)
- [ ] `requestPasswordReset` with valid email generates reset token (not returned in response, logged for now)
- [ ] `requestPasswordReset` with unknown email returns 200 (no information leak)
- [ ] `resetPassword` with valid token updates password hash
- [ ] `resetPassword` with expired token (>1h) returns 400
- [ ] Password must be >= 8 characters (Zod validation)
- [ ] Password stored as bcrypt hash (cost factor 12)

### OAuth (FR-5)
- [ ] `loginWithGoogle` with valid Google ID token returns JWT pair for linked user
- [ ] `loginWithGoogle` with invalid/expired token returns 401
- [ ] `loginWithGoogle` for unregistered email returns `REGISTRATION_REQUIRED` error
- [ ] `loginWithGoogle` auto-links oauth_account for existing user with matching email
- [ ] `loginWithApple` with valid Apple identity token returns JWT pair for linked user
- [ ] `loginWithApple` with invalid/expired token returns 401
- [ ] `loginWithApple` for unregistered email returns `REGISTRATION_REQUIRED` error
- [ ] OAuth account stored in oauth_accounts table with correct provider + providerId
- [ ] Multiple OAuth providers can be linked to same user

### BankID Removal (FR-6)
- [ ] `services/api/src/auth/bankid.ts` does not exist
- [ ] No references to "criipto" in services/api/ (case-insensitive grep)
- [ ] No references to "bankid" or "BankID" in services/api/ (grep)
- [ ] No CRIIPTO_* env vars in env.ts
- [ ] `pnpm build` in services/api passes cleanly

## Wave 3 Tests — Updated Auth Screens

### Mobile Screens (FR-7)
- [ ] Registration flow: welcome -> swish-verify -> verify-loading -> set-credentials -> display-name -> done
- [ ] No BankID screen exists in `apps/mobile/app/(auth)/`
- [ ] Swish verify screen initiates Swish payment (deep link or intent)
- [ ] Set credentials screen validates email format and password length
- [ ] Login screen has email/password form
- [ ] Login screen has "Continue with Google" button
- [ ] Login screen has "Continue with Apple" button (iOS only)
- [ ] Login screen has "Forgot password?" link

### Web Pages (FR-7)
- [ ] Registration flow: /register -> /register/swish -> /register/verifying -> /register/credentials -> /register/display-name -> /register/complete
- [ ] No BankID page exists in `apps/web/app/(auth)/`
- [ ] Swish page shows QR code or phone number input
- [ ] Credentials page validates email format and password length
- [ ] Login page has email/password form
- [ ] Login page has "Continue with Google" button
- [ ] Login page has "Continue with Apple" button
- [ ] Password reset pages work: request -> email -> token -> new password

### Shared (FR-7)
- [ ] authStore has `loginWithEmail(email, password)` method
- [ ] authStore has `loginWithGoogle(idToken)` method
- [ ] authStore has `loginWithApple(identityToken)` method
- [ ] authStore has `completeRegistration(tempToken, email, password)` method
- [ ] No references to "bankid" or "BankID" in packages/app/ or apps/

## Security Tests (all waves)
- [ ] JWT access token expires after 24h (existing, verify still works)
- [ ] JWT refresh token expires after 30d (existing, verify still works)
- [ ] Rate limiting on login endpoint (5/15min/IP)
- [ ] Rate limiting on registration endpoint (3/hour/IP)
- [ ] Phone number stored as SHA-256 hash for uniqueness (not plaintext in uniqueness column)
- [ ] Real name stored AES-256-GCM encrypted (not plaintext)
- [ ] OAuth tokens from Google/Apple never persisted server-side
- [ ] Password reset tokens single-use (consumed after use)
