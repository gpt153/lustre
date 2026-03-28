import { useState } from 'react'
import { Linking } from 'react-native'
import { YStack, XStack, Text, Button, Sheet } from 'tamagui'

interface InsufficientBalanceModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InsufficientBalanceModal({ isOpen, onClose }: InsufficientBalanceModalProps) {
  const [position, setPosition] = useState(0)

  const handleOpenPayment = async () => {
    try {
      await Linking.openURL('https://pay.lovelustre.com/pay')
    } catch (error) {
      console.error('Failed to open payment URL:', error)
    }
  }

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={onClose}
      snapPoints={[85]}
      position={position}
      onPositionChange={setPosition}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame padding="$md" gap="$md">
        <YStack gap="$sm">
          <Text fontSize="$6" fontWeight="700" color="$color">
            Fyll på ditt konto
          </Text>
          <Text fontSize="$4" color="$gray10" lineHeight="$4">
            Du har inte tillräckligt med tokens för att fortsätta. Besök pay.lovelustre.com för att fylla på.
          </Text>
        </YStack>

        <YStack gap="$xs">
          <Button
            size="$5"
            backgroundColor="$pink10"
            color="white"
            borderRadius="$4"
            onPress={handleOpenPayment}
          >
            Öppna betalningssidan
          </Button>
          <Button
            size="$5"
            backgroundColor="$gray3"
            color="$color"
            borderRadius="$4"
            onPress={onClose}
          >
            Stäng
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
