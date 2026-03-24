import { YStack, Text, H1, Spinner } from 'tamagui'
import { LustreButton } from '@lustre/ui'
import { useHealthCheck } from '@lustre/app'

export default function HomeScreen() {
  const { data, isLoading, error } = useHealthCheck()

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background" padding="$4">
      <H1 color="$primary" marginBottom="$4">Lustre</H1>
      <Text color="$textSecondary" fontSize="$3" marginBottom="$6" textAlign="center">
        A sex-positive social network
      </Text>
      {isLoading ? (
        <Spinner color="$primary" />
      ) : error ? (
        <Text color="red" fontSize="$2">API offline</Text>
      ) : (
        <Text color="green" fontSize="$2">
          API: {data?.status} — {data?.timestamp?.toISOString()}
        </Text>
      )}
      <LustreButton marginTop="$4">Coming Soon</LustreButton>
    </YStack>
  )
}
