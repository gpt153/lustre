import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PolaroidHeader } from '@/components/PolaroidHeader'
import {
  Gear,
  MapPin,
  Star,
  UsersThree,
  CalendarBlank,
  Heart,
  BookmarkSimple,
  Target,
  ShieldCheck,
  Coins,
  Lock,
  Question,
  SignOut,
  CaretRight,
} from 'phosphor-react-native'

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const COLORS = {
  screenBg: '#fff8f6',
  primaryContainer: '#894D0D',
  onSurface: '#211a17',
  outline: '#857467',
  outlineVariant: '#d8c3b4',
  surfaceContainerLow: '#fff1eb',
  primaryFixed: '#ffdcc2',
  surface: '#ffffff',
  error: '#ba1a1a',
  onSurfaceVariant: '#524439',
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockProfile = {
  name: 'Samuel',
  age: 29,
  location: 'Stockholm',
  bio: '"Analog soul in a digital world"',
  avatar: 'https://picsum.photos/192/192',
  verified: true,
  stats: {
    kudos: 124,
    groups: 3,
    events: 12,
  },
  posts: [
    { id: '1', photo: 'https://picsum.photos/200/200', likes: 12, rotation: -2 },
    { id: '2', photo: 'https://picsum.photos/201/201', likes: 45, rotation: 1.5 },
    { id: '3', photo: 'https://picsum.photos/202/202', likes: 28, rotation: -2 },
  ],
}

const collections = [
  {
    id: 'saved',
    icon: BookmarkSimple,
    label: 'Sparade profiler',
    detail: '8',
  },
  {
    id: 'intentions',
    icon: Target,
    label: 'Mina intentioner',
    detail: null, // shows tags instead
    tags: ['Utforska', 'Dejting'],
  },
  {
    id: 'safedate',
    icon: ShieldCheck,
    label: 'SafeDate historik',
    detail: null,
  },
]

const quickLinks = [
  { id: 'tokens', icon: Coins, label: 'Token & Prenumeration' },
  { id: 'privacy', icon: Lock, label: 'Integritetsinställningar' },
  { id: 'help', icon: Question, label: 'Hjälp & Support' },
]

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const POST_CARD_SIZE = (SCREEN_WIDTH - 32 - 16) / 3 // 16px padding each side + 8px gaps

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <PolaroidHeader
        title="Jag"
        rightIcon={Gear}
        onRightPress={() => {}}
        rightAccessibilityLabel="Inställningar"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 64 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Hero ─────────────────────────────────── */}
        <View style={styles.heroSection}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              <Image
                source={{ uri: mockProfile.avatar }}
                style={styles.avatarImage}
              />
            </View>
            {mockProfile.verified && (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={14} weight="fill" color="#ffffff" />
              </View>
            )}
          </View>

          {/* Name & age */}
          <Text style={styles.name}>
            {mockProfile.name}, {mockProfile.age}
          </Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <MapPin size={16} weight="fill" color={COLORS.outline} />
            <Text style={styles.locationText}>{mockProfile.location}</Text>
          </View>

          {/* Bio */}
          <Text style={styles.bio}>{mockProfile.bio}</Text>

          {/* Edit button */}
          <Pressable style={styles.editButton}>
            <Text style={styles.editButtonText}>Redigera profil</Text>
          </Pressable>
        </View>

        {/* ── Stats Row ────────────────────────────────────── */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statValueRow}>
              <Star size={18} weight="fill" color={COLORS.primaryContainer} />
              <Text style={styles.statNumber}>{mockProfile.stats.kudos}</Text>
            </View>
            <Text style={styles.statLabel}>KUDOS</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statValueRow}>
              <UsersThree
                size={18}
                weight="fill"
                color={COLORS.primaryContainer}
              />
              <Text style={styles.statNumber}>{mockProfile.stats.groups}</Text>
            </View>
            <Text style={styles.statLabel}>GRUPPER</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statValueRow}>
              <CalendarBlank
                size={18}
                weight="fill"
                color={COLORS.primaryContainer}
              />
              <Text style={styles.statNumber}>{mockProfile.stats.events}</Text>
            </View>
            <Text style={styles.statLabel}>EVENT</Text>
          </View>
        </View>

        {/* ── Mina inlägg ──────────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mina inlägg</Text>
          <View style={styles.postsGrid}>
            {mockProfile.posts.map((post) => (
              <View
                key={post.id}
                style={[
                  styles.postCard,
                  { transform: [{ rotate: `${post.rotation}deg` }] },
                ]}
              >
                <Image
                  source={{ uri: post.photo }}
                  style={styles.postImage}
                />
                {/* Like badge */}
                <View style={styles.postLikeBadge}>
                  <Heart size={10} weight="fill" color="#ffffff" />
                  <Text style={styles.postLikeText}>{post.likes}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Mina samlingar ───────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mina samlingar</Text>
          {collections.map((item) => {
            const Icon = item.icon
            return (
              <Pressable key={item.id} style={styles.collectionCard}>
                <View style={styles.collectionIconCircle}>
                  <Icon
                    size={20}
                    weight="fill"
                    color={COLORS.primaryContainer}
                  />
                </View>
                <View style={styles.collectionContent}>
                  <Text style={styles.collectionLabel}>{item.label}</Text>
                  {item.tags ? (
                    <View style={styles.collectionTagsRow}>
                      {item.tags.map((tag) => (
                        <View key={tag} style={styles.collectionTag}>
                          <Text style={styles.collectionTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
                <View style={styles.collectionRight}>
                  {item.detail ? (
                    <Text style={styles.collectionDetail}>{item.detail}</Text>
                  ) : null}
                  <CaretRight
                    size={16}
                    weight="bold"
                    color={COLORS.outlineVariant}
                  />
                </View>
              </Pressable>
            )
          })}
        </View>

        {/* ── Quick Links ──────────────────────────────────── */}
        <View style={styles.quickLinksContainer}>
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Pressable key={link.id} style={styles.quickLink}>
                <Icon size={24} weight="regular" color={COLORS.outline} />
                <Text style={styles.quickLinkText}>{link.label}</Text>
              </Pressable>
            )
          })}
        </View>

        {/* ── Logout ───────────────────────────────────────── */}
        <Pressable style={styles.logoutButton}>
          <SignOut size={20} weight="bold" color={COLORS.error} />
          <Text style={styles.logoutText}>Logga ut</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // ── Hero ──
  heroSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarRing: {
    width: 102,
    height: 102,
    borderRadius: 51,
    borderWidth: 3,
    borderColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.screenBg,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: 'NotoSerif_700Bold',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.outline,
  },
  bio: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.outline,
    marginBottom: 16,
    textAlign: 'center',
  },
  editButton: {
    borderWidth: 1,
    borderColor: COLORS.primaryContainer,
    borderRadius: 9999,
    paddingHorizontal: 32,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryContainer,
  },

  // ── Stats ──
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginTop: 24,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow
    shadowColor: '#211a17',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryContainer,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.outline,
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.outlineVariant,
    opacity: 0.3,
  },

  // ── Posts Grid ──
  sectionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: 'NotoSerif_700Bold',
    marginBottom: 12,
  },
  postsGrid: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  postCard: {
    width: POST_CARD_SIZE,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    padding: 8,
    paddingBottom: 24,
    // Shadow
    shadowColor: '#211a17',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 2,
    backgroundColor: '#f0e8e4',
  },
  postLikeBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 9999,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  postLikeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },

  // ── Collections ──
  collectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    // Shadow
    shadowColor: '#211a17',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  collectionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  collectionContent: {
    flex: 1,
  },
  collectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  collectionTagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  collectionTag: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  collectionTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.outline,
  },
  collectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  collectionDetail: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.outline,
  },

  // ── Quick Links ──
  quickLinksContainer: {
    marginTop: 24,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(216, 195, 180, 0.20)',
  },
  quickLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },

  // ── Logout ──
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.error,
  },
})
