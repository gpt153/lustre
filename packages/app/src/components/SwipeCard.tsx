import { StyleSheet, Dimensions, Image } from 'react-native'
import { Text } from 'tamagui'
import { LinearGradient } from '@tamagui/linear-gradient'
import Animated from 'react-native-reanimated'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const CARD_WIDTH = screenWidth * 0.9
const CARD_HEIGHT = screenHeight * 0.75

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
        colors={['transparent', 'rgba(44,36,33,0.8)']}
        start={[0, 0]}
        end={[0, 1]}
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
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#2C2421',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
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
    backgroundColor: '#4A3C38',
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
    fontSize: 20,
    fontFamily: 'GeneralSans-Semibold',
    color: '#FDF8F3',
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: '#D4A574',
  },
})
