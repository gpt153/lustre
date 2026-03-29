import { useCallback } from 'react'
import { ScrollView, View, Text, Pressable, useWindowDimensions, StyleSheet } from 'react-native'
import { PolaroidCard, PolaroidStack } from '@lustre/ui'
import { getPolaroidDimensions } from '@lustre/tokens'

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
  /** Card width in pixels — defaults to screenWidth - 64 */
  cardWidth?: number
  /** Personal quote used as caption in view mode */
  quote?: string
}

export function PhotoGallery({
  photos,
  editable = false,
  onDelete,
  onUpload,
  cardWidth: cardWidthProp,
  quote,
}: PhotoGalleryProps) {
  const { width: screenWidth } = useWindowDimensions()
  const cardWidth = cardWidthProp ?? screenWidth - 64

  const buildCaption = useCallback(
    (index: number): string => {
      if (quote && index === 0) return quote
      return `Foto ${index + 1} av ${photos.length}`
    },
    [quote, photos.length]
  )

  // ── View mode ────────────────────────────────────────────────────────────────
  if (!editable) {
    if (photos.length === 0) {
      return (
        <View style={[styles.emptyContainer, { width: cardWidth, height: cardWidth * 1.25 }]}>
          <Text style={styles.emptyText}>Inga foton</Text>
        </View>
      )
    }

    const images = photos.map((p) => ({ uri: p.thumbnailLarge || p.thumbnailMedium || p.url }))
    const captions = photos.map((_, i) => buildCaption(i))

    return (
      <PolaroidStack
        images={images}
        cardWidth={cardWidth}
        captions={captions}
      />
    )
  }

  // ── Edit mode ────────────────────────────────────────────────────────────────
  const cardMargin = 12

  return (
    <View style={styles.editWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: 16 }]}
      >
        {photos.map((photo, index) => (
          <View
            key={photo.id}
            style={[styles.cardWrapper, { marginRight: cardMargin }]}
          >
            <PolaroidCard
              cardWidth={cardWidth * 0.55}
              imageSource={{ uri: photo.thumbnailMedium || photo.url }}
              caption={`Foto ${photo.position}`}
            />
            {onDelete && (
              <Pressable
                style={styles.deleteButton}
                onPress={() => onDelete(photo.id)}
                accessibilityLabel={`Ta bort foto ${index + 1}`}
                accessibilityRole="button"
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <Text style={styles.deleteIcon}>✕</Text>
              </Pressable>
            )}
          </View>
        ))}

        {onUpload && photos.length < 10 && (
          <Pressable
            onPress={onUpload}
            accessibilityLabel="Lägg till foto"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.uploadButton,
              {
                width: (cardWidth * 0.55),
                height: getPolaroidDimensions(cardWidth * 0.55).cardHeight,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={styles.uploadIcon}>+</Text>
          </Pressable>
        )}
      </ScrollView>

      <Text style={styles.countLabel}>{photos.length}/10 foton</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  editWrapper: {
    gap: 8,
  },
  scrollContent: {
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  cardWrapper: {
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deleteIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 14,
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(137,77,13,0.35)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    color: '#894d0d',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  countLabel: {
    color: '#9E8A7A',
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    backgroundColor: '#F5F0EB',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#9E8A7A',
    fontSize: 14,
  },
})
