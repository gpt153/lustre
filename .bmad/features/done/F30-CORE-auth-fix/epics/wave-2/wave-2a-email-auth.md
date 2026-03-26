# Epic: wave-2a-email-auth
**Model:** haiku
**Wave:** 2
**Group:** A (parallel with wave-2b)

## Goal
Implement email/password authentication: registration step (set email + password after Swish verification), login, and password reset flow.

## Codebase Context

### Auth module
`services/api/src/auth/` — jwt.ts exists with `generateTokens()`, crypto.ts exists

### Password hashing
Use bcrypt with cost factor 12. Import from `bcrypt` package (already in dependencies or add).

### Login flow
1. User submits email + password
2. Find user by email
3. Verify bcrypt hash
4. Return JWT access + refresh tokens via existing `generateTokens(userId)`

### Registration completion
After Swish+SPAR verification (wave-1c), user has a temporary token. They use it to:
1. Set email (unique check) + password
2. User status updated from PENDING_EMAIL to ACTIVE
3. Full JWT pair returned

### Password reset
1. User requests reset with email
2. Generate random token (crypto.randomBytes), store hashed in DB with 1h expiry
3. Send email (placeholder — email service TBD, log token for now)
4. User submits token + new password
5. Verify token, update passwordHash, invalidate token

### Rate limiting
Login: 5 attempts per 15 min per IP. Use existing Fastify rate-limit plugin.

## Acceptance Criteria
1. `services/api/src/auth/email.ts` created with `hashPassword(password)`, `verifyPassword(password, hash)`, `generateResetToken()`, `verifyResetToken(token, hash)`
2. Auth router has `completeRegistration` mutation: accepts temp token + email + password, sets email/passwordHash, activates user, returns JWT pair
3. Auth router has `loginWithEmail` mutation: accepts email + password, returns JWT pair on success
4. Auth router has `requestPasswordReset` mutation: accepts email, generates token, stores hashed token with 1h expiry
5. Auth router has `resetPassword` mutation: accepts token + new password, updates passwordHash
6. Rate limiting configured: login endpoint max 5 per 15min per IP
7. Password validation: minimum 8 characters enforced via Zod schema
8. No TODO/FIXME comments

## Files to Create/Edit
- `services/api/src/auth/email.ts` (CREATE)
- `services/api/src/trpc/auth-router.ts` (EDIT — add login/reset mutations)
- `services/api/package.json` (EDIT — add bcrypt if not present)
