# Epic: wave-3c-pair-linking
**Model:** haiku
**Wave:** 3, Group B (sequential, after A)

## Description
Implement pair/poly linking: invitation flow, confirmation, linked profile display, up to 5 people.

## Acceptance Criteria
1. `PairInvitation` Prisma model: id, fromProfileId, toProfileId, status (PENDING/ACCEPTED/DECLINED/EXPIRED), createdAt, expiresAt (48h). Map to "pair_invitations".
2. `PairLink` Prisma model: id, createdAt. Map to "pair_links". `PairLinkMember` model: id, pairLinkId, profileId, joinedAt. Map to "pair_link_members". Max 5 members per PairLink.
3. `pair.invite` protectedProcedure — create invitation to another user by their userId. Validates: not already linked, not self-invite, not duplicate pending invite.
4. `pair.respond` protectedProcedure — accept or decline invitation. On accept: create PairLink (or add to existing) with both profiles as members.
5. `pair.getMyLinks` protectedProcedure — returns all pair links for the user's profile with member details
6. `pair.leave` protectedProcedure — remove self from a pair link. If only 1 member left, delete the link.
7. Public profile view shows pair link members (display name + thumbnail) if any
8. Search results show pair links as connected units

## File Paths
1. `services/api/prisma/schema.prisma` — add PairInvitation, PairLink, PairLinkMember models
2. `services/api/src/trpc/pair-router.ts` — new file with pair procedures
3. `services/api/src/trpc/router.ts` — register pair router
4. `services/api/src/trpc/profile-router.ts` — include pair link data in getPublic
5. `packages/app/src/components/PairLinkCard.tsx` — UI component for pair display

## Context
- Pair linking is Phase 2 per PRD but included in the roadmap
- Up to 5 people per link (poly support)
- Invitations expire after 48 hours
- Both parties must confirm
- Use Prisma transactions for the accept flow
