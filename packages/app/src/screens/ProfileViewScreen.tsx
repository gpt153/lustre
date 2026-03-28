import { YStack, XStack, Text, ScrollView, Image } from 'tamagui'
import { LinearGradient } from '@tamagui/linear-gradient'
import { CardBase, LustreButton } from '@lustre/ui'
import { PROMPT_OPTIONS } from '@lustre/api'
import { ProfileKudosSection } from '../components/ProfileKudosSection'
import { Dimensions } from 'react-native'

interface ProfileViewProps {
  profile: {
    userId: string
    displayName: string
    age: number
    gender: string
    orientation: string
    relationshipType: string | null
    seeking: string[]
    verified: boolean
    photos: any[]
    kinkTags: { kinkTag: { name: string; category: string }; interestLevel: string; isPublic: boolean }[]
    prompts?: Array<{ promptKey: string; response: string; order: number }>
  }
  isOwnProfile?: boolean
  onEdit?: () => void
  onLogout?: () => void
}

const SCREEN_WIDTH = Dimensions.get('window').width
const HERO_HEIGHT = Dimensions.get('window').height * 0.45

// Lustre design tokens
const tokens = {
  copper: '#894d0d',
  copperLight: '#D4A574',
  copperMuted: '#C4956A',
  gold: '#D4A843',
  goldBright: '#E8B84B',
  warmWhite: '#fef8f3',
  warmCream: '#F5EDE4',
  charcoal: '#2C2421',
  warmGray: '#8B7E74',
  ember: '#E05A33',
  surface: '#fef8f3',
  surfaceContainer: '#f2ede8',
  surfaceContainerLow: '#f8f3ee',
  outlineVariant: '#d8c3b4',
  ghostBorder: 'rgba(216, 195, 180, 0.20)',
}

