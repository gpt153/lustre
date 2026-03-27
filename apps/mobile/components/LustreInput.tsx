/**
 * LustreInput — Mobile-specific enhanced input with animated validation states.
 *
 * Features:
 * - Reanimated interpolateColor for border transitions (neutral → error → success)
 * - Spring-animated error message slide-down
 * - WarningCircle / CheckCircle phosphor icons for validation state
 * - Accessibility: accessibilityLiveRegion, accessibilityState
 */

import React, { useEffect } from 'react'
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  StyleSheet,
} from 'react-native'
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { CheckCircle, WarningCircle } from 'phosphor-react-native'
import { SPACING } from '@/constants/tokens'
import { SPRING, TIMING } from '@/constants/animations'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LustreInputProps extends TextInputProps {
  /** Label shown above the input */
  label?: string
  /** Error string — triggers error state with ember border + WarningCircle icon */
  error?: string
  /** Success flag — triggers success state with sage border + CheckCircle icon */
  success?: boolean
  /** Helper text shown below the input when there is no error */
  helperText?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHARCOAL = '#2C2421'
const EMBER = '#C85A3A'
const SAGE = '#7A9E7E'
const COPPER_MUTED = '#C4956A'
const WARM_WHITE = '#FDF8F3'
const WARM_GRAY = '#8B7E74'

/** borderProgress encoding: 0 = neutral, 1 = error, 2 = success */
const BORDER_NEUTRAL = 0
const BORDER_ERROR = 1
const BORDER_SUCCESS = 2

const ERROR_MESSAGE_HEIGHT = 22

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LustreInput({
  label,
  error,
  success,
  helperText,
  style,
  ...rest
}: LustreInputProps) {
  const borderProgress = useSharedValue(BORDER_NEUTRAL)
  const errorHeight = useSharedValue(0)
  const errorOpacity = useSharedValue(0)
  const successOpacity = useSharedValue(0)

  useEffect(() => {
    const hasError = Boolean(error)
    const hasSuccess = !hasError && Boolean(success)

    if (hasError) {
      borderProgress.value = withTiming(BORDER_ERROR, { duration: TIMING.fast })
      errorHeight.value = withSpring(ERROR_MESSAGE_HEIGHT, {
        damping: SPRING.snappy.damping,
        stiffness: SPRING.snappy.stiffness,
      })
      errorOpacity.value = withTiming(1, { duration: TIMING.fast })
      successOpacity.value = withTiming(0, { duration: TIMING.fast })
    } else if (hasSuccess) {
      borderProgress.value = withTiming(BORDER_SUCCESS, { duration: TIMING.fast })
      errorHeight.value = withTiming(0, { duration: 150 })
      errorOpacity.value = withTiming(0, { duration: 150 })
      successOpacity.value = withTiming(1, { duration: TIMING.fast })
    } else {
      borderProgress.value = withTiming(BORDER_NEUTRAL, { duration: TIMING.fast })
      errorHeight.value = withTiming(0, { duration: 150 })
      errorOpacity.value = withTiming(0, { duration: 150 })
      successOpacity.value = withTiming(0, { duration: TIMING.fast })
    }

  }, [error, success])

  // Animated border color
  const borderAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [BORDER_NEUTRAL, BORDER_ERROR, BORDER_SUCCESS],
      [COPPER_MUTED, EMBER, SAGE],
    ),
    borderWidth: 1.5,
  }))

  // Animated error message container
  const errorContainerStyle = useAnimatedStyle(() => ({
    height: errorHeight.value,
    opacity: errorOpacity.value,
    overflow: 'hidden' as const,
  }))

  // Animated success icon
  const successIconStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
  }))

  const hasError = Boolean(error)
  const hasSuccess = !hasError && Boolean(success)

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}

      <Animated.View style={[styles.inputContainer, borderAnimatedStyle]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={WARM_GRAY}
          accessibilityState={{ disabled: rest.editable === false, selected: false }}
          accessibilityHint={error ?? helperText}
          {...rest}
        />

        {/* Right-side icon: error takes priority over success */}
        {hasError ? (
          <View style={styles.iconContainer} accessibilityElementsHidden>
            <WarningCircle size={20} color={EMBER} weight="fill" />
          </View>
        ) : hasSuccess ? (
          <Animated.View style={[styles.iconContainer, successIconStyle]} accessibilityElementsHidden>
            <CheckCircle size={20} color={SAGE} weight="fill" />
          </Animated.View>
        ) : null}
      </Animated.View>

      {/* Animated error message */}
      <Animated.View style={errorContainerStyle}>
        <Text
          style={styles.errorText}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      </Animated.View>

      {/* Static helper text (only when no error) */}
      {helperText && !hasError ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: CHARCOAL,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: WARM_WHITE,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 16,
    color: CHARCOAL,
  },
  iconContainer: {
    paddingRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: EMBER,
    marginTop: SPACING.xs,
    paddingHorizontal: 2,
  },
  helperText: {
    fontSize: 12,
    color: WARM_GRAY,
    marginTop: SPACING.xs,
    paddingHorizontal: 2,
  },
})
