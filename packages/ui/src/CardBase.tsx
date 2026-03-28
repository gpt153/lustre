import { styled, YStack } from 'tamagui'

export const CardBase = styled(YStack, {
  backgroundColor: '#ffffff',   // surfaceContainerLowest — tonal layering on surface bg
  borderRadius: 16,
  borderWidth: 0,
  padding: '$md',

  // Ultra-diffused charcoal shadow
  shadowColor: '#2C2421',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.06,
  shadowRadius: 24,

  // Android elevation fallback
  elevationAndroid: 2,

  variants: {
    elevation: {
      1: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevationAndroid: 2,
      },
      2: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
        elevationAndroid: 2,
      },
      3: {
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.06,
        shadowRadius: 40,
        elevationAndroid: 2,
      },
    },
  } as const,

  defaultVariants: {
    elevation: 1,
  },
})
