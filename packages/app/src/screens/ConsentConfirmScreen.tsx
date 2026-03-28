import { useState } from 'react'
import { YStack, XStack, Text, Button, Input, H2, ScrollView } from 'tamagui'
import { useConsent } from '../hooks/useConsent'

const GPS_LAT = 59.3293
const GPS_LNG = 18.0686

interface Props {
  onConfirmed: () => void
}

export function ConsentConfirmScreen({ onConfirmed }: Props) {
  const { confirmConsent, isConfirming } = useConsent()

  const [consentRecordId, setConsentRecordId] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setError(null)

    if (!consentRecordId.trim()) {
      setError('Consent Record ID is required.')
      return
    }

    try {
      await confirmConsent({
        consentRecordId: consentRecordId.trim(),
        gpsLat: GPS_LAT,
        gpsLng: GPS_LNG,
      })
      setConfirmed(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
    }
  }

  if (confirmed) {
    return (
      <YStack padding="$md" gap="$md" flex={1} justifyContent="center" alignItems="center">
        <YStack
          backgroundColor="$green3"
          borderRadius="$4"
          padding="$md"
          gap="$sm"
          width="100%"
          alignItems="center"
          borderWidth={1}
          borderColor="$green6"
        >
          <Text color="$green10" fontWeight="700" fontSize="$6">
            Consent confirmed
          </Text>
          <Text color="$colorSecondary" textAlign="center" fontSize="$3">
            Both parties have confirmed consent. The session is now recorded.
          </Text>
        </YStack>

        <Button theme="active" size="$4" width="100%" onPress={onConfirmed}>
          Done
        </Button>
      </YStack>
    )
  }

  return (
    <ScrollView>
      <YStack padding="$md" gap="$md">
        <H2 color="$color">Confirm Consent</H2>
        <Text color="$colorSecondary">
          Enter the Consent Record ID shared by the initiator to confirm your consent.
        </Text>

        <YStack gap="$xs">
          <Text color="$color" fontWeight="600">
            Consent Record ID
          </Text>
          <Input
            value={consentRecordId}
            onChangeText={setConsentRecordId}
            placeholder="Enter consent record ID..."
            autoCapitalize="none"
            autoCorrect={false}
          />
        </YStack>

        <YStack
          backgroundColor="$backgroundHover"
          borderRadius="$4"
          padding="$sm"
          gap="$xs"
        >
          <Text color="$color" fontWeight="600" fontSize="$3">
            Location
          </Text>
          <XStack alignItems="center" gap="$xs">
            <Text color="$green10" fontSize="$2">
              GPS Active
            </Text>
            <Text color="$colorSecondary" fontSize="$2">
              {GPS_LAT.toFixed(4)}, {GPS_LNG.toFixed(4)} (Stockholm)
            </Text>
          </XStack>
        </YStack>

        {error && (
          <Text color="$red10" textAlign="center">
            {error}
          </Text>
        )}

        <Button
          theme="active"
          size="$4"
          onPress={handleConfirm}
          disabled={isConfirming}
          opacity={isConfirming ? 0.7 : 1}
        >
          {isConfirming ? 'Confirming...' : 'Confirm Consent'}
        </Button>
      </YStack>
    </ScrollView>
  )
}
