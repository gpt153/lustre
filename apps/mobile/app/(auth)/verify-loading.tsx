import { YStack, Text, H2, Spinner } from 'tamagui'

export default function VerifyLoadingScreen() {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor="$background"
      paddingHorizontal="$4"
      gap="$4"
    >
      <Spinner size="large" color="$primary" />
      <H2 color="$primary" textAlign="center">
        Verifierar din identitet
      </H2>
      <Text color="$textSecondary" textAlign="center">
        Vi kontrollerar din ålder och identitet. Det tar bara några sekunder.
      </Text>
    </YStack>
  )
}
