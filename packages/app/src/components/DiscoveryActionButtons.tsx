import { StyleSheet, Pressable, View } from 'react-native'
import { Text } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient'

// Stitch design tokens
const PRIMARY = '#894d0d'
const PRIMARY_CONTAINER = '#a76526'
const TERTIARY = '#9f3c1e'
const SECONDARY_FIXED_DIM = '#eec058'
const SURFACE_CONTAINER_LOWEST = '#ffffff'
const CHARCOAL = '#2C2421'
const WARM_WHITE = '#fef8f3'

interface DiscoveryActionButtonsProps {
  onPass: () => void
  onSuperLike?: () => void
  onLike: () => void
  disabled?: boolean
  passPressed?: boolean
  likePressed?: boolean
}

function PassIcon() {
  return <Text style={styles.passIconText}>✕</Text>
}

function SuperLikeIcon() {
  return <Text style={styles.superLikeIconText}>★</Text>
}

function LikeIcon() {
  return <Text style={styles.likeIconText}>♥</Text>
}

export function DiscoveryActionButtons({
  onPass,
  onSuperLike,
  onLike,
  disabled = false,
  passPressed = false,
  likePressed = false,
}: DiscoveryActionButtonsProps) {
  return (
    <View style={styles.actionRow}>
      {/* Pass — 64px white bg, tertiary icon */}
      <Pressable
        style={[
          styles.actionButton,
          styles.passButton,
          passPressed && styles.passButtonActive,
          disabled && styles.buttonDisabled,
        ]}
        onPress={onPass}
        disabled={disabled}
        accessibilityLabel="Passa"
        accessibilityRole="button"
        accessibilityHint="Svep vidare till nasta profil"
      >
        <PassIcon />
      </Pressable>

      {/* Super Like — 48px transparent bg with secondary-fixed-dim icon */}
      <Pressable
        style={[
          styles.actionButton,
          styles.superLikeButton,
          disabled && styles.buttonDisabled,
        ]}
        onPress={onSuperLike}
        disabled={disabled}
        accessibilityLabel="Superlike"
        accessibilityRole="button"
        accessibilityHint="Skicka en spark"
      >
        <SuperLikeIcon />
      </Pressable>

      {/* Like — 80px copper gradient bg, white heart */}
      <Pressable
        style={[
          styles.actionButton,
          likePressed && styles.likeButtonActive,
          disabled && styles.buttonDisabled,
        ]}
        onPress={onLike}
        disabled={disabled}
        accessibilityLabel="Gilla"
        accessibilityRole="button"
        accessibilityHint="Visa intresse for denna profil"
      >
        <LinearGradient
          colors={[PRIMARY, PRIMARY_CONTAINER]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.likeGradient}
        >
          <LikeIcon />
        </LinearGradient>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },

  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CHARCOAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },

  // Pass — 64px white circle with tertiary X
  passButton: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    backgroundColor: SURFACE_CONTAINER_LOWEST,
  },
  passButtonActive: {
    backgroundColor: '#f5e5e0',
  },
  passIconText: {
    fontSize: 28,
    color: TERTIARY,
    fontWeight: '300',
  } as any,

  // Super Like — 48px transparent with gold border
  superLikeButton: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: 'rgba(238, 192, 88, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  superLikeIconText: {
    fontSize: 28,
    color: SECONDARY_FIXED_DIM,
  } as any,

  // Like — 80px copper gradient
  likeButtonActive: {
    opacity: 0.85,
  },
  likeIconText: {
    fontSize: 32,
    color: WARM_WHITE,
  } as any,
  likeGradient: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CHARCOAL,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },

  buttonDisabled: {
    opacity: 0.5,
  },
})
