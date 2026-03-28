import { styled, Input } from 'tamagui'

export const LustreInput = styled(Input, {
  borderRadius: 9999,
  borderWidth: 0,
  backgroundColor: '#f8f3ee',  // surfaceContainerLow
  color: '#1d1b19',             // onSurface
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  fontSize: 16,
  placeholderTextColor: '#524439',  // onSurfaceVariant

  focusStyle: {
    backgroundColor: '#ece7e2',  // surfaceContainerHigh
    shadowColor: '#894d0d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  hoverStyle: {
    backgroundColor: '#f2ede8',  // surfaceContainer
  },

  variants: {
    error: {
      true: {
        backgroundColor: 'rgba(224, 90, 51, 0.08)',  // ember tint, no border
        focusStyle: {
          backgroundColor: 'rgba(224, 90, 51, 0.12)',
          shadowColor: '#E05A33',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
      },
    },
  } as const,
})
