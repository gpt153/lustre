import React from 'react'
import { Pressable, type ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from 'tamagui'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger'

interface LustreButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  onPress?: () => void
  disabled?: boolean
  style?: ViewStyle
  [key: string]: unknown
}

const BASE_STYLE: ViewStyle = {
  borderRadius: 9999,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 24,
  paddingVertical: 12,
  overflow: 'hidden',
}

const VARIANT_STYLES: Record<ButtonVariant, ViewStyle> = {
  primary: {
    ...BASE_STYLE,
  },
  secondary: {
    ...BASE_STYLE,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(216, 195, 180, 0.20)',
  },
  outline: {
    ...BASE_STYLE,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(216, 195, 180, 0.20)',
  },
  danger: {
    ...BASE_STYLE,
    backgroundColor: '#E05A33',
  },
}

const TEXT_COLOR: Record<ButtonVariant, string> = {
  primary: '#ffffff',
  secondary: '#894d0d',
  outline: '#894d0d',
  danger: '#FDF8F3',
}

export function LustreButton({
  children,
  variant = 'primary',
  onPress,
  disabled,
  style,
  ...rest
}: LustreButtonProps) {
  const variantStyle = VARIANT_STYLES[variant]
  const textColor = TEXT_COLOR[variant]

  const content = (
    <Text
      color={textColor as never}
      fontWeight="600"
      fontFamily="$heading"
      fontSize={16}
    >
      {children}
    </Text>
  )

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          BASE_STYLE,
          { opacity: disabled ? 0.5 : pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
          style,
        ]}
        {...rest}
      >
        <LinearGradient
          colors={['#894d0d', '#a76526']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 9999, width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 24 }}
        >
          {content}
        </LinearGradient>
      </Pressable>
    )
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        variantStyle,
        { opacity: disabled ? 0.5 : pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
        style,
      ]}
      {...rest}
    >
      {content}
    </Pressable>
  )
}
