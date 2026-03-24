import { YStack, Text, H2, Button } from 'tamagui'
import { useRouter } from 'expo-router'
import { trpc } from '@lustre/api'
import { useAuth, useAuthStore } from '@lustre/app'

export default function ProfileScreen() {
  const router = useRouter()
  const auth = useAuth()
  const logout = useAuthStore((state) => state.logout)

  const logoutMutation = trpc.auth.logout.useMutation()

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        logout()
        router.replace('/(auth)/welcome')
      },
      onError: () => {
        logout()
        router.replace('/(auth)/welcome')
      },
    })
  }

  return (
    <YStack flex={1} alignItems="center" justifyContent="flex-start" backgroundColor="$background" paddingTop="$6" paddingHorizontal="$4">
      <H2 color="$primary" marginBottom="$4">
        Profil
      </H2>

      <YStack width="100%" gap="$2" marginBottom="$6">
        <Text color="$textSecondary" fontSize="$3">
          Användarnamn
        </Text>
        <Text color="$text" fontSize="$4" fontWeight="600">
          {auth.displayName ?? 'Inställning...'}
        </Text>
      </YStack>

      <Button
        onPress={handleLogout}
        disabled={logoutMutation.isPending}
        backgroundColor="#E53935"
        color="$background"
        fontWeight="600"
        paddingHorizontal="$6"
        paddingVertical="$3"
        width="100%"
      >
        {logoutMutation.isPending ? 'Loggar ut...' : 'Logga ut'}
      </Button>
    </YStack>
  )
}
