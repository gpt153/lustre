import { Card, Text, XStack, YStack } from 'tamagui'

interface EventCardProps {
  event: {
    id: string
    title: string
    type: string
    startsAt: Date | string
    locationName?: string | null
    price?: string | null
    currency?: string
    coverImageUrl?: string | null
    _count?: { attendees: number }
  }
  onPress?: () => void
}

export function EventCard({ event, onPress }: EventCardProps) {
  const typeColor = event.type === 'ONLINE' ? '$blue8' : event.type === 'IRL' ? '$green8' : '$purple8'
  const dateStr = new Date(event.startsAt).toLocaleDateString('sv-SE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const priceStr = !event.price || Number(event.price) === 0 ? 'Gratis' : `${event.price} ${event.currency ?? 'SEK'}`

  return (
    <Card
      elevate
      size="$4"
      bordered
      pressStyle={{ opacity: 0.8 }}
      onPress={onPress}
      marginBottom="$2"
    >
      <Card.Header>
        <YStack gap="$xs" width="100%">
          <XStack justifyContent="space-between" alignItems="center" gap="$xs">
            <Text fontWeight="700" fontSize="$5" flex={1}>
              {event.title}
            </Text>
            <Card bordered paddingHorizontal="$xs" paddingVertical="$xs" backgroundColor={typeColor}>
              <Text color="white" fontSize="$1" fontWeight="600">
                {event.type}
              </Text>
            </Card>
          </XStack>
          <Text color="$gray10" fontSize="$3">
            {dateStr}
          </Text>
          {event.locationName && (
            <Text color="$gray9" fontSize="$2">
              {event.locationName}
            </Text>
          )}
          <XStack justifyContent="space-between">
            <Text color="$green10" fontWeight="600">
              {priceStr}
            </Text>
            {event._count && (
              <Text color="$gray9" fontSize="$2">
                {event._count.attendees} attending
              </Text>
            )}
          </XStack>
        </YStack>
      </Card.Header>
    </Card>
  )
}
