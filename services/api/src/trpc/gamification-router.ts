import { router, protectedProcedure } from './middleware.js'

export const gamificationRouter = router({
  getBadges: protectedProcedure.query(async ({ ctx }) => {
    const badges = await ctx.prisma.badge.findMany({
      orderBy: { moduleOrder: 'asc' },
    })

    const userBadges = await ctx.prisma.userBadge.findMany({
      where: { userId: ctx.userId },
    })

    const userBadgeMap = new Map(userBadges.map((ub) => [ub.badgeId, ub]))

    return badges.map((badge) => {
      const userBadge = userBadgeMap.get(badge.id)
      return {
        ...badge,
        earned: !!userBadge,
        earnedAt: userBadge?.awardedAt ?? null,
      }
    })
  }),

  getMedals: protectedProcedure.query(async ({ ctx }) => {
    const medals = await ctx.prisma.medal.findMany({
      orderBy: { createdAt: 'asc' },
    })

    const userMedals = await ctx.prisma.userMedal.findMany({
      where: { userId: ctx.userId },
    })

    const userMedalMap = new Map(userMedals.map((um) => [um.medalId, um]))

    return medals.map((medal) => {
      const userMedal = userMedalMap.get(medal.id)
      return {
        ...medal,
        earned: !!userMedal,
        earnedAt: userMedal?.awardedAt ?? null,
      }
    })
  }),

  getLeaderboard: protectedProcedure.query(async ({ ctx }) => {
    const badgeCounts = await ctx.prisma.userBadge.groupBy({
      by: ['userId'],
      _count: {
        badgeId: true,
      },
    })

    const rankedUsers = badgeCounts
      .map((item) => ({
        userId: item.userId,
        badgeCount: item._count.badgeId,
      }))
      .sort((a, b) => b.badgeCount - a.badgeCount)

    const totalUsers = rankedUsers.length

    const userRankIndex = rankedUsers.findIndex((u) => u.userId === ctx.userId)
    const rank = userRankIndex !== -1 ? userRankIndex + 1 : totalUsers + 1

    const percentile = Math.round((1 - rank / totalUsers) * 100)

    return {
      percentile,
      rank,
      totalUsers,
    }
  }),

  getStreak: protectedProcedure.query(async ({ ctx }) => {
    const userStreak = await ctx.prisma.userStreak.findUnique({
      where: { userId: ctx.userId },
    })

    if (!userStreak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityAt: null,
      }
    }

    return {
      currentStreak: userStreak.currentStreak,
      longestStreak: userStreak.longestStreak,
      lastActivityAt: userStreak.lastActivityAt,
    }
  }),
})
