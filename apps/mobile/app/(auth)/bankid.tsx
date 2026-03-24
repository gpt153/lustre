import { YStack, Text, H2, Spinner, Button } from 'tamagui'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import * as Linking from 'expo-linking'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'

export default function BankIDScreen() {
  const router = useRouter()
  const setTokens = useAuthStore((state) => state.setTokens)
  const setUser = useAuthStore((state) => state.setUser)
  const setNeedsPayment = useAuthStore((state) => state.setNeedsPayment)

  const [bankidUrl, setBankidUrl] = useState<string | null>(null)
  const [state, setState] = useState<string | null>(null)
  const [hasVerified, setHasVerified] = useState(false)
  const [callbackError, setCallbackError] = useState<string | null>(null)

  const initMutation = trpc.auth.bankid.init.useMutation()
  const callbackMutation = trpc.auth.bankid.callback.useMutation()

  useEffect(() => {
    initMutation.mutate(undefined, {
      onSuccess: (data) => {
        setBankidUrl(data.authUrl)
        setState(data.state)
      },
      onError: () => {
        setCallbackError('Kunde inte initialisera BankID')
      },
    })
  }, [])

  const handleOpenBankID = async () => {
    if (!bankidUrl) return
    try {
      const supported = await Linking.canOpenURL(bankidUrl)
      if (supported) {
        await Linking.openURL(bankidUrl)
      }
    } catch (error) {
      setCallbackError('Kunde inte öppna BankID-appen')
    }
  }

  const handleVerified = () => {
    if (!state) return
    setHasVerified(true)

    callbackMutation.mutate(
      { code: 'verified', state },
      {
        onSuccess: (data) => {
          setTokens(data.accessToken, data.refreshToken)
          setUser(data.user.id, data.user.displayName ?? null)

          if (data.isNewUser) {
            setNeedsPayment(true)
            router.replace('/(auth)/payment')
          } else {
            router.replace('/(tabs)')
          }
        },
        onError: (error) => {
          setCallbackError('Verifieringen misslyckades')
          setHasVerified(false)
        },
      }
    )
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
          Verifiera med BankID
        </H2>

        {!bankidUrl ? (
          <>
            <Spinner size="large" color="$primary" />
            <Text color="$textSecondary" textAlign="center">
              Initialiserar BankID...
            </Text>
          </>
        ) : (
          <>
            <Text color="$textSecondary" textAlign="center" marginBottom="$2">
              Öppna BankID-appen och godkänn inloggningen
            </Text>

            <Button
              onPress={handleOpenBankID}
              backgroundColor="$primary"
              color="$background"
              fontWeight="600"
              paddingHorizontal="$6"
              paddingVertical="$3"
            >
              Öppna BankID
            </Button>

            <Text color="$textSecondary" textAlign="center" fontSize="$3">
              eller
            </Text>

            <Button
              onPress={handleVerified}
              disabled={hasVerified || callbackMutation.isPending}
              variant="outline"
              borderColor="$primary"
              color="$primary"
              fontWeight="600"
              paddingHorizontal="$6"
              paddingVertical="$3"
            >
              {hasVerified || callbackMutation.isPending ? (
                <>
                  <Spinner size="small" color="$primary" marginRight="$2" />
                  <Text color="$primary">Verifierar...</Text>
                </>
              ) : (
                'Jag har verifierat'
              )}
            </Button>
          </>
        )}

        {callbackError && (
          <Text color="#E53935" textAlign="center" marginTop="$4">
            {callbackError}
          </Text>
        )}

        {initMutation.isPending && (
          <Text color="$textSecondary" marginTop="$2">
            Öppnar BankID...
          </Text>
        )}
      </YStack>
    </YStack>
  )
}
