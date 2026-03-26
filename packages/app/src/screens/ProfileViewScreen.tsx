import { YStack, XStack, Text, ScrollView } from 'tamagui'
import { CardBase, LustreButton } from '@lustre/ui'
import { PROMPT_OPTIONS } from '@lustre/api'
import { ProfilePhotoSection } from '../components/ProfilePhotoSection'
import { ProfilePromptSection } from '../components/ProfilePromptSection'

interface ProfileViewProps {
  profile: {
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

  return (
    <ScrollView>
      <YStack
        backgroundColor="#FDF8F3"
        minHeight="100%"
        paddingBottom="$6"
      >
        {isOwnProfile && onEdit && (
          <XStack
            paddingHorizontal="$4"
            paddingTop="$4"
            paddingBottom="$2"
            justifyContent="flex-end"
          >
            <LustreButton
              size="$3"
              onPress={onEdit}
              variant="secondary"
            >
              Redigera
            </LustreButton>
          </XStack>
        )}

        <YStack gap="$4" paddingHorizontal="$4" paddingVertical="$4">
          {contentItems.map((item) => (
            item.type === 'photo' ? (
              <ProfilePhotoSection
                key={item.key}
                photoUrl={item.data.thumbnailMedium || item.data.url}
                showInfo={item.key === 'photo-0'}
                displayName={item.key === 'photo-0' ? profile.displayName : undefined}
                age={item.key === 'photo-0' ? profile.age : undefined}
              />
            ) : (
              <ProfilePromptSection
                key={item.key}
                promptKey={item.data.promptKey}
                promptLabel={PROMPT_OPTIONS[item.data.promptKey] || item.data.promptKey}
                response={item.data.response}
              />
            )
          ))}

          {profile.relationshipType && (
            <CardBase elevation={1} gap="$2">
              <Text
                color="#8B7E74"
                fontFamily="$heading"
                fontSize={14}
                fontWeight="600"
              >
                Relation
              </Text>
              <Text
                color="#2C2421"
                fontSize={16}
                fontWeight="500"
              >
                {profile.relationshipType.replace(/_/g, ' ').toLowerCase()}
              </Text>
            </CardBase>
          )}

          {profile.seeking.length > 0 && (
            <CardBase elevation={1} gap="$2">
              <Text
                color="#8B7E74"
                fontFamily="$heading"
                fontSize={14}
                fontWeight="600"
              >
                Letar efter
              </Text>
              <XStack flexWrap="wrap" gap="$2">
                {profile.seeking.map((s: string) => (
                  <YStack
                    key={s}
                    backgroundColor="#D4A574"
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius={12}
                  >
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      color="#2C2421"
                    >
                      {s.replace(/_/g, ' ').toLowerCase()}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            </CardBase>
          )}

          {profile.kinkTags.length > 0 && (
            <CardBase elevation={1} gap="$2">
              <Text
                color="#8B7E74"
                fontFamily="$heading"
                fontSize={14}
                fontWeight="600"
              >
                Intressen
              </Text>
              <XStack flexWrap="wrap" gap="$2">
                {profile.kinkTags.map((kt: any) => (
                  <YStack
                    key={kt.kinkTag.name}
                    backgroundColor="#D4A574"
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius={12}
                    flexDirection="row"
                    alignItems="center"
                    gap="$1"
                  >
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      color="#2C2421"
                    >
                      {kt.kinkTag.name}
                    </Text>
                    <Text
                      fontSize={12}
                    >
                      {kt.interestLevel === 'LOVE' ? '❤️' : kt.interestLevel === 'LIKE' ? '👍' : '🤔'}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            </CardBase>
          )}

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
      </YStack>
    </ScrollView>
  )
}
