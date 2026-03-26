import { YStack, Text, H2, Input } from 'tamagui'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'
import { LustreButton } from '@lustre/ui'

export default function SetCredentialsScreen() {
  const router = useRouter()
  const { tempToken } = useLocalSearchParams<{ tempToken: string }>()
  const setTokens = useAuthStore((state) => state.setTokens)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const completeMutation = trpc.auth.completeRegistration.useMutation({
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken)
      router.push('/(auth)/display-name')
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleSubmit = () => {
    if (!email || !password) {
      setError('Fyll i alla fält')
      return
    }
    if (password.length < 8) {
      setError('Lösenordet måste vara minst 8 tecken')
      return
    }
    if (!tempToken) {
      setError('Verifieringstoken saknas')
      return
    }
    completeMutation.mutate({ tempToken, email, password })
  }

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
        Skapa inloggning
      </H2>
      <Text color="$textSecondary" textAlign="center">
        Välj e-post och lösenord för att logga in.
      </Text>

      <Input
        width="100%"
        placeholder="E-postadress"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        backgroundColor="$surface"
        color="$text"
        borderRadius={8}
        borderWidth={1}
        borderColor={error ? '#E53935' : '$secondary'}
        paddingHorizontal="$3"
        paddingVertical="$3"
        fontSize="$4"
      />

      <Input
        width="100%"
        placeholder="Lösenord (minst 8 tecken)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        backgroundColor="$surface"
        color="$text"
        borderRadius={8}
        borderWidth={1}
        borderColor={error ? '#E53935' : '$secondary'}
        paddingHorizontal="$3"
        paddingVertical="$3"
        fontSize="$4"
      />

      {error && (
        <Text color="#E53935" textAlign="center">
          {error}
        </Text>
      )}

      <LustreButton
        width="100%"
        onPress={handleSubmit}
        disabled={completeMutation.isPending}
        marginTop="$4"
      >
        <Text color="$background" fontWeight="600">
          {completeMutation.isPending ? 'Skapar konto...' : 'Fortsätt'}
        </Text>
      </LustreButton>
    </YStack>
  )
}