export function ProfileViewScreen({ profile, isOwnProfile = false, onEdit, onLogout }: ProfileViewProps) {
  const sortedPrompts = (profile.prompts || []).sort((a, b) => a.order - b.order)

  const renderContent = () => {
    const items: Array<{ type: 'photo' | 'prompt'; data: any; key: string }> = []

    if (profile.photos.length > 0) {
      items.push({
        type: 'photo',
        data: profile.photos[0],
        key: `photo-0`,
      })
    }

    sortedPrompts.forEach((prompt, index) => {
      items.push({
        type: 'prompt',
        data: prompt,
        key: `prompt-${index}`,
      })

      if (index + 1 < profile.photos.length) {
        items.push({
          type: 'photo',
          data: profile.photos[index + 1],
          key: `photo-${index + 1}`,
        })
      }
    })

    for (let i = sortedPrompts.length + 1; i < profile.photos.length; i++) {
      items.push({
        type: 'photo',
        data: profile.photos[i],
        key: `photo-${i}`,
      })
    }

    return items
  }

  const contentItems = renderContent()

  // Separate hero photo from remaining content items
  const heroPhoto = profile.photos.length > 0 ? profile.photos[0] : null
  const remainingPhotos = profile.photos.slice(1)
  const promptItems = contentItems.filter((item) => item.type === 'prompt')
  const nonHeroPhotoItems = contentItems.filter(
    (item) => item.type === 'photo' && item.key !== 'photo-0'
  )

  // Bio from first prompt or fallback
  const bioPrompt = promptItems.find(
    (item) => item.data.promptKey === 'about_me' || item.data.promptKey === 'bio'
  )
  const otherPrompts = promptItems.filter((item) => item !== bioPrompt)

  return (
    <ScrollView backgroundColor={tokens.surface} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <YStack position="relative" height={HERO_HEIGHT} width="100%">
        {heroPhoto && (
          <Image
            source={{ uri: heroPhoto.thumbnailMedium || heroPhoto.url }}
            width="100%"
            height="100%"
            objectFit="cover"
          />
        )}

        {/* Dark gradient overlay */}
        <YStack position="absolute" bottom={0} left={0} right={0} height="60%">
          <LinearGradient
            colors={['transparent', 'rgba(137, 77, 13, 0.15)', 'rgba(254, 248, 243, 1)']}
            start={[0, 0]}
            end={[0, 1]}
            width="100%"
            height="100%"
          />
        </YStack>

        {/* Name, age, badge overlaid on hero */}
        <YStack
          position="absolute"
          bottom={48}
          left={24}
          right={24}
          zIndex={10}
          gap={4}
        >
          <XStack alignItems="center" gap={8}>
            <Text
              fontFamily="$heading"
              fontSize={32}
              fontWeight="700"
              color="white"
            >
              {profile.displayName}, {profile.age}
            </Text>
            {profile.verified && (
              <Text fontSize={22} color={tokens.copperLight}>
                ✓
              </Text>
            )}
          </XStack>
          <XStack alignItems="center" gap={6}>
            <Text fontSize={14} color="rgba(255,255,255,0.9)">
              📍
            </Text>
            <Text
              fontSize={14}
              color="rgba(255,255,255,0.9)"
              letterSpacing={0.5}
            >
              Stockholm
            </Text>
          </XStack>
        </YStack>
      </YStack>

      {/* Main Content Canvas — rounded top overlapping hero */}
      <YStack
        backgroundColor={tokens.surface}
        borderTopLeftRadius={40}
        borderTopRightRadius={40}
        marginTop={-24}
        position="relative"
        zIndex={20}
        paddingTop={40}
        paddingHorizontal={24}
        paddingBottom={48}
      >
        {/* Stats Row */}
        <XStack alignItems="center" gap={24} marginBottom={40} paddingHorizontal={8}>
          <XStack alignItems="center" gap={8}>
            <Text fontSize={18} color={tokens.copper}>🏅</Text>
            <Text fontWeight="600" fontSize={14} color={tokens.charcoal}>
              4 kudos
            </Text>
          </XStack>
          <XStack alignItems="center" gap={8}>
            <Text fontSize={18} color={tokens.copper}>🎖️</Text>
            <Text fontWeight="600" fontSize={14} color={tokens.charcoal}>
              2 badges
            </Text>
          </XStack>
        </XStack>

        {/* Om mig (Bio) Section */}
        {(bioPrompt || sortedPrompts.length > 0) && (
          <YStack marginBottom={48}>
            <Text
              fontFamily="$heading"
              fontSize={22}
              fontWeight="700"
              color={tokens.charcoal}
              marginBottom={16}
            >
              Om mig
            </Text>
            {bioPrompt ? (
              <Text
                fontSize={15}
                color={tokens.warmGray}
                lineHeight={26}
                opacity={0.9}
              >
                {bioPrompt.data.response}
              </Text>
            ) : sortedPrompts.length > 0 ? (
              <Text
                fontSize={15}
                color={tokens.warmGray}
                lineHeight={26}
                opacity={0.9}
              >
                {sortedPrompts[0].response}
              </Text>
            ) : null}
          </YStack>
        )}

        {/* Prompts — remaining prompts as cards */}
        {(bioPrompt ? otherPrompts : promptItems.slice(1)).map((item) => (
          <YStack key={item.key} marginBottom={24}>
            <CardBase elevation={1} gap="$sm">
              <Text
                color={tokens.warmGray}
                fontFamily="$heading"
                fontSize={14}
                fontWeight="600"
              >
                {PROMPT_OPTIONS[item.data.promptKey] || item.data.promptKey}
              </Text>
              <Text
                color={tokens.charcoal}
                fontSize={16}
                fontWeight="500"
                lineHeight={24}
              >
                {item.data.response}
              </Text>
            </CardBase>
          </YStack>
        ))}

        {/* Interest Tags — copper-outlined rounded pills */}
        {profile.seeking.length > 0 && (
          <YStack marginBottom={48}>
            <XStack flexWrap="wrap" gap={12}>
              {profile.seeking.map((s: string) => (
                <YStack
                  key={s}
                  paddingHorizontal={20}
                  paddingVertical={10}
                  borderRadius={9999}
                  borderWidth={1}
                  borderColor={tokens.ghostBorder}
                  backgroundColor={tokens.surfaceContainerLow}
                >
                  <Text
                    fontSize={14}
                    fontWeight="500"
                    color={tokens.copper}
                  >
                    {s.replace(/_/g, ' ').toLowerCase()}
                  </Text>
                </YStack>
              ))}
            </XStack>
          </YStack>
        )}

        {/* Relation */}
        {profile.relationshipType && (
          <YStack marginBottom={24}>
            <CardBase elevation={1} gap="$xs">
              <Text
                color={tokens.warmGray}
                fontFamily="$heading"
                fontSize={14}
                fontWeight="600"
              >
                Relation
              </Text>
              <Text
                color={tokens.charcoal}
                fontSize={16}
                fontWeight="500"
              >
                {profile.relationshipType.replace(/_/g, ' ').toLowerCase()}
              </Text>
            </CardBase>
          </YStack>
        )}

        {/* Kink Tags — copper-outlined rounded pills */}
        {profile.kinkTags.length > 0 && (
          <YStack marginBottom={48}>
            <Text
              fontFamily="$heading"
              fontSize={22}
              fontWeight="700"
              color={tokens.charcoal}
              marginBottom={16}
            >
              Intressen
            </Text>
            <XStack flexWrap="wrap" gap={12}>
              {profile.kinkTags.map((kt: any) => (
                <XStack
                  key={kt.kinkTag.name}
                  paddingHorizontal={20}
                  paddingVertical={10}
                  borderRadius={9999}
                  borderWidth={1}
                  borderColor={tokens.ghostBorder}
                  backgroundColor={tokens.surfaceContainerLow}
                  alignItems="center"
                  gap={6}
                >
                  <Text
                    fontSize={14}
                    fontWeight="500"
                    color={tokens.copper}
                  >
                    {kt.kinkTag.name}
                  </Text>
                  <Text fontSize={12}>
                    {kt.interestLevel === 'LOVE' ? '❤️' : kt.interestLevel === 'LIKE' ? '👍' : '🤔'}
                  </Text>
                </XStack>
              ))}
            </XStack>
          </YStack>
        )}

        {/* Photo Grid — 2-column layout with rounded corners and copper border */}
        {remainingPhotos.length > 0 && (
          <YStack marginBottom={48}>
            <XStack flexWrap="wrap" gap={12}>
              {remainingPhotos.map((photo: any, index: number) => {
                const isLarge = index === 0 && remainingPhotos.length >= 3
                const photoSize = isLarge
                  ? (SCREEN_WIDTH - 48 - 12) * (2 / 3)
                  : (SCREEN_WIDTH - 48 - 12) / 2

                return (
                  <YStack
                    key={`grid-photo-${index}`}
                    width={isLarge ? '100%' : photoSize}
                    height={photoSize}
                    borderRadius={16}
                    overflow="hidden"
                    borderWidth={1}
                    borderColor={tokens.ghostBorder}
                    backgroundColor={tokens.surfaceContainer}
                  >
                    <Image
                      source={{ uri: photo.thumbnailMedium || photo.url }}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                  </YStack>
                )
              })}
            </XStack>
          </YStack>
        )}

        {/* Kudos Section */}
        <ProfileKudosSection userId={profile.userId} />

        {/* Redigera profil — full-width copper gradient button */}
        {isOwnProfile && onEdit && (
          <YStack
            marginTop={32}
            width="100%"
            height={56}
            borderRadius={9999}
            overflow="hidden"
            pressStyle={{ scale: 0.98 }}
            onPress={onEdit}
            shadowColor="#2C2421"
            shadowOffset={{ width: 0, height: 8 }}
            shadowOpacity={0.06}
            shadowRadius={24}
            elevation={4}
          >
            <LinearGradient
              colors={['#894d0d', '#a76526']}
              start={[0, 0]}
              end={[1, 1]}
              width="100%"
              height="100%"
              justifyContent="center"
              alignItems="center"
            >
              <Text
                color="white"
                fontWeight="700"
                fontSize={14}
                letterSpacing={2}
                textTransform="uppercase"
              >
                Redigera profil
              </Text>
            </LinearGradient>
          </YStack>
        )}

        {/* Logga ut */}
        {isOwnProfile && onLogout && (
          <LustreButton
            onPress={onLogout}
            variant="danger"
            width="100%"
            marginTop="$4"
          >
            Logga ut
          </LustreButton>
        )}
      </YStack>
    </ScrollView>
  )
}
