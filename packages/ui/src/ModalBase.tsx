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
        Animated.spring(contentScale, { toValue: 1, damping: 18, stiffness: 100, useNativeDriver: true }),
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
        <YStack
          backgroundColor="#ffffff"
          borderRadius={32}
          padding="$md"
          maxWidth={400}
          width="90%"
          shadowColor="#2C2421"
          shadowOffset={{ width: 0, height: 16 }}
          shadowOpacity={0.06}
          shadowRadius={48}
        >
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
  },
  contentWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
})
