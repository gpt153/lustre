import { XStack, Text } from 'tamagui'

interface AiQualifiedBadgeProps {
  size?: 'small' | 'medium'
}

export function AiQualifiedBadge({ size = 'small' }: AiQualifiedBadgeProps) {
  const fontSize = size === 'small' ? '$2' : '$3'
  const padding = size === 'small' ? '$1' : '$2'

  return (
    <XStack
      backgroundColor="$green3"
      paddingHorizontal={padding}
      paddingVertical="$0.5"
      borderRadius="$2"
      alignItems="center"
      gap="$1"
    >
      <Text fontSize={fontSize} color="$green11">AI-qualified</Text>
    </XStack>
  )
}
