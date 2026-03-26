'use client'

import { YStack, XStack, Text, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

export default function AchievementsPage() {
  const badgesQuery = trpc.gamification.getBadges.useQuery()
  const medalsQuery = trpc.gamification.getMedals.useQuery()
  const leaderboardQuery = trpc.gamification.getLeaderboard.useQuery()
  const streakQuery = trpc.gamification.getStreak.useQuery()

  const isLoading = badgesQuery.isLoading || medalsQuery.isLoading

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  const badges = badgesQuery.data ?? []
  const medals = medalsQuery.data ?? []
  const leaderboard = leaderboardQuery.data ?? null
  const streak = streakQuery.data ?? { currentStreak: 0, longestStreak: 0, lastActivityAt: null }

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={900} gap="$6">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="700" color="$text">
            Prestationer
          </Text>
          <Link href="/learn" style={{ textDecoration: 'none' }}>
            <Text fontSize="$3" color="$primary">← Tillbaka</Text>
          </Link>
        </XStack>

        <XStack gap="$4" flexWrap="wrap">
          <YStack
            flex={1}
            minWidth={200}
            backgroundColor="$background"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderColor"
            padding="$4"
            gap="$2"
          >
            <Text fontSize="$4" fontWeight="700" color="$text">Streak</Text>
            <XStack alignItems="center" gap="$3">
              <Text fontSize={36}>{(streak.currentStreak ?? 0) > 0 ? '🔥' : '💤'}</Text>
              <YStack>
                <Text fontSize="$5" fontWeight="700" color="$text">
                  {(streak.currentStreak ?? 0) > 0
                    ? `${streak.currentStreak} dagar i rad`
                    : 'Ingen streak'}
                </Text>
                <Text fontSize="$1" color="$textSecondary">
                  Bäst: {streak.longestStreak ?? 0} dagar
                </Text>
              </YStack>
            </XStack>
          </YStack>

          <YStack
            flex={1}
            minWidth={200}
            backgroundColor="$background"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$borderColor"
            padding="$4"
            gap="$2"
            alignItems="center"
          >
            <Text fontSize="$4" fontWeight="700" color="$text">Ranking</Text>
            <Text fontSize={36}>🏆</Text>
            {leaderboard && leaderboard.totalUsers > 0 ? (
              <>
                <Text fontSize="$5" fontWeight="700" color="$text">
                  Topp {leaderboard.percentile}%
                </Text>
                <Text fontSize="$2" color="$textSecondary">
                  #{leaderboard.rank} av {leaderboard.totalUsers}
                </Text>
              </>
            ) : (
              <Text fontSize="$3" color="$textSecondary" textAlign="center">
                Slutför moduler för att ranka
              </Text>
            )}
          </YStack>
        </XStack>

        <YStack gap="$3">
          <Text fontSize="$5" fontWeight="700" color="$text">
            Märken ({badges.filter(b => b.earned).length}/{badges.length})
          </Text>
          <XStack flexWrap="wrap" gap="$3">
            {badges.map((badge) => (
              <YStack
                key={badge.id}
                width={120}
                backgroundColor="$background"
                borderRadius="$4"
                borderWidth={1}
                borderColor={badge.earned ? '$primary' : '$borderColor'}
                padding="$3"
                alignItems="center"
                gap="$2"
                opacity={badge.earned ? 1 : 0.4}
              >
                <Text fontSize={32}>{badge.icon}</Text>
                <Text fontSize="$2" fontWeight="600" color="$text" textAlign="center" numberOfLines={2}>
                  {badge.name}
                </Text>
                {badge.earned && (
                  <Text fontSize="$1" color="#1A7F37" fontWeight="600">✓ Uppnådd</Text>
                )}
              </YStack>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$3">
          <Text fontSize="$5" fontWeight="700" color="$text">
            Medaljer ({medals.filter(m => m.earned).length}/{medals.length})
          </Text>
          <YStack gap="$2">
            {medals.map((medal) => (
              <XStack
                key={medal.id}
                backgroundColor="$background"
                borderRadius="$4"
                borderWidth={1}
                borderColor={medal.earned ? '$primary' : '$borderColor'}
                padding="$3"
                gap="$3"
                alignItems="center"
                opacity={medal.earned ? 1 : 0.4}
              >
                <Text fontSize={28}>{medal.icon}</Text>
                <YStack flex={1}>
                  <Text fontSize="$4" fontWeight="600" color="$text">{medal.name}</Text>
                  <Text fontSize="$2" color="$textSecondary">{medal.criteria}</Text>
                </YStack>
                {medal.earned && (
                  <Text fontSize="$3" color="#1A7F37" fontWeight="700">✓</Text>
                )}
              </XStack>
            ))}
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  )
}
