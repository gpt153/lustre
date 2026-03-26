# Epic: wave-1a-listing-schema

**Model:** haiku
**Wave:** 1
**Group:** A (first in sequence)

## Description

Add Prisma schema models and migration for the Marketplace feature: Listing, ListingImage, ListingCategory enum, Order, OrderStatus enum, ShippingOption enum. The marketplace is P2P anonymous — buyers/sellers never see each other's real names.

## Acceptance Criteria

1. `ListingCategory` enum added to schema with values: UNDERWEAR, TOYS, FETISH_ITEMS, HANDMADE_GOODS, ACCESSORIES, CLOTHING, OTHER
2. `ShippingOption` enum added: STANDARD_POST, EXPRESS_POST, PICKUP
3. `OrderStatus` enum added: PLACED, PAID, SHIPPED, DELIVERED, COMPLETED, CANCELLED, DISPUTED
4. `Listing` model: id (uuid), sellerId (userId FK), title (String), description (String @db.Text), price (Int — öre/cents in SEK), category (ListingCategory), shippingOptions (ShippingOption[] default []), status (ListingStatus enum: ACTIVE, SOLD, REMOVED), createdAt, updatedAt. @@map("listings")
5. `ListingStatus` enum added: ACTIVE, SOLD, REMOVED
6. `ListingImage` model: id (uuid), listingId (FK), url (String), order (Int default 0), createdAt. @@map("listing_images"). @@index([listingId])
7. `Order` model: id (uuid), listingId (FK), buyerId (userId FK), sellerId (userId FK), status (OrderStatus), amountSEK (Int — price in öre), commissionSEK (Int — 10% of amount), shippingOption (ShippingOption), trackingNumber (String?), placedAt (DateTime default now), paidAt (DateTime?), shippedAt (DateTime?), deliveredAt (DateTime?), completedAt (DateTime?), autoConfirmAt (DateTime? — set to placedAt+7d when shipped), createdAt, updatedAt. @@map("orders")
8. User model gets `listings Listing[]` and `buyerOrders Order[] @relation("BuyerOrders")` and `sellerOrders Order[] @relation("SellerOrders")` relations
9. Migration file created at `services/api/prisma/migrations/20260326200000_add_marketplace/migration.sql` with correct SQL for all new enums and tables
10. `npx prisma generate` passes (schema is syntactically valid)

## File Paths

- `services/api/prisma/schema.prisma` (add models and enums)
- `services/api/prisma/migrations/20260326200000_add_marketplace/migration.sql` (new)
