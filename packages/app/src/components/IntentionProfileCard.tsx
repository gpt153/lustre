import { YStack, XStack, Text, Card, Image } from 'tamagui'

interface IntentionProfileCardProps {
  userId: string
  displayName: string
  compatibilityScore: number
  matchedIntentionTags: string[]
  bioSnippet: string
  photoUrl: string | null
  intentionSeeking: string
  distance?: number
  isFallback: boolean
  onPress?: () => void
}

export function IntentionProfileCard({
  userId,
  displayName,
  compatibilityScore,
  matchedIntentionTags,
  bioSnippet,
  photoUrl,
  intentionSeeking,
  distance,
  isFallback,
  onPress,
}: IntentionProfileCardProps) {
  return (
    <Card
      padded
      elevate
      borderRadius="$4"
      marginBottom="$3"
      pressStyle={{ scale: 0.98 }}
      onPress={onPress}
      cursor={onPress ? 'pointer' : 'default'}
    >
      {isFallback && (
        <XStack
          backgroundColor="$gray4"
          paddingHorizontal="$2"
          paddingVertical="$1"
          borderRadius="$2"
          alignSelf="flex-start"
          marginBottom="$2"
        >
          <Text fontSize="$2" color="$gray11">
            Föreslagna
          </Text>
        </XStack>
      )}

      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$2" gap="$2">
        <Text fontSize="$6" fontWeight="700" color="#D4A843">
          {compatibilityScore}%
        </Text>
        <YStack flex={1} gap="$1">
          <Text fontSize="$4" fontWeight="600" color="$color">
            {displayName}
          </Text>
          <XStack gap="$1" alignItems="center">
            <Text fontSize="$2" color="$gray11">
              {intentionSeeking.toLowerCase()}
            </Text>
            {distance !== undefined && (
              <Text fontSize="$2" color="$gray11">
                • {Math.round(distance)} km
              </Text>
            )}
          </XStack>
        </YStack>
      </XStack>

      {matchedIntentionTags.length > 0 && (
        <XStack flexWrap="wrap" gap="$1" marginBottom="$2">
          {matchedIntentionTags.map((tag) => (
            <XStack key={tag} backgroundColor="#B87333" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4">
              <Text fontSize="$2" color="white" fontWeight="500">
                {tag}
              </Text>
            </XStack>
          ))}
        </XStack>
      )}

      {bioSnippet && (
        <Text fontSize="$3" color="$gray12" marginBottom="$2" numberOfLines={2}>
          {bioSnippet}
        </Text>
      )}

      {photoUrl && <Image source={{ uri: photoUrl }} width="100%" height={200} borderRadius="$3" resizeMode="cover" />}
    </Card>
  )
}
