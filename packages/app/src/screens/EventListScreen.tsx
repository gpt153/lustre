import { useState } from 'react'
import { FlatList } from 'react-native'
import { YStack, XStack, Text, Button, Spinner } from 'tamagui'
import { useEvents } from '../hooks/useEvents'
import { EventCard } from '../components/EventCard'

type EventType = 'ONLINE' | 'IRL' | 'HYBRID' | undefined

export function EventListScreen({ onEventPress }: { onEventPress?: (eventId: string) => void }) {
  const [filter, setFilter] = useState<EventType>(undefined)
  const { events, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useEvents({ type: filter })

  if (isLoading)
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" />
      </YStack>
    )

  return (
    <YStack flex={1}>
      <XStack padding="$2" gap="$2">
        {([undefined, 'ONLINE', 'IRL', 'HYBRID'] as EventType[]).map((t) => (
          <Button
            key={t ?? 'all'}
            size="$2"
            variant={filter === t ? undefined : 'outlined'}
            onPress={() => setFilter(t)}
          >
            {t ?? 'Alla'}
          </Button>
        ))}
      </XStack>
      <FlatList
        data={events}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => <EventCard event={item} onPress={() => onEventPress?.(item.id)} />}
        contentContainerStyle={{ padding: 8 }}
        ListEmptyComponent={
          <YStack padding="$4" alignItems="center">
            <Text color="$gray9">Inga evenemang</Text>
          </YStack>
        }
        ListFooterComponent={
          hasNextPage ? (
            <Button onPress={() => fetchNextPage()} disabled={isFetchingNextPage} marginBottom="$4">
              {isFetchingNextPage ? 'Laddar...' : 'Ladda mer'}
            </Button>
          ) : null
        }
      />
    </YStack>
  )
}
