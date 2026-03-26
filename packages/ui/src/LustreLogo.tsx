import { Image, XStack, useWindowDimensions } from 'tamagui'
import { Text } from 'tamagui'
import { useMemo } from 'react'

export interface LustreLogoProps {
  /**
   * Visual variant: 'light' shows charcoal text on light bg,
   * 'dark' shows warmCream text on dark bg
   */
  variant?: 'light' | 'dark'
  /**
   * Height of the logo image in pixels (default: 32)
   */
  height?: number
  /**
   * Optional CSS width for web
   */
  width?: number | string
}

/**
 * LustreLogo Component
 *
 * Renders the Lustre logo PNG + "Lustre" brand text
 * The 3D hammered copper lotus vessel with golden flame
 *
 * Works on both mobile (React Native Image) and web
 *
 * Usage:
 * <LustreLogo variant="light" height={32} />
 * <LustreLogo variant="dark" height={40} />
 */
export function LustreLogo({ variant = 'light', height = 32, width }: LustreLogoProps) {
  const textColor = variant === 'light' ? '#2C2421' : '#F5EDE4' // charcoal or warmCream

  // Calculate proportional width based on height
  // Logo is roughly square, so width ≈ height
  const imageWidth = typeof width === 'number' ? width : height

  return (
    <XStack
      alignItems="center"
      gap="$2"
      testID="lustre-logo"
    >
      {/* Logo Image */}
      <Image
        source={require('./assets/lustre-logo-transparent.png')}
        width={imageWidth}
        height={height}
        resizeMode="contain"
        testID="lustre-logo-image"
      />

      {/* "Lustre" Text */}
      <Text
        fontFamily="$heading"
        fontWeight="600"
        fontSize="$5"
        letterSpacing={2}
        lineHeight={1.3}
        color={textColor}
        testID="lustre-logo-text"
      >
        Lustre
      </Text>
    </XStack>
  )
}
