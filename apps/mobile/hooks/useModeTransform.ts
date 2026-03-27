/**
 * useModeTransform — Core mode transformation hook
 *
 * Drives the full-UI vanilla/spicy transition via a single Reanimated
 * shared value `modeProgress` (0 = vanilla, 1 = spicy).  All downstream
 * animated style properties are derived from this one value so the entire
 * UI morphs in perfect sync.
 */

import { useCallback, useEffect } from 'react'
import {
  useSharedValue,
  useDerivedValue,
  withSpring,
  interpolateColor,
  interpolate,
} from 'react-native-reanimated'
import { useModeStore } from '@lustre/app/src/stores/modeStore'
import { SPRING } from '@/constants/animations'
import {
  COLORS_VANILLA_LIGHT,
  COLORS_VANILLA_DARK,
  COLORS_SPICY_LIGHT,
  COLORS_SPICY_DARK,
  SHADOWS,
} from '@/constants/tokens'
import { useColorScheme } from 'react-native'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnimatedColors {
  /** Animated background color for the current mode × scheme */
  background: ReturnType<typeof useDerivedValue<string>>
  /** Animated surface/card color */
  surface: ReturnType<typeof useDerivedValue<string>>
  /** Animated elevated surface color */
  surfaceElevated: ReturnType<typeof useDerivedValue<string>>
  /** Animated border color */
  border: ReturnType<typeof useDerivedValue<string>>
  /** Animated accent (copper → spicy accent) */
  accent: ReturnType<typeof useDerivedValue<string>>
  /** Animated light accent */
  accentLight: ReturnType<typeof useDerivedValue<string>>
  /** Animated primary text color */
  text: ReturnType<typeof useDerivedValue<string>>
  /** Animated secondary text color */
  textSecondary: ReturnType<typeof useDerivedValue<string>>
  /** Animated shadow opacity (sm → md transition) */
  shadowOpacity: ReturnType<typeof useDerivedValue<number>>
  /** Animated shadow radius (sm → md transition) */
  shadowRadius: ReturnType<typeof useDerivedValue<number>>
}

export interface ModeTransformResult {
  /** Shared value — 0 = vanilla, 1 = spicy */
  modeProgress: ReturnType<typeof useSharedValue<number>>
  /** Toggle mode — reads from store, updates progress */
  toggleMode: (toSpicy: boolean) => void
  /** All animated color derived values */
  animatedColors: AnimatedColors
}

// ---------------------------------------------------------------------------
// Toggle spring config
// ---------------------------------------------------------------------------

const MODE_SPRING = SPRING.gentle // damping 15, stiffness 60, mass 1.2 → ~600 ms

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useModeTransform(): ModeTransformResult {
  const { mode, setMode } = useModeStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  // Pick the correct light/dark color pair for each property
  const vanillaColors = isDark ? COLORS_VANILLA_DARK : COLORS_VANILLA_LIGHT
  const spicyColors = isDark ? COLORS_SPICY_DARK : COLORS_SPICY_LIGHT

  // Central shared value driving all derived animations
  const modeProgress = useSharedValue(mode === 'spicy' ? 1 : 0)

  // Detect system reduced-motion preference via AccessibilityInfo is async;
  // we use a shared value so the toggle callback can read it on the JS thread.
  const reducedMotion = useSharedValue(false)

  useEffect(() => {
    let cancelled = false
    const { AccessibilityInfo } = require('react-native')
    AccessibilityInfo.isReduceMotionEnabled().then((val: boolean) => {
      if (!cancelled) reducedMotion.value = val
    })
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (val: boolean) => {
      reducedMotion.value = val
    })
    return () => {
      cancelled = true
      sub.remove()
    }
  }, [])

  // Sync modeProgress when the store changes externally (e.g. on app launch
  // with a persisted spicy mode, or remote sync via useMode)
  useEffect(() => {
    const target = mode === 'spicy' ? 1 : 0
    if (reducedMotion.value) {
      modeProgress.value = target
    } else {
      modeProgress.value = withSpring(target, MODE_SPRING)
    }
  }, [mode])

  const toggleMode = useCallback(
    (toSpicy: boolean) => {
      const target = toSpicy ? 1 : 0
      if (reducedMotion.value) {
        modeProgress.value = target
      } else {
        modeProgress.value = withSpring(target, MODE_SPRING)
      }
      setMode(toSpicy ? 'spicy' : 'vanilla')
    },
    [setMode],
  )

  // ---------------------------------------------------------------------------
  // Derived animated colors — all run on the UI thread
  // ---------------------------------------------------------------------------

  const background = useDerivedValue(() =>
    interpolateColor(
      modeProgress.value,
      [0, 1],
      [vanillaColors.background, spicyColors.background],
    ),
  )

  const surface = useDerivedValue(() =>
    interpolateColor(
      modeProgress.value,
      [0, 1],
      [vanillaColors.surface, spicyColors.surface],
    ),
  )

  const surfaceElevated = useDerivedValue(() =>
    interpolateColor(
      modeProgress.value,
      [0, 1],
      [vanillaColors.surfaceElevated, spicyColors.surfaceElevated],
    ),
  )

  const border = useDerivedValue(() =>
    interpolateColor(
      modeProgress.value,
      [0, 1],
      [vanillaColors.border, spicyColors.border],
    ),
  )

  const accent = useDerivedValue(() =>
    interpolateColor(
      modeProgress.value,
      [0, 1],
      [vanillaColors.accent, spicyColors.accent],
    ),
  )

  const accentLight = useDerivedValue(() =>
    interpolateColor(
      modeProgress.value,
      [0, 1],
      [vanillaColors.accentLight, spicyColors.accentLight],
    ),
  )

  const text = useDerivedValue(() =>
    interpolateColor(
      modeProgress.value,
      [0, 1],
      [vanillaColors.text, spicyColors.text],
    ),
  )

  const textSecondary = useDerivedValue(() =>
    interpolateColor(
      modeProgress.value,
      [0, 1],
      [vanillaColors.textSecondary, spicyColors.textSecondary],
    ),
  )

  // Shadow transitions: SHADOWS.sm → SHADOWS.md as mode goes vanilla → spicy
  const shadowOpacity = useDerivedValue(() =>
    interpolate(
      modeProgress.value,
      [0, 1],
      [SHADOWS.sm.shadowOpacity, SHADOWS.md.shadowOpacity],
    ),
  )

  const shadowRadius = useDerivedValue(() =>
    interpolate(
      modeProgress.value,
      [0, 1],
      [SHADOWS.sm.shadowRadius, SHADOWS.md.shadowRadius],
    ),
  )

  return {
    modeProgress,
    toggleMode,
    animatedColors: {
      background,
      surface,
      surfaceElevated,
      border,
      accent,
      accentLight,
      text,
      textSecondary,
      shadowOpacity,
      shadowRadius,
    },
  }
}
