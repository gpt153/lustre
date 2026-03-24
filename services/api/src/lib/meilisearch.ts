import { MeiliSearch } from 'meilisearch'

let meili: MeiliSearch

declare global {
  // eslint-disable-next-line no-var
  var __meili: MeiliSearch | undefined
}

if (!global.__meili) {
  global.__meili = new MeiliSearch({
    host: process.env.MEILI_URL || 'http://localhost:7700',
    apiKey: process.env.MEILI_MASTER_KEY || '',
  })
}
meili = global.__meili

export { meili }

export const PROFILE_INDEX = 'profiles'

export async function configureIndexes() {
  const index = meili.index(PROFILE_INDEX)
  await index.updateSearchableAttributes(['displayName', 'bio'])
  await index.updateFilterableAttributes([
    'gender', 'orientation', 'age', 'relationshipType', 'seeking', 'verified'
  ])
  await index.updateSortableAttributes(['createdAt', 'age'])
}

export interface ProfileDocument {
  id: string
  userId: string
  displayName: string
  bio: string | null
  age: number
  gender: string
  orientation: string
  relationshipType: string | null
  seeking: string[]
  verified: boolean
  thumbnailUrl: string | null
  createdAt: number
}

export async function indexProfile(profile: {
  id: string
  userId: string
  displayName: string
  bio: string | null
  age: number
  gender: string
  orientation: string
  relationshipType: string | null
  seeking: string[]
  verified: boolean
  photos?: { thumbnailSmall: string | null; position: number }[]
  createdAt: Date
}): Promise<void> {
  const doc: ProfileDocument = {
    id: profile.id,
    userId: profile.userId,
    displayName: profile.displayName,
    bio: profile.bio,
    age: profile.age,
    gender: profile.gender,
    orientation: profile.orientation,
    relationshipType: profile.relationshipType,
    seeking: profile.seeking,
    verified: profile.verified,
    thumbnailUrl: profile.photos?.sort((a, b) => a.position - b.position)[0]?.thumbnailSmall ?? null,
    createdAt: profile.createdAt.getTime(),
  }

  const index = meili.index(PROFILE_INDEX)
  await index.addDocuments([doc])
}

export async function removeProfileFromIndex(profileId: string): Promise<void> {
  const index = meili.index(PROFILE_INDEX)
  await index.deleteDocument(profileId)
}
