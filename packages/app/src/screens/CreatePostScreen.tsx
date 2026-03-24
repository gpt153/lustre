import { useState } from 'react'
import { YStack, XStack, Text, TextArea, Button, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'

interface CreatePostScreenProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreatePostScreen({ onSuccess, onCancel }: CreatePostScreenProps) {
  const [text, setText] = useState('')
  const createPost = trpc.post.create.useMutation()

  const handleSubmit = async () => {
    if (!text.trim()) return
    await createPost.mutateAsync({ text: text.trim() })
    setText('')
    onSuccess?.()
  }

  return (
    <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
      <XStack justifyContent="space-between" alignItems="center">
        <Button chromeless onPress={onCancel}>
          <Text color="$textSecondary">Cancel</Text>
        </Button>
        <Text fontWeight="700" color="$text">New Post</Text>
        <Button
          backgroundColor="$primary"
          borderRadius="$3"
          paddingHorizontal="$4"
          onPress={handleSubmit}
          disabled={!text.trim() || createPost.isPending}
        >
          {createPost.isPending ? (
            <Spinner color="white" size="small" />
          ) : (
            <Text color="white" fontWeight="600">Post</Text>
          )}
        </Button>
      </XStack>

      <TextArea
        flex={1}
        placeholder="What's on your mind?"
        value={text}
        onChangeText={setText}
        maxLength={2000}
        fontSize="$4"
        borderWidth={0}
        backgroundColor="transparent"
        color="$text"
        placeholderTextColor="$textSecondary"
        autoFocus
      />

      <Text color="$textSecondary" textAlign="right" fontSize="$1">
        {text.length}/2000
      </Text>
    </YStack>
  )
}
