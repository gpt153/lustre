# Test Spec: Wave 1 — Matching Backend

## T1: Discovery stack returns unseen profiles matching filters
- Call `match.getDiscoveryStack` as authenticated user
- Verify returned profiles do NOT include the user's own profile
- Verify returned profiles do NOT include previously swiped profiles
- Verify returned profiles include photo URLs and basic fields

## T2: Swipe creates match on mutual like
- User A swipes LIKE on User B → returns `{ matched: false }`
- User B swipes LIKE on User A → returns `{ matched: true, matchId }`
- Verify Match record exists in DB with both user IDs
- Verify SeenProfile records created for both swipes

## T3: Search returns filtered results with PostGIS distance
- Create profiles with different genders, ages, locations
- Call `match.search` with gender filter → only matching genders returned
- Call `match.search` with age range → only profiles in range returned
- Call `match.search` with radiusKm → only nearby profiles returned (requires location set)
