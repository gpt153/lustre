import { useState } from 'react'
import { YStack, XStack, Text, Button, Input, H2, ScrollView } from 'tamagui'
import { useConsent } from '../hooks/useConsent'

const GPS_LAT = 59.3293
const GPS_LNG = 18.0686

interface Props {
  onSuccess: (consentRecordId: string) => void
}

export function ConsentInitiateScreen({ onSuccess }: Props) {
  const { initiateConsent, isInitiating } = useConsent()

  const [participantId, setParticipantId] = useState('')
  const [consentRecordId, setConsentRecordId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    setError(null)

    if (!participantId.trim()) {
      setError('Participant ID is required.')
      return
    }

    try {
      const result = await initiateConsent({
        participantId: participantId.trim(),
        gpsLat: GPS_LAT,
        gpsLng: GPS_LNG,
      })
      setConsentRecordId(result.consentRecordId)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
    }
  }

  if (consentRecordId) {
    return (
      <ScrollView>
        <YStack padding="$4" gap="$5">
          <H2 color="$color">Request Sent</H2>

          <YStack
            backgroundColor="$green3"
            borderRadius="$4"
            padding="$4"
            gap="$3"
            borderWidth={1}
            borderColor="$green6"
          >
            <Text color="$green10" fontWeight="600" fontSize="$4">
              Consent request initiated successfully.
            </Text>
            <Text color="$color" fontSize="$2">
              Consent Record ID:
            </Text>
            <Text color="$color" fontWeight="600" fontSize="$3" selectable>
              {consentRecordId}
            </Text>
          </YStack>

          <YStack
            backgroundColor="$backgroundHover"
            borderRadius="$4"
            padding="$4"
            gap="$2"
          >
            <Text color="$color" fontWeight="600">
              Next step
            </Text>
            <Text color="$colorSecondary" fontSize="$3">
              Share the Consent Record ID above with the other participant. They should open ConsentVault and use "Confirm Consent" to confirm the request with this ID.
            </Text>
          </YStack>

          <Button theme="active" size="$4" onPress={() => onSuccess(consentRecordId)}>
            Done
          </Button>
        </YStack>
      </ScrollView>
    )
  }

  return (
    <ScrollView>
      <YStack padding="$4" gap="$5">
        <H2 color="$color">New Consent Request</H2>
        <Text color="$colorSecondary">
          Start a consent recording session. The other participant will receive a request to confirm.
        </Text>

        <YStack gap="$2">
          <Text color="$color" fontWeight="600">
            Participant ID
          </Text>
          <Input
            value={participantId}
            onChangeText={setParticipantId}
            placeholder="Enter participant UUID..."
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text color="$colorSecondary" fontSize="$2">
            The UUID of the other user's account.
          </Text>
        </YStack>

        <YStack
          backgroundColor="$backgroundHover"
          borderRadius="$4"
          padding="$3"
          gap="$2"
        >
          <Text color="$color" fontWeight="600" fontSize="$3">
            Location
          </Text>
          <XStack alignItems="center" gap="$2">
            <Text color="$green10" fontSize="$2">
              GPS Active
            </Text>
            <Text color="$colorSecondary" fontSize="$2">
              {GPS_LAT.toFixed(4)}, {GPS_LNG.toFixed(4)} (Stockholm)
            </Text>
          </XStack>
        </YStack>

        <YStack
          backgroundColor="$backgroundHover"
          borderRadius="$4"
          padding="$3"
          gap="$2"
        >
          <Text color="$color" fontWeight="600" fontSize="$3">
            Bluetooth Proximity
          </Text>
          <Text color="$colorSecondary" fontSize="$2">
            Proximity check: simulated
          </Text>
        </YStack>

        {error && (
          <Text color="$red10" textAlign="center">
            {error}
          </Text>
        )}

        <Button
          theme="active"
          size="$4"
          onPress={handleSend}
          disabled={isInitiating}
          opacity={isInitiating ? 0.7 : 1}
        >
          {isInitiating ? 'Sending...' : 'Send Consent Request'}
        </Button>
      </YStack>
    </ScrollView>
  )
}
