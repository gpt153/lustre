import { useEffect } from 'react'
import { Linking, Platform } from 'react-native'
import { YStack, XStack, Text, Button, Image } from 'tamagui'

interface FeedAdCardProps {
  campaignId: string
  creativeId: string
  headline: string
  body: string | null
  imageUrl: string | null
  ctaUrl: string
  sponsor: string | null
  onImpression: () => void
  onClick: () => void
}

export function FeedAdCard({
  headline,
  body,
  imageUrl,
  ctaUrl,
  sponsor,
  onImpression,
  onClick,
}: FeedAdCardProps) {
  useEffect(() => {
    onImpression()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCta = () => {
    onClick()
    if (Platform.OS === 'web') {
      window.open(ctaUrl, '_blank')
    } else {
      Linking.openURL(ctaUrl)
    }
  }

  return (
    <YStack
      backgroundColor="$background"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$borderColor"
      overflow="hidden"
    >
      {/* Sponsor row */}
      <XStack
        paddingHorizontal="$3"
        paddingTop="$3"
        paddingBottom="$2"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text fontSize="$2" color="$textSecondary" numberOfLines={1}>
          {sponsor ?? ''}
        </Text>
        <Text fontSize="$1" color="$textSecondary" opacity={0.55}>
          Sponsrad
        </Text>
      </XStack>

      {/* Ad image — 16:9 aspect ratio */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          width="100%"
          aspectRatio={16 / 9}
          objectFit="cover"
        />
      ) : null}

      {/* Headline + body */}
      <YStack paddingHorizontal="$3" paddingTop="$3" gap="$xs">
        <Text fontWeight="700" fontSize="$4" color="$text">
          {headline}
        </Text>
        {body ? (
          <Text fontSize="$3" color="$text">
            {body}
          </Text>
        ) : null}
      </YStack>

      {/* CTA */}
      <XStack paddingHorizontal="$3" paddingVertical="$3">
        <Button
          flex={1}
          backgroundColor="$primary"
          borderRadius="$3"
          onPress={handleCta}
        >
          <Text color="white" fontWeight="600" fontSize="$3">
            Besök
          </Text>
        </Button>
      </XStack>
    </YStack>
  )
}
