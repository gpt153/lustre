# Epic: wave-2a-bodycontact-import
**Model:** sonnet
**Wave:** 2, Group A

## Goal
Build a BodyContact profile import feature that lets users migrate their public profile to Lustre. Must require explicit user consent and only read publicly-visible data.

## Context
- Stack: Fastify + tRPC + Prisma + Node.js
- tRPC router pattern: see `services/api/src/trpc/listing-router.ts`
- Main router: `services/api/src/trpc/router.ts` — import and add `migrationRouter` at key `migration`
- Profile model in schema: `services/api/prisma/schema.prisma` — `Profile` has bio, displayName (on User), ProfilePhoto
- Photo upload pattern: R2 via `services/api/src/routers/photo-router.ts` (look at how photos are stored)
- BodyContact public profile URL pattern: `https://www.bodycontact.com/profiles/[username]`
- Must NOT violate robots.txt — check https://www.bodycontact.com/robots.txt before fetching

## Acceptance Criteria
1. New file `services/api/src/trpc/migration-router.ts` with `migrationRouter` exported
2. `migration.previewBodyContact` (protectedProcedure): input `{ username: string }`, fetches `https://www.bodycontact.com/profiles/{username}` with a browser-like User-Agent, parses HTML with `cheerio` to extract: `bio` (profile description text, max 2000 chars), `photoUrls` (first 6 public photo `src` URLs from img tags in profile). Returns `{ username, bio, photoUrls }`. Throws `NOT_FOUND` if profile 404. Throws `BAD_REQUEST` if username contains invalid chars.
3. `migration.importBodyContact` (protectedProcedure): input `{ username: string, bio?: string, photoUrls: string[], consent: true }`. The `consent: true` field is required (literal true) — enforced by Zod `z.literal(true)`. Updates `Profile.bio` with the provided bio. Fetches each photoUrl, uploads to R2 as `profiles/{userId}/imported-{index}.webp` using sharp to convert + resize to 800x800 max, creates `ProfilePhoto` records. Returns `{ imported: number }`. Max 6 photos.
4. In `services/api/src/trpc/router.ts`: import `migrationRouter` from `./migration-router.js` and add `migration: migrationRouter` to the appRouter
5. `cheerio` added as dependency to `services/api/package.json` (add to dependencies, version `^1.0.0`)
6. New shared screen `packages/app/src/screens/MigrationScreen.tsx`: shows a form with a username input, a "Hämta profil" button, then a preview of bio + photo thumbnails with checkboxes. A consent checkbox ("Jag ger mitt samtycke till att importera denna publika profildata till Lustre"). "Importera" button calls `useMutation` on `trpc.migration.importBodyContact`. After success shows "Klar! Din profil har uppdaterats."
7. New hook `packages/app/src/hooks/useMigration.ts`: `useBodyContactPreview(username)` wraps `trpc.migration.previewBodyContact.useQuery`, `useBodyContactImport()` wraps `trpc.migration.importBodyContact.useMutation`
8. New web page `apps/web/app/(app)/settings/migration/page.tsx`: renders `<MigrationScreen />` with full width layout
9. `packages/app/src/index.ts`: export `MigrationScreen` and `useMigration`

## File Paths
- `services/api/src/trpc/migration-router.ts` — NEW
- `services/api/src/trpc/router.ts` — EDIT (add migration router)
- `services/api/package.json` — EDIT (add cheerio dep)
- `packages/app/src/screens/MigrationScreen.tsx` — NEW
- `packages/app/src/hooks/useMigration.ts` — NEW
- `packages/app/src/index.ts` — EDIT (export new)
- `apps/web/app/(app)/settings/migration/page.tsx` — NEW
