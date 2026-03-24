import { z } from 'zod'
import { router, publicProcedure } from './middleware.js'
import { meili, PROFILE_INDEX } from '../lib/meilisearch.js'

const searchFiltersSchema = z.object({
  query: z.string().default(''),
  gender: z.array(z.string()).optional(),
  orientation: z.array(z.string()).optional(),
  ageMin: z.number().int().min(18).max(99).optional(),
  ageMax: z.number().int().min(18).max(99).optional(),
  relationshipType: z.string().optional(),
  seeking: z.string().optional(),
  verified: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sort: z.enum(['createdAt:desc', 'createdAt:asc', 'age:asc', 'age:desc']).optional(),
})

export const searchRouter = router({
  profiles: publicProcedure
    .input(searchFiltersSchema)
    .query(async ({ input }) => {
      const filters: string[] = []

      if (input.gender && input.gender.length > 0) {
        filters.push(`gender IN [${input.gender.join(', ')}]`)
      }
      if (input.orientation && input.orientation.length > 0) {
        filters.push(`orientation IN [${input.orientation.join(', ')}]`)
      }
      if (input.ageMin !== undefined) {
        filters.push(`age >= ${input.ageMin}`)
      }
      if (input.ageMax !== undefined) {
        filters.push(`age <= ${input.ageMax}`)
      }
      if (input.relationshipType) {
        filters.push(`relationshipType = ${input.relationshipType}`)
      }
      if (input.seeking) {
        filters.push(`seeking IN [${input.seeking}]`)
      }
      if (input.verified !== undefined) {
        filters.push(`verified = ${input.verified}`)
      }

      const index = meili.index(PROFILE_INDEX)
      const results = await index.search(input.query, {
        filter: filters.length > 0 ? filters.join(' AND ') : undefined,
        limit: input.limit,
        offset: input.offset,
        sort: input.sort ? [input.sort] : undefined,
      })

      return {
        hits: results.hits.map((hit: any) => ({
          id: hit.id,
          userId: hit.userId,
          displayName: hit.displayName,
          age: hit.age,
          gender: hit.gender,
          orientation: hit.orientation,
          thumbnailUrl: hit.thumbnailUrl,
          verified: hit.verified,
        })),
        totalHits: results.estimatedTotalHits ?? 0,
        limit: input.limit,
        offset: input.offset,
      }
    }),
})
