import { YStack, Text, Button, H2, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'

interface Props {
  recordingId: string
  onClose: () => void
}

export function ConsentPlaybackScreen({ recordingId, onClose }: Props) {
  const tokenQuery = trpc.consent.getPlaybackToken.useQuery({ recordingId })

  if (tokenQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
        <Spinner />
        <Text color="$colorSecondary">Loading playback token...</Text>
      </YStack>
    )
  }

  if (tokenQuery.error) {
    return (
      <YStack padding="$4" gap="$5" flex={1}>
        <H2 color="$color">Playback</H2>
        <Text color="$red10">{tokenQuery.error.message}</Text>
        <Button theme="active" size="$4" onPress={onClose}>
          Close
        </Button>
      </YStack>
    )
  }

  const tokenData = tokenQuery.data
  const truncatedToken = tokenData?.token
    ? `${tokenData.token.slice(0, 24)}...`
    : '—'

  return (
    <YStack padding="$4" gap="$5" flex={1}>
      <H2 color="$color">Playback</H2>

      <YStack
        backgroundColor="$backgroundHover"
        borderRadius="$4"
        padding="$4"
        gap="$3"
      >
        <Text color="$color" fontWeight="600" fontSize="$3">
          DRM License Token
        </Text>
        <Text color="$colorSecondary" fontSize="$2" selectable>
          {truncatedToken}
        </Text>
      </YStack>

      <YStack
        backgroundColor="$backgroundHover"
        borderRadius="$4"
        padding="$4"
        gap="$3"
      >
        <Text color="$color" fontWeight="600" fontSize="$3">
          Streaming URL
        </Text>
        <Text color="$colorSecondary" fontSize="$2" selectable>
          {tokenData?.streamingUrl ?? '—'}
        </Text>
      </YStack>

      <YStack
        backgroundColor="$yellow2"
        borderRadius="$4"
        padding="$3"
        borderWidth={1}
        borderColor="$yellow6"
      >
        <Text color="$yellow10" fontSize="$2">
          DRM player integration pending pallycon-react-native-sdk installation.
        </Text>
      </YStack>

      <Button theme="active" size="$4" onPress={onClose}>
        Close
      </Button>
    </YStack>
  )
}
