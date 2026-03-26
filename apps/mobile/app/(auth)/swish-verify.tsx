import { YStack, Text, H2, Spinner } from 'tamagui'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import * as Linking from 'expo-linking'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'
import { LustreButton } from '@lustre/ui'

export default function SwishVerifyScreen() {
  const router = useRouter()
  const setTokens = useAuthStore((state) => state.setTokens)
  const setTempRegistrationToken = useAuthStore((state) => state.setTempRegistrationToken)
  const [swishUrl, setSwishUrl] = useState<string | null>(null)
  const [pollError, setPollError] = useState<string | null>(null)
  const [shouldPoll, setShouldPoll] = useState(false)
  const [swishRequestToken, setSwishRequestToken] = useState<string | null>(null)

  const createPaymentMutation = trpc.auth.swish.createPayment.useMutation()

  const statusQuery = trpc.auth.swish.checkStatus.useQuery(undefined, {
    enabled: shouldPoll && !!swishRequestToken,
    refetchInterval: 2000,
  })

  useEffect(() => {
    createPaymentMutation.mutate(
      { phoneNumber: undefined },
      {
        onSuccess: (data) => {
          const swishLink = `swish://payment/${data.paymentRequestToken}`
          setSwishUrl(swishLink)
          setSwishRequestToken(data.paymentRequestToken)
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

  useEffect(() => {
    if (statusQuery.data?.status === 'PAID') {
      setShouldPoll(false)
      setTempRegistrationToken(swishRequestToken)
      router.replace('/(auth)/verify-loading')
    }
  }, [statusQuery.data])

  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor="$background"
      paddingHorizontal="$4"
      gap="$4"
    >
      <H2 color="$primary" textAlign="center">
        Verifiera med Swish
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
            Vi behöver verifiera din identitet via en Swish-betalning på 10 kr.
            Betalningen bekräftar ditt namn och telefonnummer.
          </Text>

          <LustreButton width="100%" onPress={handleOpenSwish}>
            <Text color="$background" fontWeight="600">
              Öppna Swish
            </Text>
          </LustreButton>

          <Text color="$textSecondary" textAlign="center" fontSize="$3">
            eller
          </Text>

          <LustreButton
            width="100%"
            variant="outline"
            disabled={statusQuery.isFetching}
            onPress={() => setShouldPoll(true)}
          >
            {statusQuery.isFetching ? (
              <>
                <Spinner size="small" color="$primary" marginRight="$2" />
                <Text color="$primary">Kontrollerar...</Text>
              </>
            ) : (
              <Text color="$primary" fontWeight="600">
                Jag har betalat
              </Text>
            )}
          </LustreButton>
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
  )
}
