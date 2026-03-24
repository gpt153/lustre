import { YStack, XStack, Text, H2, Input, Button } from 'tamagui'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'

const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/

export default function DisplayNameScreen() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const setUserDisplayName = useAuthStore((state) => {
    const userId = state.userId
    return (name: string) => {
      state.setUser(userId!, name)
    }
  })

  const setDisplayNameMutation = trpc.user.setDisplayName.useMutation()

  const isValid = DISPLAY_NAME_REGEX.test(displayName)

  const handleSetDisplayName = () => {
    setError(null)

    if (!isValid) {
      setError('Användarnamnet måste innehålla 3-30 alfanumeriska tecken eller understreck')
      return
    }

    setDisplayNameMutation.mutate(
      { displayName },
      {
        onSuccess: () => {
          setUserDisplayName(displayName)
          router.replace('/(tabs)')
        },
        onError: (error) => {
          setError('Kunde inte spara användarnamn. Försök igen.')
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
          Välj användarnamn
        </H2>

        <Text color="$textSecondary" textAlign="center" fontSize="$3">
          Det här är det namn som andra användare ser
        </Text>

        <Input
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="användarnamn"
          placeholderTextColor="$textSecondary"
          backgroundColor="$surface"
          color="$text"
          borderRadius={8}
          borderWidth={1}
          borderColor={error ? '#E53935' : '$secondary'}
          paddingHorizontal="$3"
          paddingVertical="$3"
          fontSize="$4"
          width="100%"
          maxLength={30}
        />

        <Text color="$textSecondary" fontSize="$2" textAlign="center">
          3-30 tecken, endast bokstäver, siffror och understreck
        </Text>

        {error && (
          <Text color="#E53935" fontSize="$3" textAlign="center">
            {error}
          </Text>
        )}

        <Text color="$textSecondary" fontSize="$2">
          Längd: {displayName.length}/30
        </Text>

        <Button
          onPress={handleSetDisplayName}
          disabled={!isValid || setDisplayNameMutation.isPending}
          backgroundColor={isValid ? '$primary' : '$secondary'}
          color="$background"
          fontWeight="600"
          paddingHorizontal="$6"
          paddingVertical="$3"
          width="100%"
          marginTop="$4"
        >
          {setDisplayNameMutation.isPending ? 'Sparar...' : 'Fortsätt'}
        </Button>
      </YStack>
    </YStack>
  )
}
