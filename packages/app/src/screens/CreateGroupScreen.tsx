import { useState } from 'react'
import { ScrollView, YStack, Text, Input, TextArea, Button, Spinner } from 'tamagui'
import { useGroups } from '../hooks/useGroups'

interface CreateGroupScreenProps {
  onSuccess: (groupId: string) => void
}

export function CreateGroupScreen({ onSuccess }: CreateGroupScreenProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [visibility, setVisibility] = useState<'OPEN' | 'PRIVATE'>('OPEN')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const groups = useGroups()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!category.trim()) newErrors.category = 'Category is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      const group = await groups.create({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim(),
        visibility,
      })
      onSuccess(group.id)
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }

  return (
    <ScrollView backgroundColor="$background" flex={1}>
      <YStack padding="$4" gap="$4">
        <Text fontSize="$6" fontWeight="600" color="$text">
          Create Group
        </Text>

        <YStack gap="$2">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Name
          </Text>
          <Input
            placeholder="Group name"
            value={name}
            onChangeText={setName}
            size="$3"
            borderWidth={1}
            borderColor={errors.name ? '$red400' : '$borderColor'}
            borderRadius="$3"
            paddingHorizontal="$3"
          />
          {errors.name && (
            <Text color="$red400" fontSize="$2">
              {errors.name}
            </Text>
          )}
        </YStack>

        <YStack gap="$2">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Description (Optional)
          </Text>
          <TextArea
            placeholder="Describe your group"
            value={description}
            onChangeText={setDescription}
            size="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$3"
            paddingHorizontal="$3"
            minHeight={100}
          />
        </YStack>

        <YStack gap="$2">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Category
          </Text>
          <Input
            placeholder="e.g., Hobby, Interest, Community"
            value={category}
            onChangeText={setCategory}
            size="$3"
            borderWidth={1}
            borderColor={errors.category ? '$red400' : '$borderColor'}
            borderRadius="$3"
            paddingHorizontal="$3"
          />
          {errors.category && (
            <Text color="$red400" fontSize="$2">
              {errors.category}
            </Text>
          )}
        </YStack>

        <YStack gap="$2">
          <Text color="$textSecondary" fontSize="$2" fontWeight="600">
            Visibility
          </Text>
          <YStack gap="$2">
            <Button
              size="$3"
              backgroundColor={visibility === 'OPEN' ? '$primary' : '$gray300'}
              color={visibility === 'OPEN' ? 'white' : '$text'}
              onPress={() => setVisibility('OPEN')}
            >
              Open (Anyone can join)
            </Button>
            <Button
              size="$3"
              backgroundColor={visibility === 'PRIVATE' ? '$primary' : '$gray300'}
              color={visibility === 'PRIVATE' ? 'white' : '$text'}
              onPress={() => setVisibility('PRIVATE')}
            >
              Private (Invite only)
            </Button>
          </YStack>
        </YStack>

        <Button
          size="$4"
          backgroundColor="$primary"
          color="white"
          onPress={handleSubmit}
          disabled={groups.isCreating}
        >
          {groups.isCreating ? <Spinner color="white" size="small" /> : 'Create Group'}
        </Button>
      </YStack>
    </ScrollView>
  )
}
