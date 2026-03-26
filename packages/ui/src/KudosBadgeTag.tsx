import { XStack, Text } from 'tamagui'

interface KudosBadgeTagProps {
  name: string
  count: number
}

export function KudosBadgeTag({ name, count }: KudosBadgeTagProps) {
  return (
    <XStack
      backgroundColor="$gray3"
      paddingHorizontal="$3"
      paddingVertical="$1.5"
      borderRadius="$4"
      alignItems="center"
      gap="$1"
    >
      <Text fontSize="$3" fontWeight="500">
        {name}
      </Text>
      <Text fontSize="$2" color="$gray10">
        x{count}
      </Text>
    </XStack>
  )
}
