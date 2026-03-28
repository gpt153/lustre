import { styled, Button as TamaguiButton } from 'tamagui'

export const LustreButton = styled(TamaguiButton, {
  backgroundColor: '#D4A843',  // gold
  color: '#2C2421',  // charcoal text on gold
  borderRadius: 12,
  paddingHorizontal: '$lg',
  paddingVertical: '$sm',
  fontWeight: '600',
  fontFamily: '$heading',

  pressStyle: {
    backgroundColor: '#C9973E',  // goldDeep
    scale: 0.95,
    opacity: 0.9,
  },

  hoverStyle: {
    backgroundColor: '#E8B84B',  // goldBright
  },

  variants: {
    variant: {
      secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#B87333',  // copper
        color: '#B87333',
        pressStyle: {
          backgroundColor: '#D4A574',  // copperLight fill
          color: '#2C2421',
          scale: 0.95,
        },
        hoverStyle: {
          backgroundColor: 'rgba(184, 115, 51, 0.1)',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#B87333',
        color: '#B87333',
        pressStyle: {
          backgroundColor: 'rgba(184, 115, 51, 0.1)',
          scale: 0.95,
        },
      },
      danger: {
        backgroundColor: '#E05A33',  // ember
        color: '#FDF8F3',  // warmWhite
        pressStyle: {
          backgroundColor: '#C84A28',
          scale: 0.95,
        },
      },
    },
  } as const,
})
