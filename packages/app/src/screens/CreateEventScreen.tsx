import { useState } from 'react'
import { ScrollView, YStack, Text, Input, TextArea, Button, Spinner } from 'tamagui'
import { useEvents } from '../hooks/useEvents'

interface CreateEventScreenProps {
  onSuccess: (eventId: string) => void
}

export function CreateEventScreen({ onSuccess }: CreateEventScreenProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'ONLINE' | 'IRL' | 'HYBRID'>('IRL')
  const [startsAt, setStartsAt] = useState('')
  const [locationName, setLocationName] = useState('')
  const [price, setPrice] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const { createMutation } = useEvents()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (!startsAt.trim()) newErrors.startsAt = 'Date is required'
    if (type === 'IRL' && !locationName.trim()) newErrors.locationName = 'Location is required for IRL events'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      const event = await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        startsAt,
        locationName: type === 'IRL' ? locationName.trim() : undefined,
        price: price ? parseFloat(price) : undefined,
      })
      onSuccess(event.id)
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  return (
    <ScrollView backgroundColor="$background" flex={1}>
      <YStack padding="$md" gap="$md">
        <Text fontSize="$6" fontWeight="600" color="$text">
          Create Event
        </Text>

        <YStack gap="$xs">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Title
          </Text>
          <Input
            placeholder="Event title"
            value={title}
            onChangeText={setTitle}
            size="$3"
            borderWidth={1}
            borderColor={errors.title ? '$red400' : '$borderColor'}
            borderRadius="$3"
            paddingHorizontal="$sm"
          />
          {errors.title && (
            <Text color="$red400" fontSize="$2">
              {errors.title}
            </Text>
          )}
        </YStack>

        <YStack gap="$xs">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Description (Optional)
          </Text>
          <TextArea
            placeholder="Describe your event"
            value={description}
            onChangeText={setDescription}
            size="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$3"
            paddingHorizontal="$sm"
            minHeight={100}
          />
        </YStack>

        <YStack gap="$xs">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Event Type
          </Text>
          <YStack gap="$xs">
            {(['ONLINE', 'IRL', 'HYBRID'] as const).map((t) => (
              <Button
                key={t}
                size="$3"
                backgroundColor={type === t ? '$primary' : '$gray300'}
                color={type === t ? 'white' : '$text'}
                onPress={() => setType(t)}
              >
                {t}
              </Button>
            ))}
          </YStack>
        </YStack>

        <YStack gap="$xs">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Date and Time (ISO format)
          </Text>
          <Input
            placeholder="2024-12-25T18:00:00Z"
            value={startsAt}
            onChangeText={setStartsAt}
            size="$3"
            borderWidth={1}
            borderColor={errors.startsAt ? '$red400' : '$borderColor'}
            borderRadius="$3"
            paddingHorizontal="$sm"
          />
          {errors.startsAt && (
            <Text color="$red400" fontSize="$2">
              {errors.startsAt}
            </Text>
          )}
        </YStack>

        {type === 'IRL' && (
          <YStack gap="$xs">
            <Text color="$textSecondary" fontSize="$2" fontWeight="600">
              Location
            </Text>
            <Input
              placeholder="Event location"
              value={locationName}
              onChangeText={setLocationName}
              size="$3"
              borderWidth={1}
              borderColor={errors.locationName ? '$red400' : '$borderColor'}
              borderRadius="$3"
              paddingHorizontal="$sm"
            />
            {errors.locationName && (
              <Text color="$red400" fontSize="$2">
                {errors.locationName}
              </Text>
            )}
          </YStack>
        )}

        <YStack gap="$xs">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Price (SEK, Optional)
          </Text>
          <Input
            placeholder="0"
            value={price}
            onChangeText={setPrice}
            size="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$3"
            paddingHorizontal="$sm"
            keyboardType="decimal-pad"
          />
        </YStack>

        <Button
          size="$4"
          backgroundColor="$primary"
          color="white"
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? <Spinner color="white" size="small" /> : 'Create Event'}
        </Button>
      </YStack>
    </ScrollView>
  )
}
