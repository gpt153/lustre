import { styled, Button as TamaguiButton } from 'tamagui'

export const LustreButton = styled(TamaguiButton, {
  backgroundColor: '$primary',
  color: '#FFFFFF',
  borderRadius: 8,
  paddingHorizontal: 24,
  paddingVertical: 12,
  fontWeight: '600',

  variants: {
    variant: {
      secondary: {
        backgroundColor: '$secondary',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '$primary',
        color: '$primary',
      },
    },
  } as const,
})
