# Epic: wave-2c-bankid-removal
**Model:** haiku
**Wave:** 2
**Group:** B (after wave-2a and wave-2b)

## Goal
Remove all BankID/Criipto code and references from the codebase now that Swish+SPAR and email/OAuth are in place.

## Codebase Context

### Files to delete
- `services/api/src/auth/bankid.ts` — entire BankID integration (Criipto/Idura)

### Files to clean up
- `services/api/src/trpc/auth-router.ts` — remove BankID-related endpoints (bankid/init, bankid/collect)
- `services/api/src/lib/env.ts` — remove CRIIPTO_DOMAIN, CRIIPTO_CLIENT_ID, CRIIPTO_CLIENT_SECRET, CRIIPTO_REDIRECT_URI
- `services/api/package.json` — remove any Criipto/BankID-specific dependencies
- `.env.example` or similar — remove Criipto env vars
- `infrastructure/helm/*/` — remove Criipto env vars from k8s secrets/configmaps if present

### Verification
After deletion, run `pnpm build` to ensure no broken imports. Search codebase for "criipto", "bankid", "BankID", "Idura" — zero results expected.

## Acceptance Criteria
1. `services/api/src/auth/bankid.ts` deleted
2. All BankID endpoints removed from auth-router.ts (bankid/init, bankid/collect, or equivalent)
3. Criipto env vars removed from env.ts validation schema
4. No remaining references to "criipto", "bankid", "BankID", or "Idura" in services/api/
5. No remaining references in packages/app/ or packages/api/
6. BankID-specific npm packages removed from package.json (if any)
7. Build passes cleanly (`pnpm build` in services/api)

## Files to Create/Edit
- `services/api/src/auth/bankid.ts` (DELETE)
- `services/api/src/trpc/auth-router.ts` (EDIT — remove BankID endpoints)
- `services/api/src/lib/env.ts` (EDIT — remove Criipto vars)
- `services/api/package.json` (EDIT — remove Criipto deps if any)
