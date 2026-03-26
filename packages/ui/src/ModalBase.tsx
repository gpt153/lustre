import { useEffect, useRef } from 'react'
import { Animated, Dimensions, TouchableWithoutFeedback, StyleSheet, Platform } from 'react-native'
import { YStack } from 'tamagui'

interface ModalBaseProps {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
}

export function ModalBase({ visible, onClose, children }: ModalBaseProps) {
  const backdropOpacity = useRef(new Animated.Value(0)).current
  const contentScale = useRef(new Animated.Value(0.95)).current
  const contentOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(contentScale, { toValue: 1, damping: 20, stiffness: 100, useNativeDriver: true }),
        Animated.timing(contentOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(contentScale, { toValue: 0.95, duration: 150, useNativeDriver: true }),
        Animated.timing(contentOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start()
    }
  }, [visible])

  if (!visible) return null

  return (
    <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <Animated.View style={[styles.contentWrapper, { opacity: contentOpacity, transform: [{ scale: contentScale }] }]}>
        <YStack backgroundColor="#F5EDE4" borderRadius={20} padding="$4" maxWidth={400} width="90%">
          {children}
        </YStack>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 36, 33, 0.6)',
    // Note: backdrop-filter works on web only, not RN
  },
  contentWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
})
