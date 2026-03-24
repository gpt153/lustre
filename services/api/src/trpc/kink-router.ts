import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from './middleware.js'

const KinkInterestLevelEnum = z.enum(['CURIOUS', 'LIKE', 'LOVE'])

const setKinkTagsSchema = z.object({
  tags: z.array(z.object({
    kinkTagId: z.string().uuid(),
    interestLevel: KinkInterestLevelEnum,
    isPublic: z.boolean().default(true),
  })).max(50),
})

export const kinkRouter = router({
  listTags: publicProcedure.query(async ({ ctx }) => {
    const tags = await ctx.prisma.kinkTag.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    // Group by category
    const grouped: Record<string, typeof tags> = {}
    for (const tag of tags) {
      if (!grouped[tag.category]) grouped[tag.category] = []
      grouped[tag.category].push(tag)
    }

    return grouped
  }),

  searchTags: publicProcedure
    .input(z.object({ query: z.string().min(1).max(100) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.kinkTag.findMany({
        where: {
          name: { contains: input.query, mode: 'insensitive' },
        },
        orderBy: { name: 'asc' },
        take: 20,
      })
    }),

  setMyTags: protectedProcedure
    .input(setKinkTagsSchema)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: ctx.userId },
      })
      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
      }

      // Replace all kink tags in a transaction
      await ctx.prisma.$transaction(async (tx) => {
        // Delete existing
        await tx.profileKinkTag.deleteMany({
          where: { profileId: profile.id },
        })

        // Insert new
        if (input.tags.length > 0) {
          await tx.profileKinkTag.createMany({
            data: input.tags.map(tag => ({
              profileId: profile.id,
              kinkTagId: tag.kinkTagId,
              interestLevel: tag.interestLevel,
              isPublic: tag.isPublic,
            })),
          })
        }
      })

      return { success: true }
    }),

  getMyTags: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.profile.findUnique({
      where: { userId: ctx.userId },
    })
    if (!profile) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' })
    }

    return ctx.prisma.profileKinkTag.findMany({
      where: { profileId: profile.id },
      include: { kinkTag: true },
      orderBy: { kinkTag: { category: 'asc' } },
    })
  }),
})
