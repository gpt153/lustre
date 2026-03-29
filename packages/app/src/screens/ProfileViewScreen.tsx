import { useState, useCallback } from 'react'
import { YStack, XStack, Text, ScrollView } from 'tamagui'
import { LinearGradient } from '@tamagui/linear-gradient'
import { CardBase, LustreButton, PolaroidStack } from '@lustre/ui'
import { PROMPT_OPTIONS } from '@lustre/api'
import { ProfileKudosSection } from '../components/ProfileKudosSection'
import { Dimensions, type ImageSourcePropType } from 'react-native'
// Design tokens from @lustre/tokens used via inline values

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
  onMessage?: () => void
  onLike?: () => void
}

const SCREEN_WIDTH = Dimensions.get('window').width

// Design tokens from Stitch
const tokens = {
  copper: '#894d0d',
  copperContainer: '#a76526',
  warmWhite: '#FDF8F3',
  charcoal: '#2C2421',
  warmGray: '#8B7E74',
  surface: '#fff8f6',
  surfaceContainer: '#faebe6',
  surfaceContainerHigh: '#f4e5e0',
  surfaceContainerLow: '#fff1ec',
  outlineVariant: '#d8c3b4',
  onSurface: '#211a17',
  onSurfaceVariant: '#524439',
  onSecondaryContainer: '#755700',
  secondaryContainer30: 'rgba(254, 206, 101, 0.30)',
  ghostBorder: 'rgba(216, 195, 180, 0.20)',
  primaryAlpha20: 'rgba(137, 77, 13, 0.20)',
  tertiary: '#9f3c1e',
  outlineVariantAlpha30: 'rgba(216, 195, 180, 0.30)',
}

// Front card w-80 = 320px, but constrain to screen
const FRONT_CARD_WIDTH = Math.min(320, SCREEN_WIDTH - 48)
const STACK_HEIGHT = 480

