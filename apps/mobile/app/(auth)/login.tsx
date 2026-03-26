import { YStack, Text, H2, Input, Pressable } from 'tamagui'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Platform } from 'react-native'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'
import { LustreButton } from '@lustre/ui'

export default function LoginScreen() {
  const router = useRouter()
  const setTokens = useAuthStore((state) => state.setTokens)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loginMutation = trpc.auth.loginWithEmail.useMutation({
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken)
      router.replace('/(app)')
    },
    onError: (err) => setError(err.message),
  })

  const handleLogin = () => {
    if (!email || !password) {
      setError('Fyll i alla fält')
      return
    }
    loginMutation.mutate({ email, password })
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
        Logga in
      </H2>

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
        placeholder="Lösenord"
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
        onPress={handleLogin}
        disabled={loginMutation.isPending}
        marginTop="$2"
      >
        <Text color="$background" fontWeight="600">
          {loginMutation.isPending ? 'Loggar in...' : 'Logga in'}
        </Text>
      </LustreButton>

      <LustreButton width="100%" variant="outline" onPress={() => {}}>
        <Text color="$primary" fontWeight="600">
          Fortsätt med Google
        </Text>
      </LustreButton>

      {Platform.OS === 'ios' && (
        <LustreButton width="100%" variant="outline" onPress={() => {}}>
          <Text color="$primary" fontWeight="600">
            Fortsätt med Apple
          </Text>
        </LustreButton>
      )}

      <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
        <Text color="$primary" fontSize="$3">
          Glömt lösenord?
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push('/(auth)/swish-verify')}>
        <Text color="$textSecondary" fontSize="$3">
          Nytt konto? Registrera dig
        </Text>
      </Pressable>
    </YStack>
  )
}
