import { YStack, XStack, Text } from 'tamagui'
import { CardBase } from '@lustre/ui'
import { LikeButton } from './LikeButton'

interface ProfilePromptSectionProps {
  promptKey: string
  promptLabel: string
  response: string
  onLike?: () => void
}

export function ProfilePromptSection({
  promptKey,
  promptLabel,
  response,
  onLike,
}: ProfilePromptSectionProps) {
  return (
    <CardBase
      elevation={1}
      position="relative"
      gap="$sm"
    >
      <YStack gap="$xs" flex={1} paddingRight={onLike ? '$10' : undefined}>
        <Text
          color="#8B7E74"
          fontFamily="$heading"
          fontSize={14}
          fontWeight="600"
        >
          {promptLabel}
        </Text>
        <Text
          color="#2C2421"
          fontSize={16}
          fontWeight="500"
          lineHeight={24}
        >
          {response}
        </Text>
      </YStack>

      {onLike && (
        <XStack position="absolute" bottom={16} right={16}>
          <LikeButton onPress={onLike} />
        </XStack>
      )}
    </CardBase>
  )
}