export function ProfileViewScreen({
  profile,
  isOwnProfile = false,
  onEdit,
  onLogout,
  onMessage,
  onLike,
}: ProfileViewProps) {
  const sortedPrompts = (profile.prompts || []).sort((a, b) => a.order - b.order)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  // Build photo sources for PolaroidStack
  const photoSources: ImageSourcePropType[] = profile.photos.map((photo: any) => ({
    uri: photo.thumbnailMedium || photo.url,
  }))

  // Build captions array (first photo gets a caption, rest empty)
  const captions: string[] = profile.photos.map((_: any, index: number) => {
    if (index === 0 && sortedPrompts.length > 0) {
      // Use first prompt as caption for front card if short enough
      const firstPrompt = sortedPrompts[0]
      if (firstPrompt && firstPrompt.response.length <= 60) {
        return firstPrompt.response
      }
    }
    return ''
  })

  const handleSwipe = useCallback((newIndex: number) => {
    setActivePhotoIndex(newIndex)
  }, [])

  // Bio from prompts
  const bioPrompt = sortedPrompts.find(
    (p) => p.promptKey === 'about_me' || p.promptKey === 'bio'
  )
  const bioText = bioPrompt?.response || (sortedPrompts.length > 0 ? sortedPrompts[0].response : null)
  const otherPrompts = sortedPrompts.filter(
    (p) => p !== bioPrompt && p !== sortedPrompts[0]
  )

  return (
    <ScrollView backgroundColor={tokens.warmWhite} showsVerticalScrollIndicator={false}>
      {/* Top App Bar */}
      <XStack
        paddingHorizontal={24}
        paddingVertical={16}
        alignItems="center"
        justifyContent="space-between"
        backgroundColor={tokens.warmWhite}
      >
        <XStack width={32} />
        <Text
          fontFamily="$heading"
          fontWeight="700"
          fontSize={18}
          letterSpacing={-0.3}
          color={tokens.copper}
        >
          {profile.displayName}, {profile.age}
        </Text>
        <XStack width={32} alignItems="center" justifyContent="center">
          {profile.verified && (
            <Text fontSize={20} color={tokens.copper}>
              {''}
            </Text>
          )}
        </XStack>
      </XStack>

      {/* Polaroid Stack Section */}
      <YStack
        alignItems="center"
        justifyContent="center"
        height={STACK_HEIGHT}
        marginTop={24}
        paddingHorizontal={24}
      >
        {photoSources.length > 0 ? (
          <PolaroidStack
            images={photoSources}
            cardWidth={FRONT_CARD_WIDTH}
            captions={captions}
            activeIndex={activePhotoIndex}
            onSwipe={handleSwipe}
          />
        ) : (
          <YStack
            width={FRONT_CARD_WIDTH}
            height={FRONT_CARD_WIDTH}
            backgroundColor="white"
            borderRadius={4}
            alignItems="center"
            justifyContent="center"
            shadowColor="#2E1500"
            shadowOffset={{ width: 0, height: 8 }}
            shadowOpacity={0.12}
            shadowRadius={24}
            elevation={4}
          >
            <Text color={tokens.warmGray} fontSize={16}>
              Inga foton
            </Text>
          </YStack>
        )}
      </YStack>

      {/* Swipe counter text below dots */}
      {profile.photos.length > 1 && (
        <YStack alignItems="center" marginTop={4}>
          <Text
            fontSize={10}
            fontWeight="500"
            color={tokens.warmGray}
            letterSpacing={2}
            textTransform="uppercase"
          >
            {activePhotoIndex + 1}/{profile.photos.length}
          </Text>
        </YStack>
      )}

      {/* Bio Section */}
      <YStack paddingHorizontal={24} marginTop={48} gap={32}>
        {/* About heading + bio card */}
        {bioText && (
          <YStack gap={16}>
            <Text
              fontFamily="$heading"
              fontWeight="700"
              fontSize={24}
              letterSpacing={-0.5}
              color={tokens.copper}
            >
              Om {profile.displayName}
            </Text>
            <YStack
              backgroundColor={tokens.surfaceContainer}
              padding={24}
              borderRadius={16}
              borderLeftWidth={4}
              borderLeftColor={tokens.primaryAlpha20}
            >
              <Text
                fontSize={15}
                color={tokens.onSurfaceVariant}
                lineHeight={26}
              >
                {bioText}
              </Text>
            </YStack>
          </YStack>
        )}

        {/* Remaining Prompts as cards */}
        {otherPrompts.length > 0 && (
          <YStack gap={16}>
            {otherPrompts.map((prompt, index) => (
              <YStack key={`prompt-${index}`}>
                <CardBase elevation={1} gap="$sm">
                  <Text
                    color={tokens.warmGray}
                    fontFamily="$heading"
                    fontSize={14}
                    fontWeight="600"
                  >
                    {PROMPT_OPTIONS[prompt.promptKey] || prompt.promptKey}
                  </Text>
                  <Text
                    fontSize={16}
                    fontWeight="500"
                    color={tokens.charcoal}
                    lineHeight={24}
                  >
                    {prompt.response}
                  </Text>
                </CardBase>
              </YStack>
            ))}
          </YStack>
        )}

        {/* Interest Tags — rounded-full pills, secondary-container/30 */}
        {profile.kinkTags.length > 0 && (
          <YStack gap={16}>
            <Text
              fontFamily="$heading"
              fontWeight="600"
              fontSize={18}
              color={tokens.onSurface}
            >
              Intressen
            </Text>
            <XStack flexWrap="wrap" gap={12}>
              {profile.kinkTags.map((kt: any) => (
                <YStack
                  key={kt.kinkTag.name}
                  paddingHorizontal={20}
                  paddingVertical={10}
                  borderRadius={9999}
                  backgroundColor={tokens.secondaryContainer30}
                >
                  <Text
                    fontSize={14}
                    fontWeight="500"
                    color={tokens.onSecondaryContainer}
                  >
                    {kt.kinkTag.name}
                  </Text>
                </YStack>
              ))}
            </XStack>
          </YStack>
        )}

        {/* Seeking tags */}
        {profile.seeking.length > 0 && (
          <YStack gap={16}>
            <Text
              fontFamily="$heading"
              fontWeight="600"
              fontSize={18}
              color={tokens.onSurface}
            >
              Soker
            </Text>
            <XStack flexWrap="wrap" gap={12}>
              {profile.seeking.map((s: string) => (
                <YStack
                  key={s}
                  paddingHorizontal={20}
                  paddingVertical={10}
                  borderRadius={9999}
                  backgroundColor={tokens.secondaryContainer30}
                >
                  <Text
                    fontSize={14}
                    fontWeight="500"
                    color={tokens.onSecondaryContainer}
                  >
                    {s.replace(/_/g, ' ').toLowerCase()}
                  </Text>
                </YStack>
              ))}
            </XStack>
          </YStack>
        )}

        {/* Relation type */}
        {profile.relationshipType && (
          <YStack>
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

        {/* Kudos Section */}
        <ProfileKudosSection userId={profile.userId} />

        {/* Action Buttons — Message (gradient) + Heart (outlined) */}
        {!isOwnProfile && (
          <XStack gap={16} paddingTop={16}>
            {/* Message button — gradient copper */}
            <YStack
              flex={1}
              height={56}
              borderRadius={16}
              overflow="hidden"
              pressStyle={{ scale: 0.95 }}
              onPress={onMessage}
              shadowColor={tokens.charcoal}
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.15}
              shadowRadius={16}
              elevation={4}
            >
              <LinearGradient
                colors={[tokens.copper, tokens.copperContainer]}
                start={[0, 0]}
                end={[1, 1]}
                width="100%"
                height="100%"
                justifyContent="center"
                alignItems="center"
              >
                <XStack alignItems="center" gap={8}>
                  <Text color="white" fontSize={18}>
                    {''}
                  </Text>
                  <Text
                    color="white"
                    fontWeight="700"
                    fontSize={16}
                  >
                    Meddelande
                  </Text>
                </XStack>
              </LinearGradient>
            </YStack>

            {/* Heart button — outlined */}
            <YStack
              width={56}
              height={56}
              borderRadius={16}
              borderWidth={1}
              borderColor={tokens.outlineVariantAlpha30}
              backgroundColor="white"
              alignItems="center"
              justifyContent="center"
              pressStyle={{ scale: 0.95 }}
              onPress={onLike}
              shadowColor={tokens.charcoal}
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.08}
              shadowRadius={12}
              elevation={3}
            >
              <Text fontSize={24} color={tokens.tertiary}>
                {''}
              </Text>
            </YStack>
          </XStack>
        )}

        {/* Own profile: Edit button */}
        {isOwnProfile && onEdit && (
          <YStack
            marginTop={16}
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
              colors={[tokens.copper, tokens.copperContainer]}
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

        {/* Logout */}
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

        {/* Bottom spacing */}
        <YStack height={120} />
      </YStack>
    </ScrollView>
  )
}
