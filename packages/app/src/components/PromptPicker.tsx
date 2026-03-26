import { useState } from 'react'
import { YStack, XStack, Text, ScrollView } from 'tamagui'
import { BottomSheetBase } from '@lustre/ui'
import { PROMPT_OPTIONS } from '@lustre/api'
import { CardBase } from '@lustre/ui'

interface PromptPickerProps {
  visible: boolean
  onSelect: (promptKey: string) => void
  onClose: () => void
  selectedKeys: string[]
}

export function PromptPicker({ visible, onSelect, onClose, selectedKeys }: PromptPickerProps) {
  const availablePrompts = Object.entries(PROMPT_OPTIONS).filter(
    ([key]) => !selectedKeys.includes(key)
  )

  const handleSelectPrompt = (promptKey: string) => {
    onSelect(promptKey)
    onClose()
  }

  return (
    <BottomSheetBase visible={visible} onClose={onClose}>
      <YStack gap="$4" flex={1}>
        <Text
          fontSize={18}
          fontWeight="600"
          color="#2C2421"
          fontFamily="$heading"
        >
          Välj en fråga
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack gap="$2">
            {availablePrompts.map(([key, label]) => (
              <CardBase
                key={key}
                onPress={() => handleSelectPrompt(key)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                paddingVertical="$3"
                paddingHorizontal="$3"
                backgroundColor="#F5EDE4"
              >
                <Text color="#2C2421" fontSize={16}>
                  {label}
                </Text>
              </CardBase>
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    </BottomSheetBase>
  )
}
