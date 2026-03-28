import { useState } from 'react'
import { Dimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native'
import { YStack, XStack, Image, ScrollView } from 'tamagui'

interface PostImageGalleryProps {
  media: Array<{ id: string; url: string; thumbnailMedium: string | null }>
}

export function PostImageGallery({ media }: PostImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const screenWidth = Dimensions.get('window').width

  if (media.length === 0) return null

  if (media.length === 1) {
    return (
      <Image
        source={{ uri: media[0].thumbnailMedium || media[0].url }}
        width="100%"
        height={300}
        resizeMode="cover"
        borderRadius="$2"
      />
    )
  }

  return (
    <YStack>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth)
          setActiveIndex(index)
        }}
        scrollEventThrottle={16}
      >
        {media.map((item) => (
          <Image
            key={item.id}
            source={{ uri: item.thumbnailMedium || item.url }}
            width={screenWidth - 32}
            height={300}
            resizeMode="cover"
            borderRadius="$2"
            marginRight="$2"
          />
        ))}
      </ScrollView>
      {media.length > 1 && (
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
      )}
    </YStack>
  )
}
