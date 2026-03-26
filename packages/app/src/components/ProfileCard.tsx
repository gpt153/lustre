import { YStack, XStack, Text, Image } from 'tamagui'
import { CardBase } from '@lustre/ui'

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
    <CardBase
      asChild
      flexDirection="row"
      alignItems="center"
      pressStyle={{ opacity: 0.8 }}
      onPress={onPress}
      cursor={onPress ? 'pointer' : 'default'}
    >
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} width={60} height={60} borderRadius={12} />
      ) : (
        <YStack width={60} height={60} borderRadius={12} backgroundColor="$warmGray" alignItems="center" justifyContent="center">
          <Text fontSize="$5" color="$warmWhite">{displayName[0]?.toUpperCase()}</Text>
        </YStack>
      )}
      <YStack flex={1} gap="$1" marginLeft="$3">
        <XStack alignItems="center" gap="$1">
          <Text fontWeight="600" color="$color">{displayName}</Text>
          {verified && <Text color="#D4A843" fontSize="$2">✓</Text>}
        </XStack>
        <Text color="$warmGray" fontSize="$2">
          {age} • {gender.replace(/_/g, ' ').toLowerCase()} • {orientation.toLowerCase()}
        </Text>
      </YStack>
    </CardBase>
  )
}
