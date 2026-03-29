import React from 'react'
import { View, Pressable, Text, StyleSheet } from 'react-native'

export interface OverlayActionButtonsProps {
  onPass: () => void
  onSuperLike: () => void
  onLike: () => void
}

/**
 * Semi-transparent action buttons overlaid on the main discovery card photo.
 * Positioned top-right, 3 circular 32px buttons in a vertical column.
 */
export function OverlayActionButtons({
  onPass,
  onSuperLike,
  onLike,
}: OverlayActionButtonsProps) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Pass (X) */}
      <Pressable
        style={styles.button}
        onPress={onPass}
        accessibilityLabel="Passa"
        accessibilityRole="button"
        hitSlop={6}
      >
        <Text style={[styles.icon, styles.passIcon]}>{'✕'}</Text>
      </Pressable>

      {/* Super Like (Star) */}
      <Pressable
        style={styles.button}
        onPress={onSuperLike}
        accessibilityLabel="Superlike"
        accessibilityRole="button"
        hitSlop={6}
      >
        <Text style={[styles.icon, styles.superLikeIcon]}>{'★'}</Text>
      </Pressable>

      {/* Like (Heart) */}
      <Pressable
        style={styles.button}
        onPress={onLike}
        accessibilityLabel="Gilla"
        accessibilityRole="button"
        hitSlop={6}
      >
        <Text style={[styles.icon, styles.likeIcon]}>{'♥'}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'column',
    gap: 8,
    zIndex: 10,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    fontWeight: '600',
  },
  passIcon: {
    color: '#211a17', // on-surface
  },
  superLikeIcon: {
    color: '#795900', // secondary
    fontSize: 17,
  },
  likeIcon: {
    color: '#894d0d', // primary
    fontSize: 17,
  },
})
