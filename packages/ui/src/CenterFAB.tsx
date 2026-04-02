import React from 'react'
import { Pressable, View, Platform, type ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated'

export interface CenterFABProps {
  onPress?: () => void
  rotated?: boolean // Wave 3: rotate 45deg to become X when QuickCreate is open
}

const FAB_SIZE = 56
const BORDER_WIDTH = 4
const ICON_SIZE = 28
const PRESS_SCALE = 0.9

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.8,
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function CenterFAB({ onPress, rotated = false }: CenterFABProps) {
  const pressed = useSharedValue(0)
  const rotation = useSharedValue(rotated ? 1 : 0)

  // Update rotation when prop changes
  React.useEffect(() => {
    rotation.value = withSpring(rotated ? 1 : 0, SPRING_CONFIG)
  }, [rotated, rotation])

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, PRESS_SCALE])
    const rotate = interpolate(rotation.value, [0, 1], [0, 45])

    return {
      transform: [{ scale }, { rotate: `${rotate}deg` }],
    }
  })

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withSpring(1, SPRING_CONFIG)
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, SPRING_CONFIG)
      }}
      accessibilityRole="button"
      accessibilityLabel="Skapa nytt"
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.borderWrapper}>
        <View style={styles.gradientWrapper}>
          <LinearGradient
            colors={['#894D0D', '#8C4F10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <MaterialIcons name="add" size={ICON_SIZE} color="#ffffff" />
          </LinearGradient>
        </View>
      </View>
    </AnimatedPressable>
  )
}

const styles: Record<string, ViewStyle> = {
  container: {
    marginTop: -24,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow must be on outer container — overflow:hidden on inner clips it
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(137, 77, 13, 1)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  borderWrapper: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    borderWidth: BORDER_WIDTH,
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
  gradientWrapper: {
    flex: 1,
    borderRadius: (FAB_SIZE - BORDER_WIDTH * 2) / 2,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}
