import { Text, TextProps } from 'tamagui'

/**
 * Lustre Brand Logo Text Component
 *
 * Uses the $brand font variant:
 * - General Sans weight 600
 * - 24px size
 * - 2px letter spacing
 * - 1.3x line height
 *
 * Usage:
 * <LogoBrand />
 * <LogoBrand size="$6" /> // Override size if needed
 */
export function LogoBrand(props: TextProps) {
  return (
    <Text
      fontFamily="$heading"
      fontWeight="600"
      fontSize="$5"
      letterSpacing={2}
      lineHeight={1.3}
      {...props}
    >
      Lustre
    </Text>
  )
}
