'use client'

import { useState } from 'react'
import { YStack, XStack, Text, Button, Input, TextArea, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import { useRouter } from 'next/navigation'

export default function CreateGroupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [visibility, setVisibility] = useState('PUBLIC')

  const createMutation = trpc.group.create.useMutation()

  const handleSubmit = async () => {
    if (!name.trim() || !category.trim()) {
      alert('Please fill in name and category')
      return
    }

    try {
      const result = await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim(),
        visibility: visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
      })
      router.push(`/groups/${result.id}`)
    } catch (error) {
      console.error('Failed to create group:', error)
      alert('Failed to create group')
    }
  }

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={600} gap="$4">
        <Text fontSize="$6" fontWeight="700" color="$text">Create Group</Text>

        <YStack gap="$2">
          <Text fontWeight="600" color="$text" fontSize="$3">Group Name</Text>
          <Input
            placeholder="Enter group name..."
            value={name}
            onChangeText={setName}
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
          <Text fontWeight="600" color="$text" fontSize="$3">Description</Text>
          <TextArea
            placeholder="Describe your group..."
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

        <YStack gap="$2">
          <Text fontWeight="600" color="$text" fontSize="$3">Category</Text>
          <Input
            placeholder="e.g., Book Club, Sports, Dating..."
            value={category}
            onChangeText={setCategory}
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
          <Text fontWeight="600" color="$text" fontSize="$3">Visibility</Text>
          <XStack gap="$2">
            <Button
              flex={1}
              backgroundColor={visibility === 'PUBLIC' ? '$primary' : '$borderColor'}
              borderRadius="$3"
              paddingVertical="$3"
              onPress={() => setVisibility('PUBLIC')}
            >
              <Text color={visibility === 'PUBLIC' ? 'white' : '$text'} fontWeight="600">
                OPEN
              </Text>
            </Button>
            <Button
              flex={1}
              backgroundColor={visibility === 'PRIVATE' ? '$primary' : '$borderColor'}
              borderRadius="$3"
              paddingVertical="$3"
              onPress={() => setVisibility('PRIVATE')}
            >
              <Text color={visibility === 'PRIVATE' ? 'white' : '$text'} fontWeight="600">
                PRIVATE
              </Text>
            </Button>
          </XStack>
        </YStack>

        <Button
          backgroundColor="$primary"
          borderRadius="$3"
          paddingVertical="$4"
          onPress={handleSubmit}
          disabled={!name.trim() || !category.trim() || createMutation.isPending}
        >
          {createMutation.isPending ? (
            <Spinner color="white" size="small" />
          ) : (
            <Text color="white" fontWeight="600" fontSize="$4">Create Group</Text>
          )}
        </Button>
      </YStack>
    </YStack>
  )
}
