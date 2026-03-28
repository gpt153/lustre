import { YStack, XStack, Text, TextArea } from 'tamagui'
import { CardBase, LustreButton } from '@lustre/ui'

interface PromptEditorProps {
  promptKey: string
  promptLabel: string
  response: string
  onChangeResponse: (text: string) => void
  onDelete: () => void
}

const MAX_CHARS = 500

export function PromptEditor({
  promptKey,
  promptLabel,
  response,
  onChangeResponse,
  onDelete,
}: PromptEditorProps) {
  const charCount = response.length

  return (
    <CardBase elevation={1} gap="$sm">
      <XStack justifyContent="space-between" alignItems="flex-start">
        <Text
          fontSize={14}
          fontWeight="600"
          color="#8B7E74"
          fontFamily="$heading"
          flex={1}
        >
          {promptLabel}
        </Text>
        <LustreButton
          size="$2"
          onPress={onDelete}
          variant="danger"
          paddingHorizontal="$xs"
          paddingVertical="$xs"
        >
          ✕
        </LustreButton>
      </XStack>

      <TextArea
        value={response}
        onChangeText={onChangeResponse}
        placeholder="Din svar här..."
        maxLength={MAX_CHARS}
        numberOfLines={4}
        borderRadius={8}
        borderWidth={1}
        borderColor="#C4956A"
        backgroundColor="#FDF8F3"
        color="#2C2421"
        padding="$sm"
        fontSize={16}
        placeholderTextColor="#8B7E74"
      />

      <XStack justifyContent="flex-end">
        <Text fontSize={12} color="#8B7E74">
          {charCount}/{MAX_CHARS}
        </Text>
      </XStack>
    </CardBase>
  )
}
