# Epic: wave-1a-auth-schema-migration
**Model:** haiku
**Wave:** 1
**Group:** A (runs first)

## Goal
Migrate the Prisma schema to remove BankID-specific columns, add email/passwordHash to User, create OAuthAccount table, and re-key the one-person-one-account uniqueness constraint from personnummer to phone number.

## Codebase Context

### Current User model
`services/api/prisma/schema.prisma` — User model currently has BankID-related fields (criipto_sub or similar), personnummer hash for uniqueness. These must be replaced.

### Existing migration pattern
Migrations follow: `services/api/prisma/migrations/YYYYMMDDHHMMSS_description/migration.sql`

### What to add to User:
```
email        String?  @unique
passwordHash String?  @map("password_hash")
phone        String?  @unique  // from Swish, replaces personnummer as unique key
phoneHash    String?  @unique @map("phone_hash")  // SHA-256 for uniqueness check
```

### New OAuthAccount model:
```
model OAuthAccount {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  provider   String   // "google" | "apple"
  providerId String   @map("provider_id")
  email      String?
  createdAt  DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerId])
  @@map("oauth_accounts")
}
```

### User model relation to add:
```
oauthAccounts OAuthAccount[]
```

### Fields to drop from User:
- Any BankID/Criipto-specific fields (criipto_sub, personnummer_hash, etc.)

## Acceptance Criteria
1. `services/api/prisma/schema.prisma` User model has `email` (String?, unique), `passwordHash` (String?), `phone` (String?, unique), `phoneHash` (String?, unique) fields
2. `services/api/prisma/schema.prisma` has `OAuthAccount` model with id, userId, provider, providerId, email, createdAt and `@@unique([provider, providerId])`
3. User model has `oauthAccounts OAuthAccount[]` relation
4. All BankID-specific columns removed from User model (criipto_sub, personnummer_hash or equivalent)
5. Migration SQL file created at `services/api/prisma/migrations/20260326200000_auth_fix_schema/migration.sql`
6. Migration handles existing data gracefully (nullable new fields, safe drops)
7. `encrypted_identities` table unchanged (still used for AES-256 encrypted PII)
8. No TODO/FIXME comments in changed files

## Files to Create/Edit
- `services/api/prisma/schema.prisma` (EDIT — modify User, add OAuthAccount)
- `services/api/prisma/migrations/20260326200000_auth_fix_schema/migration.sql` (CREATE)
