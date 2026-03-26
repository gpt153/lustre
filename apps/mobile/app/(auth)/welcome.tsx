import { YStack, XStack, Text, H1, Spinner } from 'tamagui'
import { LustreButton } from '@lustre/ui'
import { useRouter } from 'expo-router'
import { useState } from 'react'

export default function WelcomeScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = () => {
    setIsLoading(true)
    router.push('/(auth)/swish-verify')
  }

  const handleLogin = () => {
    setIsLoading(true)
    router.push('/(auth)/login')
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
    </YStack>
  )
}
