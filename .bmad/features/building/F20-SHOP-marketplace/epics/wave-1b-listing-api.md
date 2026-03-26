# Epic: wave-1b-listing-api

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — after 1a)

## Description

Create the tRPC listing router for the marketplace. Sellers can create and manage listings. Buyers can browse, search, and filter by category.

## Acceptance Criteria

1. `listing.create` — protectedProcedure, input: title (string max 100), description (string max 2000), price (number, int, min 100 — öre), category (ListingCategory), shippingOptions (ShippingOption[] min 1), imageUrls (string[] max 8). Creates Listing with sellerId=ctx.userId, status=ACTIVE, creates ListingImage records. Returns created listing with images.
2. `listing.update` — protectedProcedure, input: id, optional title/description/price/category/shippingOptions/imageUrls. Only own listing. Deletes old images and re-creates if imageUrls provided. Returns updated listing.
3. `listing.remove` — protectedProcedure, input: id. Only own listing. Sets status=REMOVED. Returns {success: true}.
4. `listing.list` — publicProcedure (no auth required), input: cursor (optional string), limit (default 20 max 50), category (optional ListingCategory), search (optional string). Returns active listings with images, seller displayName (from User.displayName), cursor pagination ordered by createdAt desc. Search filters by title ILIKE %search%.
5. `listing.getById` — publicProcedure, input: id. Returns listing with images and seller displayName (NOT real name — use User.displayName which is the chosen anonymous handle). Throws NOT_FOUND if listing doesn't exist or is REMOVED.
6. `listing.getByCategory` — publicProcedure, input: category (ListingCategory), cursor (optional), limit (default 20). Returns active listings in that category, same shape as listing.list.
7. `listing.getMine` — protectedProcedure. Returns all listings by ctx.userId (all statuses), with images, ordered by createdAt desc.
8. `listingRouter` exported from `services/api/src/trpc/listing-router.ts` and registered in `appRouter` as `listing`.

## File Paths

- `services/api/src/trpc/listing-router.ts` (new)
- `services/api/src/trpc/router.ts` (add listingRouter import and registration)
