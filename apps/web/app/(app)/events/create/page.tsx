'use client'

import { useState } from 'react'
import { YStack, XStack, Text, Button, Input, TextArea, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateEventPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'ONLINE' | 'IRL' | 'HYBRID'>('ONLINE')
  const [startsAt, setStartsAt] = useState('')
  const [locationName, setLocationName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')

  const createMutation = trpc.event.create.useMutation()

  const handleSubmit = async () => {
    if (!title.trim() || !startsAt) {
      alert('Please fill in title and start time')
      return
    }

    if (type !== 'ONLINE' && !locationName.trim()) {
      alert('Location is required for IRL and Hybrid events')
      return
    }

    try {
      const result = await createMutation.mutateAsync({
        title: title.trim(),
        type,
        startsAt,
        locationName: (type !== 'ONLINE' && locationName.trim()) ? locationName.trim() : undefined,
        price: price ? parseFloat(price) : undefined,
        description: description.trim() || undefined,
      })
      router.push(`/events/${result.id}`)
    } catch (error) {
      console.error('Failed to create event:', error)
      alert('Failed to create event')
    }
  }

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={600} gap="$4">
        <XStack alignItems="center" gap="$2">
          <Link href="/events" style={{ textDecoration: 'none' }}>
            <Text color="$primary" fontSize="$3" fontWeight="600">← Back</Text>
          </Link>
          <Text fontSize="$6" fontWeight="700" color="$text">Create Event</Text>
        </XStack>

        <YStack gap="$2">
          <Text fontWeight="600" color="$text" fontSize="$3">Event Title</Text>
          <Input
            placeholder="Enter event title..."
            value={title}
            onChangeText={setTitle}
            fontSize="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$2"
            padding="$3"
            color="$text"
            placeholderTextColor="$textSecondary"
          />
        </YStack>

        <YStack gap="$2">
          <Text fontWeight="600" color="$text" fontSize="$3">Event Type</Text>
          <XStack gap="$2">
            {(['ONLINE', 'IRL', 'HYBRID'] as const).map((t) => (
              <Button
                key={t}
                flex={1}
                backgroundColor={type === t ? '$primary' : '$borderColor'}
                borderRadius="$3"
                paddingVertical="$3"
                onPress={() => setType(t)}
              >
                <Text color={type === t ? 'white' : '$text'} fontWeight="600">
                  {t}
                </Text>
              </Button>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Text fontWeight="600" color="$text" fontSize="$3">Start Date & Time</Text>
          <Input
            placeholder="2024-01-01T14:30"
            value={startsAt}
            onChangeText={setStartsAt}
            fontSize="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$2"
            padding="$3"
            color="$text"
            placeholderTextColor="$textSecondary"
          />
          <Text fontSize="$1" color="$textSecondary">Format: YYYY-MM-DDTHH:mm (ISO datetime)</Text>
        </YStack>

        {type !== 'ONLINE' && (
          <YStack gap="$2">
            <Text fontWeight="600" color="$text" fontSize="$3">Location</Text>
            <Input
              placeholder="Enter location..."
              value={locationName}
              onChangeText={setLocationName}
              fontSize="$3"
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius="$2"
              padding="$3"
              color="$text"
              placeholderTextColor="$textSecondary"
            />
          </YStack>
        )}

        <YStack gap="$2">
          <Text fontWeight="600" color="$text" fontSize="$3">Price (SEK) - Optional</Text>
          <Input
            placeholder="Leave empty for free event..."
            value={price}
            onChangeText={setPrice}
            inputMode="decimal"
            fontSize="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$2"
            padding="$3"
            color="$text"
            placeholderTextColor="$textSecondary"
          />
        </YStack>

        <YStack gap="$2">
          <Text fontWeight="600" color="$text" fontSize="$3">Description - Optional</Text>
          <TextArea
            placeholder="Describe your event..."
            value={description}
            onChangeText={(val: string) => setDescription(val)}
            maxLength={1000}
            fontSize="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$2"
            padding="$3"
            color="$text"
            minHeight={100}
            placeholderTextColor="$textSecondary"
          />
          <Text fontSize="$1" color="$textSecondary">{description.length}/1000</Text>
        </YStack>

        <Button
          backgroundColor="$primary"
          borderRadius="$3"
          paddingVertical="$4"
          onPress={handleSubmit}
          disabled={!title.trim() || !startsAt || (type !== 'ONLINE' && !locationName.trim()) || createMutation.isPending}
        >
          {createMutation.isPending ? (
            <Spinner color="white" size="small" />
          ) : (
            <Text color="white" fontWeight="600" fontSize="$4">Create Event</Text>
          )}
        </Button>
      </YStack>
    </YStack>
  )
}
