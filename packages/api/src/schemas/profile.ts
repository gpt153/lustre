import { z } from 'zod'

export const GenderEnum = z.enum([
  'MAN', 'WOMAN', 'NON_BINARY', 'TRANS_MAN', 'TRANS_WOMAN',
  'GENDERQUEER', 'GENDERFLUID', 'AGENDER', 'BIGENDER', 'TWO_SPIRIT', 'OTHER'
])

export const OrientationEnum = z.enum([
  'STRAIGHT', 'GAY', 'LESBIAN', 'BISEXUAL', 'PANSEXUAL',
  'QUEER', 'ASEXUAL', 'DEMISEXUAL', 'OTHER'
])

export const RelationshipTypeEnum = z.enum([
  'SINGLE', 'PARTNERED', 'MARRIED', 'OPEN_RELATIONSHIP', 'POLYAMOROUS', 'OTHER'
])

export const SeekingEnum = z.enum([
  'FRIENDSHIP', 'DATING', 'CASUAL', 'RELATIONSHIP', 'PLAY_PARTNER', 'NETWORKING', 'OTHER'
])

export const ContentPreferenceEnum = z.enum(['SOFT', 'OPEN', 'EXPLICIT', 'NO_DICK_PICS'])

export const createProfileInput = z.object({
  displayName: z.string().min(2).max(50),
  bio: z.string().max(2000).optional(),
  age: z.number().int().min(18).max(99),
  gender: GenderEnum,
  orientation: OrientationEnum,
  relationshipType: RelationshipTypeEnum.optional(),
  seeking: z.array(SeekingEnum).default([]),
  contentPreference: ContentPreferenceEnum,
})

export const updateProfileInput = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(2000).optional().nullable(),
  age: z.number().int().min(18).max(99).optional(),
  gender: GenderEnum.optional(),
  orientation: OrientationEnum.optional(),
  relationshipType: RelationshipTypeEnum.optional().nullable(),
  seeking: z.array(SeekingEnum).optional(),
  contentPreference: ContentPreferenceEnum.optional(),
})

export type CreateProfileInput = z.infer<typeof createProfileInput>
export type UpdateProfileInput = z.infer<typeof updateProfileInput>
