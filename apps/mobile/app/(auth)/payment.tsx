import { YStack, Text, H2, Spinner, Button } from 'tamagui'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import * as Linking from 'expo-linking'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'

export default function PaymentScreen() {
  const router = useRouter()
  const setNeedsPayment = useAuthStore((state) => state.setNeedsPayment)

  const [swishUrl, setSwishUrl] = useState<string | null>(null)
  const [pollError, setPollError] = useState<string | null>(null)
  const [shouldPoll, setShouldPoll] = useState(false)

  const createPaymentMutation = trpc.auth.swish.createPayment.useMutation()

  const statusQuery = trpc.auth.swish.checkStatus.useQuery(undefined, {
    enabled: shouldPoll,
    refetchInterval: 2000,
  })

  useEffect(() => {
    if (statusQuery.data?.status === 'PAID') {
      setShouldPoll(false)
      setNeedsPayment(false)
      router.replace('/(auth)/display-name')
    }
  }, [statusQuery.data])

  useEffect(() => {
    createPaymentMutation.mutate(
      { phoneNumber: undefined },
      {
        onSuccess: (data) => {
          const swishLink = `swish://payment/${data.paymentRequestToken}`
          setSwishUrl(swishLink)
        },
        onError: () => {
          setPollError('Kunde inte skapa Swish-betalning')
        },
      }
    )
  }, [])

  const handleOpenSwish = async () => {
    if (!swishUrl) return
    try {
      await Linking.openURL(swishUrl)
      setShouldPoll(true)
    } catch (error) {
      setPollError('Kunde inte öppna Swish-appen')
    }
  }

  const handleManualCheck = () => {
    setShouldPoll(true)
    statusQuery.refetch()
  }

  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor="$background"
      paddingHorizontal="$4"
    >
      <YStack alignItems="center" gap="$4" width="100%">
        <H2 color="$primary" textAlign="center">
          Betala 10 kr med Swish
        </H2>

        {!swishUrl ? (
          <>
            <Spinner size="large" color="$primary" />
            <Text color="$textSecondary" textAlign="center">
              Förbereder Swish-betalning...
            </Text>
          </>
        ) : (
          <>
            <Text color="$textSecondary" textAlign="center" marginBottom="$2">
              Öppna Swish-appen och godkänn betalningen
            </Text>

            <Button
              onPress={handleOpenSwish}
              backgroundColor="$primary"
              color="$background"
              fontWeight="600"
              paddingHorizontal="$6"
              paddingVertical="$3"
            >
              Öppna Swish
            </Button>

            <Text color="$textSecondary" textAlign="center" fontSize="$3">
              eller
            </Text>

            <Button
              onPress={handleManualCheck}
              disabled={statusQuery.isFetching}
              variant="outline"
              borderColor="$primary"
              color="$primary"
              fontWeight="600"
              paddingHorizontal="$6"
              paddingVertical="$3"
            >
              {statusQuery.isFetching ? (
                <>
                  <Spinner size="small" color="$primary" marginRight="$2" />
                  <Text color="$primary">Kontrollerar...</Text>
                </>
              ) : (
                'Jag har betalat'
              )}
            </Button>
          </>
        )}

        {pollError && (
          <Text color="#E05A33" textAlign="center" marginTop="$4">
            {pollError}
          </Text>
        )}

        {shouldPoll && (
          <Text color="$textSecondary" marginTop="$2" fontSize="$3">
            Söker efter betalning...
          </Text>
        )}
      </YStack>
    </YStack>
  )
}
