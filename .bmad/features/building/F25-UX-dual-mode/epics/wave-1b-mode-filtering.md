# Epic: wave-1b-mode-filtering

**Wave:** 1
**Model:** haiku
**Status:** NOT_STARTED
**Depends on:** wave-1a-mode-state (settings router must exist)

## Goal
Make API-level queries mode-aware: vanilla users get SFW content only; kink tags hidden from vanilla callers in public profiles; discovery stack filters accordingly.

## Context

### Existing routers to modify
1. `services/api/src/trpc/post-router.ts` — `feed` query: exclude posts with explicit nudity when caller is vanilla
2. `services/api/src/trpc/match-router.ts` — `getDiscoveryStack` query: exclude spicy-only profiles when caller is vanilla
3. `services/api/src/trpc/profile-router.ts` — `getPublic` query: hide `kinkTags` from response when caller is vanilla

### How to detect caller mode
In each endpoint, look up `ctx.prisma.profile.findUnique({ where: { userId: ctx.userId }, select: { spicyModeEnabled: true } })` — vanilla = false.

### Post schema (existing)
- `Post.media` → `PostMedia.nudityLevel: NudityLevel` (enum: NONE, LOW, MEDIUM, HIGH)
- In vanilla mode: exclude posts where ANY media has nudityLevel IN (MEDIUM, HIGH)
- Implementation: add `NOT` filter or post-process

### Match/discovery (existing)
- `match-router.ts` `getDiscoveryStack` — already has filters (age, seeking, etc.)
- In vanilla mode: exclude profiles where `spicyModeEnabled = true` AND it would be "spicy-only" visibility. Simple approach: when caller is vanilla, filter out profiles where `spicyModeEnabled = true` from discovery results.

### Profile.getPublic (existing)
- Already includes kinkTags in response via `include: { kinkTags: { include: { kinkTag: true } } }`
- In vanilla mode (caller's spicyModeEnabled=false): return `kinkTags: []` instead

## Acceptance Criteria
1. `post-router.ts` `feed` query: when caller is vanilla, posts with any media having nudityLevel MEDIUM or HIGH are excluded from results
2. `match-router.ts` `getDiscoveryStack`: when caller is vanilla, profiles with `spicyModeEnabled = true` are excluded from discovery stack
3. `profile-router.ts` `getPublic`: when caller is vanilla (spicyModeEnabled = false), `kinkTags` array is returned empty (hidden)
4. All three queries fetch caller's spicyModeEnabled once at the top with a single `profile.findUnique` call
5. No changes to vanilla-caller API response shape — kinkTags still present, just empty
6. Spicy callers see all content unaffected

## File Paths
1. `services/api/src/trpc/post-router.ts` — EDIT (feed query)
2. `services/api/src/trpc/match-router.ts` — EDIT (getDiscoveryStack query)
3. `services/api/src/trpc/profile-router.ts` — EDIT (getPublic query)

## Implementation Notes

### post-router.ts feed query (add near top of feed handler)
```typescript
const callerProfile = await ctx.prisma.profile.findUnique({
  where: { userId: ctx.userId },
  select: { spicyModeEnabled: true },
})
const isVanilla = !callerProfile?.spicyModeEnabled

// In the findMany for posts, add to where clause:
// If isVanilla, exclude posts that have any media with nudityLevel MEDIUM or HIGH
const posts = await ctx.prisma.post.findMany({
  where: {
    ...(isVanilla ? {
      media: {
        none: { nudityLevel: { in: ['MEDIUM', 'HIGH'] } }
      }
    } : {}),
    // ... rest of existing where filters
  },
  // ... rest of query
})
```

### match-router.ts getDiscoveryStack (add caller mode check)
```typescript
const callerProfile = await ctx.prisma.profile.findUnique({
  where: { userId: ctx.userId },
  select: { spicyModeEnabled: true },
})
const isVanilla = !callerProfile?.spicyModeEnabled

// In the findMany for profiles, add:
where: {
  ...(isVanilla ? { spicyModeEnabled: false } : {}),
  // ... rest of existing where filters
}
```

### profile-router.ts getPublic (add kink tag hiding)
```typescript
// After fetching the profile, fetch caller's mode:
const callerProfile = await ctx.prisma.profile.findUnique({
  where: { userId: ctx.userId },
  select: { spicyModeEnabled: true },
})
const isVanilla = !callerProfile?.spicyModeEnabled

// When returning, hide kink tags for vanilla callers:
return {
  ...profile,
  kinkTags: isVanilla ? [] : profile.kinkTags,
}
```

IMPORTANT: Read the actual current code in each file before editing. The feed query may have a complex where clause — insert the mode filter without breaking existing filters. Do NOT rewrite the entire functions, only add the mode filtering logic.
