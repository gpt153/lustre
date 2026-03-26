'use client'

import { useEffect, useRef } from 'react'
import { Animated, Dimensions, TouchableWithoutFeedback, StyleSheet } from 'react-native'
import { YStack, XStack } from 'tamagui'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

interface BottomSheetBaseProps {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
  snapHeight?: number  // default 60% of screen
}

export function BottomSheetBase({ visible, onClose, children, snapHeight }: BottomSheetBaseProps) {
  const sheetHeight = snapHeight ?? SCREEN_HEIGHT * 0.6
  const translateY = useRef(new Animated.Value(sheetHeight)).current
  const backdropOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, damping: 25, stiffness: 100, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.spring(translateY, { toValue: sheetHeight, damping: 25, stiffness: 100, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start()
    }
  }, [visible, sheetHeight])

  if (!visible) return null

  return (
    <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <Animated.View style={[styles.sheetContainer, { height: sheetHeight, transform: [{ translateY }] }]}>
        <YStack backgroundColor="#F5EDE4" borderTopLeftRadius={20} borderTopRightRadius={20} flex={1} overflow="hidden">
          {/* Drag handle */}
          <XStack justifyContent="center" paddingVertical="$2">
            <YStack width={40} height={4} borderRadius={2} backgroundColor="#C4956A" />
          </XStack>
          <YStack flex={1} padding="$4">
            {children}
          </YStack>
        </YStack>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 36, 33, 0.6)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
})
