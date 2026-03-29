import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Constants from 'expo-constants'
import { useAuthStore } from '@lustre/app/src/stores/authStore'
import { PolaroidCard } from '@lustre/ui'

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'https://api.lovelustre.com'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Polaroid card data matching Stitch reference
const POLAROID_CARDS = [
  {
    id: 1,
    imageUrl: 'https://picsum.photos/id/1005/400/400',
    caption: 'Sunday Coffee',
    rotation: -12,
    cardWidth: 150,
    style: { top: 20, left: SCREEN_WIDTH * 0.05 },
    zIndex: 1,
  },
  {
    id: 2,
    imageUrl: 'https://picsum.photos/id/1012/400/400',
    caption: 'In the park',
    rotation: 6,
    cardWidth: 150,
    style: { top: 80, right: SCREEN_WIDTH * 0.02 },
    zIndex: 2,
  },
  {
    id: 3,
    imageUrl: 'https://picsum.photos/id/1027/400/400',
    caption: 'Unfiltered',
    rotation: -2,
    cardWidth: 155,
    style: { top: 170, left: SCREEN_WIDTH * 0.12 },
    zIndex: 3,
  },
  {
    id: 4,
    imageUrl: 'https://picsum.photos/id/1025/400/400',
    caption: 'Real moments',
    rotation: 3,
    cardWidth: 160,
    style: { top: 100, left: SCREEN_WIDTH * 0.30 },
    zIndex: 5,
  },
  {
    id: 5,
    imageUrl: 'https://picsum.photos/id/1011/400/400',
    caption: undefined,
    rotation: -6,
    cardWidth: 130,
    style: { top: -10, left: SCREEN_WIDTH * 0.01 },
    zIndex: 0,
    opacity: 0.8,
  },
]

export default function WelcomeScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [devLoading, setDevLoading] = useState(false)
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)

  const handleSignup = () => {
    setIsLoading(true)
    router.push('/(auth)/swish-verify')
  }

  const handleLogin = () => {
    setIsLoading(true)
    router.push('/(auth)/login')
  }

  const handleDevLogin = async () => {
    setDevLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/dev/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: 'Samuel' }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setTokens(data.accessToken, data.refreshToken)
      setUser(data.user.id, data.user.displayName)
    } catch (err) {
      Alert.alert('Dev Login Failed', `Kunde inte nå API:t (${API_URL}).\n\n${err}`)
    } finally {
      setDevLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header / Branding */}
      <View style={styles.header}>
        <Text style={styles.logo}>LUSTRE</Text>
        <Text style={styles.tagline}>Your moments, unfiltered</Text>
      </View>

      {/* Scattered Polaroid Cards */}
      <View style={styles.polaroidArea}>
        {POLAROID_CARDS.map((card) => (
          <PolaroidCard
            key={card.id}
            cardWidth={card.cardWidth}
            imageUrl={card.imageUrl}
            caption={card.caption}
            rotation={card.rotation}
            style={{
              position: 'absolute',
              ...card.style,
              zIndex: card.zIndex,
              opacity: card.opacity ?? 1,
            }}
          />
        ))}
      </View>

      {/* Bottom CTA Section */}
      <View style={styles.footer}>
        {/* Tagline */}
        <View style={styles.taglineSection}>
          <Text style={styles.ctaHeadline}>Where real connections begin</Text>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          {/* Copper gradient "Skapa konto" button */}
          <Pressable
            onPress={handleSignup}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={['#894D0D', '#A76526']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Skapa konto</Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* Text-only "Logga in" button */}
          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Logga in</Text>
          </Pressable>
        </View>

        {/* Dev Login */}
        <Pressable
          onPress={handleDevLogin}
          disabled={devLoading}
          style={styles.devButton}
        >
          {devLoading ? (
            <ActivityIndicator size="small" color="#857467" />
          ) : (
            <Text style={styles.devButtonText}>Dev Login (Samuel)</Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8F3',
  },
  header: {
    paddingTop: 64,
    paddingBottom: 8,
    alignItems: 'center',
  },
  logo: {
    fontSize: 30,
    fontFamily: 'Manrope_700Bold',
    fontWeight: '800',
    letterSpacing: 6,
    color: '#894D0D',
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: '#A76526',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  polaroidArea: {
    flex: 1,
    position: 'relative',
    marginTop: 16,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    paddingTop: 16,
    alignItems: 'center',
    gap: 24,
  },
  taglineSection: {
    alignItems: 'center',
    gap: 12,
  },
  ctaHeadline: {
    fontSize: 18,
    fontFamily: 'Manrope_500Medium',
    color: '#211A17',
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D8C3B4',
  },
  dotActive: {
    backgroundColor: '#894D0D',
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2E1500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    fontWeight: '700',
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#894D0D',
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    fontWeight: '600',
  },
  devButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#D8C3B4',
    borderRadius: 12,
    alignItems: 'center',
    opacity: 0.6,
  },
  devButtonText: {
    color: '#857467',
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
  },
})
