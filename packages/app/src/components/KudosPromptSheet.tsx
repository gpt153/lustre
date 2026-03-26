import { useState } from 'react'
import { YStack, XStack, Text, Sheet, Button } from 'tamagui'

interface KudosPrompt {
  id: string
  recipientId: string
  matchId?: string | null
  recipient: { id: string; displayName: string | null }
}

interface KudosPromptSheetProps {
  prompt: KudosPrompt | null
  onAccept: (prompt: KudosPrompt) => void
  onDismiss: (promptId: string) => void
}

export function KudosPromptSheet({ prompt, onAccept, onDismiss }: KudosPromptSheetProps) {
  const [open, setOpen] = useState(!!prompt)

  if (!prompt) return null

  return (
    <Sheet
      modal
      open={!!prompt}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) onDismiss(prompt.id)
      }}
      snapPoints={[35]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame padding="$4">
        <YStack gap="$4" alignItems="center">
          <Text fontSize="$6" fontWeight="bold" textAlign="center">
            Vill du lämna kudos till {prompt.recipient.displayName ?? 'denna person'}?
          </Text>
          <Text fontSize="$3" color="$gray10" textAlign="center">
            Välj badges som beskriver din upplevelse
          </Text>
          <XStack gap="$3" width="100%">
            <Button
              flex={1}
              theme="gray"
              onPress={() => onDismiss(prompt.id)}
            >
              Inte nu
            </Button>
            <Button
              flex={1}
              theme="active"
              onPress={() => onAccept(prompt)}
            >
              Ge kudos
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
