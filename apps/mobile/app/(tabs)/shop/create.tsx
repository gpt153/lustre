import { useRouter } from 'expo-router'
import { YStack, Button, XStack, Text } from 'tamagui'
import { CreateListingScreen } from '@lustre/app/src/screens/CreateListingScreen'

export default function CreateListingRoute() {
  const router = useRouter()

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack
        padding="$4"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Button
          onPress={() => router.back()}
          unstyled
          padding="$0"
        >
          <Text fontSize={18} color="$pink8">
            ← Tillbaka
          </Text>
        </Button>
        <Text fontSize={16} fontWeight="600" color="$color">
          Ny annons
        </Text>
        <YStack width={40} />
      </XStack>

      <CreateListingScreen
        onSuccess={() => {
          router.push('/(tabs)/shop')
        }}
      />
    </YStack>
  )
}
