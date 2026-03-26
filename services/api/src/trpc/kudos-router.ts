import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from './middleware.js'
import { getCachedBadgeCatalog, checkRateLimit } from '../lib/kudos.js'

export const kudosRouter = router({
  listBadges: protectedProcedure
    .input(z.object({ categorySlug: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({ where: { userId: ctx.userId } })
      const isSpicy = profile?.spicyModeEnabled ?? false

      const categories = await getCachedBadgeCatalog(ctx.prisma)

      let filtered = categories
      if (input?.categorySlug) {
        filtered = categories.filter((c: any) => c.slug === input.categorySlug)
      }

      if (!isSpicy) {
        filtered = filtered.map((c: any) => ({
          ...c,
          badges: c.badges.filter((b: any) => !b.spicyOnly),
        }))
      }

      return filtered
    }),

  give: protectedProcedure
    .input(z.object({
      recipientId: z.string().uuid(),
      matchId: z.string().uuid().optional(),
      badgeIds: z.array(z.string().uuid()).min(1).max(6),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.recipientId === ctx.userId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot give kudos to yourself' })
      }

      const { allowed } = await checkRateLimit(ctx.userId)
      if (!allowed) {
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded. Max 10 kudos per 24 hours.' })
      }

      const existing = await ctx.prisma.kudos.findFirst({
        where: {
          giverId: ctx.userId,
          recipientId: input.recipientId,
          matchId: input.matchId ?? null,
        },
      })
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Kudos already given for this interaction' })
      }

      const profile = await ctx.prisma.profile.findUnique({ where: { userId: ctx.userId } })
      const isSpicy = profile?.spicyModeEnabled ?? false

      const badges = await ctx.prisma.kudosBadge.findMany({
        where: { id: { in: input.badgeIds } },
      })

      if (badges.length !== input.badgeIds.length) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'One or more invalid badge IDs' })
      }

      if (!isSpicy && badges.some((b) => b.spicyOnly)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot select spicy badges in vanilla mode' })
      }

      const kudos = await ctx.prisma.kudos.create({
        data: {
          giverId: ctx.userId,
          recipientId: input.recipientId,
          matchId: input.matchId,
          badges: {
            create: input.badgeIds.map((badgeId) => ({ badgeId })),
          },
        },
        include: { badges: { include: { badge: true } } },
      })

      return kudos
    }),

  getProfileKudos: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({ where: { userId: ctx.userId } })
      const isSpicy = profile?.spicyModeEnabled ?? false

      const totalCount = await ctx.prisma.kudos.count({
        where: { recipientId: input.userId },
      })

      const badgeCounts = await ctx.prisma.kudosBadgeSelection.groupBy({
        by: ['badgeId'],
        where: {
          kudos: { recipientId: input.userId },
          ...(isSpicy ? {} : { badge: { spicyOnly: false } }),
        },
        _count: { badgeId: true },
        orderBy: { _count: { badgeId: 'desc' } },
      })

      const badgeIds = badgeCounts.map((bc) => bc.badgeId)
      const badges = await ctx.prisma.kudosBadge.findMany({
        where: { id: { in: badgeIds } },
        include: { category: true },
      })

      const badgeMap = new Map(badges.map((b) => [b.id, b]))

      const result = badgeCounts.map((bc) => {
        const badge = badgeMap.get(bc.badgeId)!
        return {
          badgeId: bc.badgeId,
          name: badge.name,
          category: badge.category.name,
          count: bc._count.badgeId,
        }
      })

      return { totalCount, badges: result }
    }),
})
