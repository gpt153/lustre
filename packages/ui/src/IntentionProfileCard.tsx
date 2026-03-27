import React from 'react'
import { YStack, XStack, Text, Card, Image } from 'tamagui'

export interface IntentionProfileCardProps {
  userId: string
  displayName: string
  compatibilityScore: number
  matchedIntentionTags: string[]
  bioSnippet: string
  photoUrl: string | null
  intentionSeeking: string
  isFallback: boolean
  onPress?: () => void
}

function getSeekingLabel(seeking: string): string {
  const labels: Record<string, string> = {
    CASUAL: 'Casual',
    RELATIONSHIP: 'Relation',
    FRIENDSHIP: 'Vänskap',
    EXPLORATION: 'Utforska',
    EVENT: 'Event',
    OTHER: 'Annat',
  }
  return labels[seeking] || seeking
}

export function IntentionProfileCard({
  userId,
  displayName,
  compatibilityScore,
  matchedIntentionTags,
  bioSnippet,
  photoUrl,
  intentionSeeking,
  isFallback,
  onPress,
}: IntentionProfileCardProps) {
  return (
    <Card
      bordered
      borderColor="#E0D5C8"
      borderRadius={12}
      padding="$0"
      backgroundColor="#FDF8F3"
      overflow="hidden"
      onPress={onPress}
      style={{
        cursor: onPress ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      hoverStyle={
        onPress
          ? {
              elevation: '$4',
            }
          : undefined
      }
    >
      <YStack gap="$0">
        <YStack position="relative" width="100%" minHeight={300}>
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              width="100%"
              height={300}
              objectFit="cover"
            />
          ) : (
            <YStack
              width="100%"
              height={300}
              backgroundColor="#F5EDE4"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="#8B7E74" fontSize="$3">
                No photo
              </Text>
            </YStack>
          )}

          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            style={{
              background: 'linear-gradient(transparent 50%, rgba(44,36,33,0.6) 100%)',
            }}
          />

          <YStack
            position="absolute"
            top="$3"
            right="$3"
            backgroundColor="#D4A843"
            borderRadius={24}
            paddingHorizontal="$4"
            paddingVertical="$2"
            alignItems="center"
            justifyContent="center"
          >
            <Text
              fontSize="$5"
              fontWeight="700"
              color="white"
              lineHeight={24}
            >
              {compatibilityScore}%
            </Text>
            <Text
              fontSize="$1"
              color="white"
              fontWeight="500"
              marginTop="$1"
            >
              Match
            </Text>
          </YStack>

          {isFallback && (
            <YStack
              position="absolute"
              bottom="$3"
              left="$3"
              backgroundColor="rgba(196, 149, 106, 0.9)"
              borderRadius={6}
              paddingHorizontal="$2"
              paddingVertical="$1"
            >
              <Text fontSize="$1" color="white" fontWeight="500">
                Föreslagna
              </Text>
            </YStack>
          )}
        </YStack>

        <YStack padding="$4" gap="$3">
          <YStack gap="$1">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" fontWeight="700" color="#2C2421">
                {displayName}
              </Text>
              <Text
                fontSize="$2"
                fontWeight="500"
                color="white"
                backgroundColor="#B87333"
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius={4}
              >
                {getSeekingLabel(intentionSeeking)}
              </Text>
            </XStack>
          </YStack>

          {bioSnippet && (
            <Text
              fontSize="$3"
              color="#8B7E74"
              numberOfLines={2}
              lineHeight={18}
            >
              {bioSnippet}
            </Text>
          )}

          {matchedIntentionTags.length > 0 && (
            <YStack gap="$1">
              <Text fontSize="$2" fontWeight="500" color="#8B7E74">
                Matchade taggar:
              </Text>
              <XStack gap="$1" flexWrap="wrap">
                {matchedIntentionTags.map((tag, idx) => (
                  <YStack
                    key={`${tag}-${idx}`}
                    backgroundColor="#E0D5C8"
                    borderRadius={6}
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                  >
                    <Text fontSize="$1" color="#2C2421" fontWeight="500">
                      {tag}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            </YStack>
          )}
        </YStack>
      </YStack>
    </Card>
  )
}
