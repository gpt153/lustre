'use client'

import { useState, useEffect, useRef } from 'react'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

export default function EventsPage() {
  const [eventType, setEventType] = useState<'ALL' | 'ONLINE' | 'IRL' | 'HYBRID'>('ALL')

  const listQuery = trpc.event.listFiltered.useInfiniteQuery(
    {
      limit: 20,
      type: eventType === 'ALL' ? undefined : eventType
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  const events = (listQuery.data?.pages.flatMap((page: any) => page.events) ?? []) as any[]

  const loadMoreRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
          listQuery.fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }
    return () => observer.disconnect()
  }, [listQuery.hasNextPage, listQuery.isFetchingNextPage])

  if (listQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={1000} gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="700" color="$text">Events</Text>
          <Link href="/events/create" style={{ textDecoration: 'none' }}>
            <Button backgroundColor="$primary" borderRadius="$3" paddingHorizontal="$4">
              <Text color="white" fontWeight="600">Create Event</Text>
            </Button>
          </Link>
        </XStack>

        <XStack gap="$2" flexWrap="wrap">
          {(['ALL', 'ONLINE', 'IRL', 'HYBRID'] as const).map((type) => (
            <Button
              key={type}
              backgroundColor={eventType === type ? '$primary' : '$borderColor'}
              borderRadius="$3"
              paddingHorizontal="$3"
              paddingVertical="$2"
              onPress={() => setEventType(type)}
            >
              <Text color={eventType === type ? 'white' : '$text'} fontWeight="600">
                {type === 'ALL' ? 'All Events' : type}
              </Text>
            </Button>
          ))}
        </XStack>

        {events.length === 0 ? (
          <YStack alignItems="center" padding="$6">
            <Text color="$textSecondary">
              No events found. Create one!
            </Text>
          </YStack>
        ) : (
          <YStack gap="$3">
            {(events as any[]).map((event: any) => (
              <Link key={event.id} href={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
                <EventCard event={event} />
              </Link>
            ))}
          </YStack>
        )}

        <div ref={loadMoreRef} style={{ height: 1 }} />

        {listQuery.isFetchingNextPage && (
          <YStack padding="$4" alignItems="center">
            <Spinner color="$primary" />
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}

function EventCard({ event }: {
  event: any
}) {
  const startDate = new Date(event.startsAt)
  const formattedDate = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const priceNum = event.price ? parseFloat(event.price) : 0

  return (
    <YStack
      backgroundColor="$background"
      borderRadius="$3"
      padding="$4"
      gap="$2"
      borderWidth={1}
      borderColor="$borderColor"
      hoverStyle={{ backgroundColor: '$borderColor' }}
    >
      <XStack justifyContent="space-between" alignItems="flex-start">
        <YStack flex={1} gap="$1">
          <Text fontWeight="700" color="$text" fontSize="$4">{event.title}</Text>
          <Text color="$textSecondary" fontSize="$2">{formattedDate}</Text>
        </YStack>
        <YStack
          backgroundColor={
            event.type === 'ONLINE' ? '$primary' :
            event.type === 'IRL' ? '$borderColor' :
            '$primary'
          }
          borderRadius="$2"
          paddingHorizontal="$2"
          paddingVertical="$1"
        >
          <Text
            fontSize="$1"
            fontWeight="600"
            color={event.type === 'IRL' ? '$text' : 'white'}
          >
            {event.type}
          </Text>
        </YStack>
      </XStack>
      <XStack gap="$4">
        {event.locationName && (
          <Text fontSize="$2" color="$textSecondary">
            📍 {event.locationName}
          </Text>
        )}
        <Text fontSize="$2" color="$textSecondary">
          {priceNum > 0 ? `${priceNum} SEK` : 'Free'}
        </Text>
      </XStack>
    </YStack>
  )
}
