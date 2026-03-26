import { YStack, Image, Text, XStack } from 'tamagui'
import { LinearGradient } from '@tamagui/linear-gradient'
import { LikeButton } from './LikeButton'

interface ProfilePhotoSectionProps {
  photoUrl: string
  showInfo?: boolean
  displayName?: string
  age?: number
  onLike?: () => void
}

export function ProfilePhotoSection({
  photoUrl,
  showInfo = false,
  displayName,
  age,
  onLike,
}: ProfilePhotoSectionProps) {
  return (
    <YStack
      width="100%"
      height={450}
      borderRadius={16}
      overflow="hidden"
      position="relative"
    >
      <Image
        source={{ uri: photoUrl }}
        width="100%"
        height="100%"
      />

      {showInfo && displayName && (
        <>
          <YStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            height="40%"
          >
            <LinearGradient
              colors={['transparent', 'rgba(44, 36, 33, 0.8)']}
              start={[0, 0]}
              end={[0, 1]}
              width="100%"
              height="100%"
            />
          </YStack>

          <YStack
            position="absolute"
            bottom={16}
            left={16}
            right={16}
            zIndex={10}
          >
            <XStack alignItems="flex-end" justifyContent="space-between">
              <YStack>
                <Text
                  fontSize={28}
                  fontWeight="700"
                  color="#FDF8F3"
                  fontFamily="$heading"
                >
                  {displayName}
                </Text>
                <Text
                  fontSize={18}
                  fontWeight="600"
                  color="#FDF8F3"
                  fontFamily="$heading"
                >
                  {age}
                </Text>
              </YStack>
              {onLike && <LikeButton onPress={onLike} />}
            </XStack>
          </YStack>
        </>
      )}

      {!showInfo && onLike && (
        <YStack position="absolute" bottom={16} right={16} zIndex={10}>
          <LikeButton onPress={onLike} />
        </YStack>
      )}
    </YStack>
  )
}
