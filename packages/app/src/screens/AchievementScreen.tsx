import { ScrollView, YStack, XStack, Text, Spinner } from 'tamagui'
import { useGamification } from '../hooks/useGamification'
import { StreakWidget } from '../components/StreakWidget'

export function AchievementScreen() {
  const { badges, medals, leaderboard, streak, isLoading } = useGamification()

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner />
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack
        paddingHorizontal="$md"
        paddingVertical="$sm"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text fontSize={20} fontWeight="700" color="$color">
          Prestationer
        </Text>
      </XStack>

      <ScrollView flex={1}>
        <YStack paddingHorizontal="$md" paddingTop="$sm" paddingBottom="$lg" gap="$md">
          <YStack gap="$xs">
            <Text fontSize={17} fontWeight="700" color="$color">
              Streak
            </Text>
            <StreakWidget currentStreak={streak.currentStreak} longestStreak={streak.longestStreak} />
          </YStack>

          <YStack gap="$xs">
            <Text fontSize={17} fontWeight="700" color="$color">
              Ranking
            </Text>
            <YStack backgroundColor="$gray2" borderRadius="$4" padding="$md" alignItems="center" gap="$xs">
              <Text fontSize={28}>🏆</Text>
              {leaderboard && leaderboard.totalUsers > 0 ? (
                <>
                  <Text fontSize={22} fontWeight="700" color="$color">
                    Topp {leaderboard.percentile}%
                  </Text>
                  <Text fontSize={13} color="$colorSecondary">
                    Rank #{leaderboard.rank} av {leaderboard.totalUsers} användare
                  </Text>
                </>
              ) : (
                <Text fontSize={15} color="$colorSecondary">
                  Slutför moduler för att ranka
                </Text>
              )}
            </YStack>
          </YStack>

          <YStack gap="$xs">
            <Text fontSize={17} fontWeight="700" color="$color">
              Märken ({badges.filter((b) => b.earned).length}/{badges.length})
            </Text>
            <XStack flexWrap="wrap" gap="$xs">
              {badges.map((badge) => (
                <YStack
                  key={badge.id}
                  width="30%"
                  backgroundColor="$gray2"
                  borderRadius="$3"
                  padding="$xs"
                  alignItems="center"
                  gap="$xs"
                  opacity={badge.earned ? 1 : 0.35}
                >
                  <Text fontSize={24}>{badge.icon}</Text>
                  <Text fontSize={11} fontWeight="600" color="$color" textAlign="center" numberOfLines={2}>
                    {badge.name}
                  </Text>
                </YStack>
              ))}
            </XStack>
          </YStack>

          <YStack gap="$xs">
            <Text fontSize={17} fontWeight="700" color="$color">
              Medaljer ({medals.filter((m) => m.earned).length}/{medals.length})
            </Text>
            <YStack gap="$xs">
              {medals.map((medal) => (
                <XStack
                  key={medal.id}
                  backgroundColor="$gray2"
                  borderRadius="$4"
                  padding="$sm"
                  gap="$sm"
                  alignItems="center"
                  opacity={medal.earned ? 1 : 0.35}
                >
                  <Text fontSize={24}>{medal.icon}</Text>
                  <YStack flex={1}>
                    <Text fontSize={14} fontWeight="600" color="$color">
                      {medal.name}
                    </Text>
                    <Text fontSize={12} color="$colorSecondary">
                      {medal.criteria}
                    </Text>
                  </YStack>
                  {medal.earned && <Text fontSize={16}>✓</Text>}
                </XStack>
              ))}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
