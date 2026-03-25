'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { YStack, XStack, Text, Button, Spinner, Input } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string
  const [phoneNumber, setPhoneNumber] = useState('')

  const eventQuery = trpc.event.get.useQuery({ eventId })
  const ticketStatusQuery = trpc.event.checkTicketStatus.useQuery({ eventId })
  const rsvpMutation = trpc.event.rsvp.useMutation()
  const purchaseTicketMutation = trpc.event.purchaseTicket.useMutation()
  const cancelMutation = trpc.event.cancel.useMutation()

  if (eventQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  if (!eventQuery.data) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Text color="$textSecondary">Event not found</Text>
      </YStack>
    )
  }

  const event = eventQuery.data
  const isCreator = event.createdById === event.creator.id
  const isFree = !event.price || Number(event.price) === 0
  const hasTicket = ticketStatusQuery.data?.status === 'VALID'

  const startDate = new Date(event.startsAt)
  const formattedDateTime = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const handleRsvp = async () => {
    try {
      await rsvpMutation.mutateAsync({ eventId, status: 'GOING' })
      eventQuery.refetch()
    } catch (error) {
      console.error('Failed to RSVP:', error)
      alert('Failed to RSVP to event')
    }
  }

  const handlePurchaseTicket = async () => {
    if (!phoneNumber.trim()) {
      alert('Please enter a phone number')
      return
    }

    try {
      await purchaseTicketMutation.mutateAsync({
        eventId,
        phoneNumber: phoneNumber.trim()
      })
      alert('Ticket purchase initiated! Check your email for payment details.')
      setPhoneNumber('')
      ticketStatusQuery.refetch()
    } catch (error) {
      console.error('Failed to purchase ticket:', error)
      alert('Failed to purchase ticket')
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this event?')) return
    try {
      await cancelMutation.mutateAsync({ eventId })
      router.push('/events')
    } catch (error) {
      console.error('Failed to cancel event:', error)
      alert('Failed to cancel event')
    }
  }

  const priceNum = event.price ? Number(event.price) : 0

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={800} gap="$4">
        <Link href="/events" style={{ textDecoration: 'none' }}>
          <Text color="$primary" fontSize="$3" fontWeight="600">← Back to Events</Text>
        </Link>

        <YStack backgroundColor="$background" borderRadius="$3" padding="$4" gap="$3" borderWidth={1} borderColor="$borderColor">
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack flex={1} gap="$2">
              <Text fontSize="$6" fontWeight="700" color="$text">{event.title}</Text>
              {event.description && (
                <Text color="$text" fontSize="$3">{event.description}</Text>
              )}
            </YStack>
            <YStack
              backgroundColor={
                event.type === 'ONLINE' ? '$primary' :
                event.type === 'IRL' ? '$borderColor' :
                '$primary'
              }
              borderRadius="$2"
              paddingHorizontal="$3"
              paddingVertical="$2"
            >
              <Text
                fontSize="$2"
                fontWeight="600"
                color={event.type === 'IRL' ? '$text' : 'white'}
              >
                {event.type}
              </Text>
            </YStack>
          </XStack>

          <YStack gap="$2">
            <XStack gap="$1" alignItems="center">
              <Text fontSize="$3" fontWeight="600" color="$text">📅</Text>
              <Text fontSize="$3" color="$text">{formattedDateTime}</Text>
            </XStack>
            {event.locationName && (
              <XStack gap="$1" alignItems="center">
                <Text fontSize="$3" fontWeight="600" color="$text">📍</Text>
                <Text fontSize="$3" color="$text">{event.locationName}</Text>
              </XStack>
            )}
            <XStack gap="$1" alignItems="center">
              <Text fontSize="$3" fontWeight="600" color="$text">👥</Text>
              <Text fontSize="$3" color="$text">
                {event._count.attendees} {event._count.attendees === 1 ? 'attendee' : 'attendees'}
              </Text>
            </XStack>
            <XStack gap="$1" alignItems="center">
              <Text fontSize="$3" fontWeight="600" color="$text">💰</Text>
              <Text fontSize="$3" color="$text">
                {isFree ? 'Free' : `${priceNum} SEK per ticket`}
              </Text>
            </XStack>
          </YStack>

          <XStack gap="$2" flexWrap="wrap">
            {isFree ? (
              // Free event - RSVP
              <Button
                backgroundColor="$primary"
                borderRadius="$3"
                paddingHorizontal="$4"
                paddingVertical="$2"
                onPress={handleRsvp}
                disabled={rsvpMutation.isPending}
              >
                {rsvpMutation.isPending ? (
                  <Spinner color="white" size="small" />
                ) : (
                  <Text color="white" fontWeight="600">RSVP</Text>
                )}
              </Button>
            ) : (
              // Paid event - ticket purchase
              <>
                <Input
                  placeholder="Phone number..."
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  fontSize="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                  borderRadius="$2"
                  padding="$3"
                  color="$text"
                  placeholderTextColor="$textSecondary"
                  flex={1}
                />
                <Button
                  backgroundColor="$primary"
                  borderRadius="$3"
                  paddingHorizontal="$4"
                  paddingVertical="$2"
                  onPress={handlePurchaseTicket}
                  disabled={purchaseTicketMutation.isPending || !phoneNumber.trim() || hasTicket}
                >
                  {purchaseTicketMutation.isPending ? (
                    <Spinner color="white" size="small" />
                  ) : hasTicket ? (
                    <Text color="white" fontWeight="600">Ticket purchased ✓</Text>
                  ) : (
                    <Text color="white" fontWeight="600">Buy Ticket</Text>
                  )}
                </Button>
              </>
            )}

            {isCreator && event.status === 'PUBLISHED' && (
              <Button
                backgroundColor="$borderColor"
                borderRadius="$3"
                paddingHorizontal="$4"
                paddingVertical="$2"
                onPress={handleCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <Spinner color="$text" size="small" />
                ) : (
                  <Text color="$text" fontWeight="600">Cancel Event</Text>
                )}
              </Button>
            )}
          </XStack>
        </YStack>
      </YStack>
    </YStack>
  )
}
