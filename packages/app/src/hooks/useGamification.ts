import { trpc } from '@lustre/api'

export function useGamification() {
  const badgesQuery = trpc.gamification.getBadges.useQuery()
  const medalsQuery = trpc.gamification.getMedals.useQuery()
  const leaderboardQuery = trpc.gamification.getLeaderboard.useQuery()
  const streakQuery = trpc.gamification.getStreak.useQuery()

  return {
    badges: badgesQuery.data ?? [],
    medals: medalsQuery.data ?? [],
    leaderboard: leaderboardQuery.data ?? null,
    streak: streakQuery.data ?? { currentStreak: 0, longestStreak: 0, lastActivityAt: null },
    isLoading: badgesQuery.isLoading || medalsQuery.isLoading,
  }
}
