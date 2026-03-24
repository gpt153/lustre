# Epic: wave-1a-post-schema

**Model:** haiku
**Wave:** 1
**Group:** A (sequential — first)

## Description

Add Prisma models for social feed posts: Post, PostMedia, ContentTag, UserContentFilter. Add enums for the 5 classification dimensions (nudity level, body part, activity, vibe, gender presentation).

## Acceptance Criteria

1. `Post` model with: id (uuid), authorId (references User), text (max 2000 chars), createdAt, updatedAt
2. `PostMedia` model with: id (uuid), postId (references Post), url, thumbnailSmall, thumbnailMedium, thumbnailLarge, position, createdAt
3. `ContentTag` model with: id (uuid), postMediaId (references PostMedia), dimension (enum), value (enum), confidence (Float)
4. `UserContentFilter` model with: id (uuid), userId (unique, references User), nudityLevel (enum array), bodyPart (enum array), activity (enum array), vibe (enum array), genderPresentation (enum array), preset (ContentPreference), updatedAt
5. Enum `NudityLevel`: NONE, IMPLIED, PARTIAL, FULL
6. Enum `BodyPartTag`: FACE, CHEST, BACK, BUTT, GENITALS, LEGS, FEET, FULL_BODY
7. Enum `ActivityTag`: SELFIE, MIRROR, OUTDOOR, GYM, BEDROOM, ARTISTIC, COUPLE, GROUP
8. Enum `VibeTag`: CASUAL, SENSUAL, PLAYFUL, INTENSE, ROMANTIC, ARTISTIC
9. Enum `GenderPresentationTag`: MASCULINE, FEMININE, ANDROGYNOUS, MIXED
10. Add relation fields: User has posts[], User has contentFilter, Post has media[], PostMedia has tags[]

## File Paths

- `services/api/prisma/schema.prisma`
