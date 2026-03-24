import { YStack, XStack, Text, Image } from 'tamagui'

interface ProfileCardProps {
  displayName: string
  age: number
  gender: string
  orientation: string
  thumbnailUrl: string | null
  verified: boolean
  onPress?: () => void
}

export function ProfileCard({ displayName, age, gender, orientation, thumbnailUrl, verified, onPress }: ProfileCardProps) {
  return (
    <XStack
      backgroundColor="$background"
      borderRadius={12}
      padding="$3"
      gap="$3"
      alignItems="center"
      pressStyle={{ opacity: 0.8 }}
      onPress={onPress}
      cursor={onPress ? 'pointer' : 'default'}
    >
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} width={60} height={60} borderRadius={30} />
      ) : (
        <YStack width={60} height={60} borderRadius={30} backgroundColor="$backgroundHover" alignItems="center" justifyContent="center">
          <Text fontSize="$5" color="$textSecondary">{displayName[0]?.toUpperCase()}</Text>
        </YStack>
      )}
      <YStack flex={1}>
        <XStack alignItems="center" gap="$1">
          <Text fontWeight="600" color="$text">{displayName}</Text>
          {verified && <Text color="#4CAF50" fontSize="$2">✓</Text>}
        </XStack>
        <Text color="$textSecondary" fontSize="$2">
          {age} • {gender.replace(/_/g, ' ').toLowerCase()} • {orientation.toLowerCase()}
        </Text>
      </YStack>
    </XStack>
  )
}
