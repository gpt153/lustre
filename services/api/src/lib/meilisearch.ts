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
  await index.updateSearchableAttributes(['displayName'])
  await index.updateFilterableAttributes(['status'])
}
