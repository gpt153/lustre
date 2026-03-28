import { ScrollView } from 'react-native'
import { YStack, XStack, Text, Button, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import { useState } from 'react'

export function EventDetailScreen({ eventId, currentUserId }: { eventId: string; currentUserId?: string }) {
  const { data: event, isLoading, refetch } = trpc.event.get.useQuery({ eventId })
  const rsvpMutation = trpc.event.rsvp.useMutation({ onSuccess: () => refetch() })
  const cancelMutation = trpc.event.cancel.useMutation({ onSuccess: () => refetch() })
  const ticketStatusQuery = trpc.event.checkTicketStatus.useQuery({ eventId })
  const purchaseTicketMutation = trpc.event.purchaseTicket.useMutation({ onSuccess: () => refetch() })
  const [phone, setPhone] = useState('')

  if (isLoading || !event)
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" />
      </YStack>
    )

  const isFree = !event.price || Number(event.price) === 0
  const isCreator = event.createdById === currentUserId
  const hasTicket = ticketStatusQuery.data?.status === 'VALID'

  return (
    <ScrollView>
      <YStack padding="$md" gap="$sm">
        <Text fontSize="$7" fontWeight="700">
          {event.title}
        </Text>
        <XStack gap="$xs">
          <Text color="$gray10">{event.type}</Text>
          <Text color="$gray10">•</Text>
          <Text color="$gray10">{new Date(event.startsAt).toLocaleDateString('sv-SE')}</Text>
        </XStack>
        {event.locationName && <Text color="$gray9">{event.locationName}</Text>}
        {event.description && <Text>{event.description}</Text>}
        <Text fontWeight="600" color="$green10">
          {isFree ? 'Gratis' : `${event.price} SEK`}
        </Text>
        <Text color="$gray9">{event._count.attendees} deltagare</Text>

        {!isCreator && isFree && (
          <Button
            onPress={() => rsvpMutation.mutate({ eventId, status: 'GOING' })}
            disabled={rsvpMutation.isPending}
            theme="green"
          >
            Delta
          </Button>
        )}
        {!isCreator && !isFree && !hasTicket && (
          <Button
            onPress={() => purchaseTicketMutation.mutate({ eventId })}
            theme="blue"
          >
            Köp biljett — {event.price} SEK
          </Button>
        )}
        {hasTicket && (
          <Text color="$green10" fontWeight="600">
            ✓ Du har en biljett
          </Text>
        )}
        {isCreator && event.status === 'PUBLISHED' && (
          <Button
            onPress={() => cancelMutation.mutate({ eventId })}
            theme="red"
            disabled={cancelMutation.isPending}
          >
            Ställ in evenemang
          </Button>
        )}
      </YStack>
    </ScrollView>
  )
}
