import { YStack, XStack, Text, H2, Button, ScrollView } from 'tamagui'
import { PhotoGallery } from '../components/PhotoGallery'

interface ProfileViewProps {
  profile: {
    displayName: string
    bio: string | null
    age: number
    gender: string
    orientation: string
    relationshipType: string | null
    seeking: string[]
    verified: boolean
    photos: any[]
    kinkTags: { kinkTag: { name: string; category: string }; interestLevel: string; isPublic: boolean }[]
  }
  isOwnProfile?: boolean
  onEdit?: () => void
  onLogout?: () => void
}

export function ProfileViewScreen({ profile, isOwnProfile = false, onEdit, onLogout }: ProfileViewProps) {
  return (
    <ScrollView>
      <YStack padding="$4" gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <XStack alignItems="center" gap="$2">
              <H2 color="$text">{profile.displayName}</H2>
              {profile.verified && <Text color="#4CAF50" fontSize="$3">✓</Text>}
            </XStack>
            <Text color="$textSecondary" fontSize="$3">
              {profile.age} • {profile.gender.replace(/_/g, ' ').toLowerCase()} • {profile.orientation.toLowerCase()}
            </Text>
          </YStack>
          {isOwnProfile && onEdit && (
            <Button size="$3" onPress={onEdit} backgroundColor="$primary" color="white">
              Redigera
            </Button>
          )}
        </XStack>

        <PhotoGallery photos={profile.photos} />

        {profile.bio && (
          <YStack gap="$1">
            <Text color="$textSecondary" fontSize="$2" fontWeight="600">Om mig</Text>
            <Text color="$text" fontSize="$3">{profile.bio}</Text>
          </YStack>
        )}

        {profile.relationshipType && (
          <YStack gap="$1">
            <Text color="$textSecondary" fontSize="$2" fontWeight="600">Relation</Text>
            <Text color="$text" fontSize="$3">{profile.relationshipType.replace(/_/g, ' ').toLowerCase()}</Text>
          </YStack>
        )}

        {profile.seeking.length > 0 && (
          <YStack gap="$1">
            <Text color="$textSecondary" fontSize="$2" fontWeight="600">Letar efter</Text>
            <XStack flexWrap="wrap" gap="$1">
              {profile.seeking.map((s: string) => (
                <Text key={s} backgroundColor="$backgroundHover" paddingHorizontal="$2" paddingVertical="$1" borderRadius={12} fontSize="$2" color="$text">
                  {s.replace(/_/g, ' ').toLowerCase()}
                </Text>
              ))}
            </XStack>
          </YStack>
        )}

        {profile.kinkTags.length > 0 && (
          <YStack gap="$2">
            <Text color="$textSecondary" fontSize="$2" fontWeight="600">Intressen</Text>
            <XStack flexWrap="wrap" gap="$1">
              {profile.kinkTags.map((kt: any) => (
                <XStack key={kt.kinkTag.name} backgroundColor="$backgroundHover" paddingHorizontal="$2" paddingVertical="$1" borderRadius={12} gap="$1" alignItems="center">
                  <Text fontSize="$2" color="$text">{kt.kinkTag.name}</Text>
                  <Text fontSize="$1" color="$textSecondary">
                    {kt.interestLevel === 'LOVE' ? '❤️' : kt.interestLevel === 'LIKE' ? '👍' : '🤔'}
                  </Text>
                </XStack>
              ))}
            </XStack>
          </YStack>
        )}

        {isOwnProfile && onLogout && (
          <Button onPress={onLogout} backgroundColor="#E53935" color="white" marginTop="$4">
            Logga ut
          </Button>
        )}
      </YStack>
    </ScrollView>
  )
}
