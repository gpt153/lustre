import { useCallback } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import { YStack, XStack, Text, Image, Spinner, Button } from 'tamagui'
import { useDiscovery } from '../hooks/useDiscovery'

interface MatchesListScreenProps {
  onMatchPress?: (userId: string) => void
}

export function MatchesListScreen({ onMatchPress }: MatchesListScreenProps) {
  const discovery = useDiscovery()

  if (discovery.matchesLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Spinner color="$primary" size="large" />
      </YStack>
    )
  }

  return (
    <FlatList
      data={discovery.matches}
      keyExtractor={(item: any) => item.id}
      renderItem={({ item }: { item: any }) => {
        const matchedUser = item.matchedUser
        const photoUrl = matchedUser?.photos?.[0]?.thumbnailMedium || matchedUser?.photos?.[0]?.url

        return (
          <YStack paddingHorizontal="$sm" paddingVertical="$xs">
            <Button
              unstyled
              onPress={() => onMatchPress?.(matchedUser?.userId)}
              backgroundColor="$background"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$3"
              overflow="hidden"
            >
              <XStack gap="$sm" padding="$sm" width="100%">
                {photoUrl ? (
                  <Image
                    source={{ uri: photoUrl }}
                    width={80}
                    height={80}
                    borderRadius="$2"
                  />
                ) : (
                  <YStack
                    width={80}
                    height={80}
                    backgroundColor="$gray2"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="$2"
                  >
                    <Text fontSize="$2" color="$textSecondary">
                      No photo
                    </Text>
                  </YStack>
                )}

                <YStack flex={1} justifyContent="center" gap="$xs">
                  <XStack alignItems="center" gap="$xs">
                    <Text fontSize="$4" fontWeight="bold" color="$textPrimary">
                      {matchedUser?.displayName}
                    </Text>
                    {matchedUser?.age && (
                      <Text fontSize="$3" color="$textSecondary">
                        {matchedUser.age}
                      </Text>
                    )}
                  </XStack>

                  {matchedUser?.bio && (
                    <Text
                      fontSize="$3"
                      color="$textSecondary"
                      numberOfLines={2}
                    >
                      {matchedUser.bio}
                    </Text>
                  )}

                  <Text fontSize="$2" color="$primary" marginTop="$1">
                    Matched on {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </YStack>
              </XStack>
            </Button>
          </YStack>
        )
      }}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => discovery.refetch()}
          tintColor="#B87333"
          colors={['#B87333']}
        />
      }
      ListEmptyComponent={
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$lg">
          <Text color="$textSecondary">No matches yet. Keep swiping!</Text>
        </YStack>
      }
    />
  )
}
