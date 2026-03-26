# Epic: wave-1b-spar-service
**Model:** haiku
**Wave:** 1
**Group:** B (parallel, after wave-1a)

## Goal
Create the SPAR lookup service that calls Roaring.io with a name + phone number, retrieves the person's birthdate, and performs age verification (18+).

## Codebase Context

### Auth module location
`services/api/src/auth/` — existing files: `jwt.ts`, `crypto.ts`, `swish.ts`

### Roaring.io API
Roaring.io provides Swedish SPAR (Statens Personadressregister) lookups. The API accepts name + phone number and returns person data including birthdate.

Endpoint: `https://api.roaring.io/se/person/lookup`
Auth: Bearer token via `ROARING_API_KEY`
Request: `{ name: string, phone: string }`
Response includes: `{ birthDate: "YYYY-MM-DD", firstName: string, lastName: string, ... }`

### Env var
`ROARING_API_KEY` — loaded from `services/api/src/lib/env.ts` (add to env validation schema)

### Age calculation
Calculate age from birthDate. Must be >= 18 on the current date. Use UTC dates to avoid timezone issues.

## Acceptance Criteria
1. `services/api/src/auth/spar.ts` created with `lookupSpar(name: string, phone: string)` function
2. Function calls Roaring.io API with correct auth header and request body
3. Function returns `{ birthDate: string, firstName: string, lastName: string, isAdult: boolean, age: number }`
4. Age calculation correctly determines >= 18 using birthDate
5. Function throws typed error on API failure with retry logic (max 3 attempts, exponential backoff)
6. Function throws typed error when person not found in SPAR
7. `ROARING_API_KEY` added to env validation in `services/api/src/lib/env.ts`
8. No TODO/FIXME comments

## Files to Create/Edit
- `services/api/src/auth/spar.ts` (CREATE)
- `services/api/src/lib/env.ts` (EDIT — add ROARING_API_KEY)
