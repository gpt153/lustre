import { StyleSheet, Dimensions, Image } from 'react-native'
import { Text } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient'
import Animated from 'react-native-reanimated'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const CARD_WIDTH = screenWidth - 16
const CARD_HEIGHT = screenHeight * 0.82

interface SwipeCardProfile {
  displayName: string
  age?: number
  bio?: string | null
  distance?: number
  photos?: Array<{ url?: string | null; thumbnailLarge?: string | null }>
  [key: string]: unknown
}

interface SwipeCardProps {
  profile: SwipeCardProfile
  animatedStyle?: ReturnType<typeof import('react-native-reanimated').useAnimatedStyle>
  children?: React.ReactNode
}

export function SwipeCard({ profile, animatedStyle, children }: SwipeCardProps) {
  const photoUrl = profile.photos?.[0]?.thumbnailLarge || profile.photos?.[0]?.url

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={styles.photo}
          resizeMode="cover"
        />
      ) : (
        <Animated.View style={styles.photoPlaceholder} />
      )}

      <LinearGradient
        colors={['transparent', 'rgba(137, 77, 13, 0.25)', 'rgba(44, 36, 33, 0.85)']}
        locations={[0.35, 0.65, 1.0]}
        style={styles.gradient}
      >
        <Text style={styles.name}>
          {profile.displayName}
          {profile.age ? `, ${profile.age}` : ''}
        </Text>
        {profile.distance != null && (
          <Text style={styles.meta}>{profile.distance} km away</Text>
        )}
      </LinearGradient>

      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#2C2421',
    shadowColor: '#2C2421',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },
  photo: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#ece7e2',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  name: {
    fontSize: 32,
    fontFamily: 'NotoSerif_700Bold',
    color: '#fef8f3',
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: '#D4A574',
  },
})
