import { YStack, XStack, Text } from 'tamagui'

interface StreakWidgetProps {
  currentStreak: number
  longestStreak: number
}

export function StreakWidget({ currentStreak, longestStreak }: StreakWidgetProps) {
  return (
    <XStack
      backgroundColor="$gray2"
      borderRadius="$4"
      padding="$3"
      gap="$3"
      alignItems="center"
    >
      <Text fontSize={28}>{currentStreak > 0 ? '🔥' : '💤'}</Text>
      <YStack flex={1}>
        <Text fontSize={16} fontWeight="700" color="$color">
          {currentStreak > 0 ? `${currentStreak} dagar i rad` : 'Ingen streak ännu'}
        </Text>
        <Text fontSize={13} color="$colorSecondary">
          Bäst: {longestStreak} dagar
        </Text>
      </YStack>
    </XStack>
  )
}
