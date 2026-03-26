import { styled, Input } from 'tamagui'

export const LustreInput = styled(Input, {
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#C4956A',  // copperMuted
  backgroundColor: '#FDF8F3',  // warmWhite
  color: '#2C2421',  // charcoal
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 16,
  placeholderTextColor: '#8B7E74',  // warmGray

  focusStyle: {
    borderColor: '#B87333',  // copper
    borderWidth: 2,
    outlineColor: 'rgba(184, 115, 51, 0.2)',
    outlineWidth: 3,
    outlineStyle: 'solid',
  },

  hoverStyle: {
    borderColor: '#D4A574',  // copperLight
  },

  variants: {
    error: {
      true: {
        borderColor: '#E05A33',  // ember
        focusStyle: {
          borderColor: '#E05A33',
          outlineColor: 'rgba(224, 90, 51, 0.2)',
        },
      },
    },
  } as const,
})
