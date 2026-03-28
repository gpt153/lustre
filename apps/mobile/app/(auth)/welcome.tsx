import { YStack, XStack, Text, H1, Spinner } from 'tamagui'
import { LustreButton } from '@lustre/ui'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert } from 'react-native'
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import { useAuthStore } from '@lustre/app/src/stores/authStore'

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'https://api.lovelustre.com'

export default function WelcomeScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [devLoading, setDevLoading] = useState(false)
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)

  const handleSignup = () => {
    setIsLoading(true)
    router.push('/(auth)/swish-verify')
  }

  const handleLogin = () => {
    setIsLoading(true)
    router.push('/(auth)/login')
  }

  const handleDevLogin = async () => {
    setDevLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/dev/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: 'Samuel' }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setTokens(data.accessToken, data.refreshToken)
      setUser(data.user.id, data.user.displayName)
    } catch (err) {
      Alert.alert('Dev Login Failed', `Kunde inte nå API:t (${API_URL}).\n\n${err}`)
    } finally {
      setDevLoading(false)
    }
  }

  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor="$background"
      paddingHorizontal="$4"
    >
      <YStack
        alignItems="center"
        justifyContent="center"
        marginBottom="$8"
      >
        <H1 color="$primary" fontSize="$8" fontWeight="700" marginBottom="$2">
          Lustre
        </H1>
        <Text color="$textSecondary" fontSize="$4">
          En positiv kärleks- och träffapp
        </Text>
      </YStack>

      <YStack width="100%" gap="$3">
        <LustreButton
          width="100%"
          onPress={handleSignup}
          disabled={isLoading}
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          gap="$2"
        >
          {isLoading && <Spinner size="small" color="$background" />}
          <Text color="$background" fontWeight="600" fontSize="$4">
            {isLoading ? 'Laddar...' : 'Skapa konto'}
          </Text>
        </LustreButton>

        <LustreButton
          width="100%"
          variant="outline"
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text color="$primary" fontWeight="600" fontSize="$4">
            Logga in
          </Text>
        </LustreButton>
      </YStack>

      <Text
        color="$textSecondary"
        fontSize="$2"
        marginTop="$8"
        textAlign="center"
        maxWidth="100%"
      >
        Vi verifierar din identitet via Swish
      </Text>

      {(
        <LustreButton
          width="100%"
          variant="outline"
          onPress={handleDevLogin}
          disabled={devLoading}
          marginTop="$4"
          borderColor="$gray8"
        >
          {devLoading ? (
            <Spinner size="small" color="$gray8" />
          ) : (
            <Text color="$gray8" fontSize="$2">
              Dev Login (Samuel)
            </Text>
          )}
        </LustreButton>
      )}
    </YStack>
  )
}
