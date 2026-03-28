import { FlatList, TouchableOpacity } from 'react-native'
import { YStack, Text, Spinner } from 'tamagui'
import { useIntentionFeed } from '../hooks/useIntentions'
import { IntentionProfileCard } from '../components/IntentionProfileCard'

interface IntentionFeedScreenProps {
  intentionId: string
}

export function IntentionFeedScreen({ intentionId }: IntentionFeedScreenProps) {
  const { results, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useIntentionFeed(intentionId)

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner color="$blue9" />
      </YStack>
    )
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => `${item.userId}-${item.photoUrl || 'fallback'}`}
      contentContainerStyle={{ padding: "$md", paddingBottom: 80 }}
      ListHeaderComponent={
        <Text fontSize="$5" fontWeight="600" color="$text" marginBottom="$4">
          Matchande profiler
        </Text>
      }
      ListEmptyComponent={
        <YStack alignItems="center" justifyContent="center" padding="$xl" gap="$xs">
          <Text fontSize="$4" color="$gray11" fontWeight="600">
            Inga profiler än
          </Text>
          <Text fontSize="$3" color="$gray10">
            Kom tillbaka senare för att se nya matchningar
          </Text>
        </YStack>
      }
      renderItem={({ item }) => (
        <TouchableOpacity activeOpacity={0.8}>
          <IntentionProfileCard
            userId={item.userId}
            displayName={item.displayName}
            compatibilityScore={item.compatibilityScore}
            matchedIntentionTags={item.matchedIntentionTags || []}
            bioSnippet={item.bioSnippet || ''}
            photoUrl={item.photoUrl}
            intentionSeeking={item.intentionSeeking}
            distance={item.distance}
            isFallback={item.isFallback || false}
          />
        </TouchableOpacity>
      )}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <YStack alignItems="center" padding="$md">
            <Spinner color="$blue9" />
          </YStack>
        ) : null
      }
    />
  )
}
