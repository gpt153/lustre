import { styled, YStack } from 'tamagui'

export const CardBase = styled(YStack, {
  backgroundColor: '#F5EDE4', // warmCream
  borderRadius: 16,
  padding: '$md',

  // Warm-tinted shadow for depth (no borders)
  shadowColor: '#2C2421', // charcoal
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,

  // Android elevation fallback
  elevationAndroid: 2,

  variants: {
    elevation: {
      1: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevationAndroid: 2,
      },
      2: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevationAndroid: 4,
      },
      3: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevationAndroid: 6,
      },
    },
  } as const,

  defaultVariants: {
    elevation: 1,
  },
})
