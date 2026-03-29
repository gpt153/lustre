import { useState } from 'react'
import { type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native'
import { YStack, XStack, ScrollView } from 'tamagui'
import { PolaroidCard } from '@lustre/ui'
import { POLAROID_ROTATIONS } from '@lustre/tokens'

interface PostImageGalleryProps {
  media: Array<{ id: string; url: string; thumbnailMedium: string | null }>
  postId?: string
  postText?: string
}

const CARD_WIDTH = 280

/** Deterministic hash of a string → unsigned 32-bit integer */
function simpleHash(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return h
}

function rotationForId(id: string): number {
  const idx = simpleHash(id) % POLAROID_ROTATIONS.length
  return POLAROID_ROTATIONS[idx]
}

export function PostImageGallery({ media, postId, postText }: PostImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (media.length === 0) return null

  const seedId = postId ?? media[0].id
  const singleRotation = rotationForId(seedId)
  const singleCaption = postText ? postText.slice(0, 40) : undefined

  if (media.length === 1) {
    return (
      <YStack alignItems="center">
        <PolaroidCard
          cardWidth={CARD_WIDTH}
          imageSource={{ uri: media[0].thumbnailMedium || media[0].url }}
          caption={singleCaption}
          rotation={singleRotation}
        />
      </YStack>
    )
  }

  return (
    <YStack>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 16))
          setActiveIndex(index)
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 8, gap: 16 }}
      >
        {media.map((item, i) => (
          <PolaroidCard
            key={item.id}
            cardWidth={CARD_WIDTH}
            imageSource={{ uri: item.thumbnailMedium || item.url }}
            caption={`${i + 1}/${media.length}`}
            rotation={rotationForId(item.id)}
          />
        ))}
      </ScrollView>

      <XStack justifyContent="center" gap="$xs" marginTop="$2">
        {media.map((_, i) => (
          <YStack
            key={i}
            width={8}
            height={8}
            borderRadius={4}
            backgroundColor={i === activeIndex ? '$primary' : '$borderColor'}
          />
        ))}
      </XStack>
    </YStack>
  )
}
