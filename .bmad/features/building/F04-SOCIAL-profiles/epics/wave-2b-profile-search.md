# Epic: wave-2b-profile-search
**Model:** haiku
**Wave:** 2, Group A (parallel)

## Description
Implement Meilisearch indexing on profile create/update, and search API with filters.

## Acceptance Criteria
1. Profile documents indexed to Meilisearch on create and update with fields: id, userId, displayName, bio, age, gender, orientation, relationshipType, seeking, verified, thumbnailUrl (first photo small thumb), createdAt
2. Meilisearch index configuration: searchable attributes (displayName, bio), filterable attributes (gender, orientation, age, relationshipType, seeking, verified), sortable attributes (createdAt, age)
3. `profile.search` publicProcedure — search profiles with optional filters: gender (array), orientation (array), ageMin/ageMax, relationshipType, seeking, verified. Returns paginated results (limit/offset).
4. Profile deleted from index when user deletes their profile
5. Index sync happens via helper function called in create/update/delete flows (not event-driven for now)
6. Search returns: id, userId, displayName, age, gender, orientation, thumbnailUrl, verified — NOT full profile
7. Update `configureIndexes()` in meilisearch.ts with the new filterable/sortable/searchable attributes

## File Paths
1. `services/api/src/lib/meilisearch.ts` — update configureIndexes, add indexProfile/removeProfile helpers
2. `services/api/src/trpc/search-router.ts` — new file with search procedure
3. `services/api/src/trpc/router.ts` — register search router
4. `services/api/src/trpc/profile-router.ts` — call indexProfile after create/update

## Context
- Meilisearch client already exists in `services/api/src/lib/meilisearch.ts`
- PROFILE_INDEX constant already defined as 'profiles'
- configureIndexes() exists but only has displayName searchable and status filterable — needs expansion
- Meilisearch uses numeric filters for ranges: `age >= 18 AND age <= 30`
- Array filters: `gender IN [MAN, WOMAN]`
