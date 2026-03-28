import { XStack, YStack, Image, Text, Button } from 'tamagui'
import { ScrollView } from 'react-native'

interface Photo {
  id: string
  url: string
  thumbnailSmall: string | null
  thumbnailMedium: string | null
  thumbnailLarge: string | null
  position: number
  isPublic: boolean
}

interface PhotoGalleryProps {
  photos: Photo[]
  editable?: boolean
  onDelete?: (photoId: string) => void
  onUpload?: () => void
}

export function PhotoGallery({ photos, editable = false, onDelete, onUpload }: PhotoGalleryProps) {
  return (
    <YStack gap="$xs">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$xs" padding="$xs">
          {photos.map((photo) => (
            <YStack key={photo.id} position="relative">
              <Image
                source={{ uri: photo.thumbnailMedium || photo.url }}
                width={200}
                height={200}
                borderRadius={8}
              />
              {editable && onDelete && (
                <Button
                  size="$2"
                  circular
                  position="absolute"
                  top={4}
                  right={4}
                  backgroundColor="rgba(0,0,0,0.6)"
                  color="white"
                  onPress={() => onDelete(photo.id)}
                >
                  ✕
                </Button>
              )}
            </YStack>
          ))}
          {editable && onUpload && photos.length < 10 && (
            <Button
              width={200}
              height={200}
              borderRadius={8}
              borderWidth={2}
              borderColor="$borderColor"
              borderStyle="dashed"
              backgroundColor="transparent"
              onPress={onUpload}
            >
              <Text color="$textSecondary" fontSize="$5">+</Text>
            </Button>
          )}
        </XStack>
      </ScrollView>
      <Text color="$textSecondary" fontSize="$2">
        {photos.length}/10 foton
      </Text>
    </YStack>
  )
}
