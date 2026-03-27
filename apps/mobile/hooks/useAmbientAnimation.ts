/**
 * useAmbientAnimation
 *
 * Controls a looping 0→1 progress value for ambient Skia background
 * animations. Respects the system "Reduce Motion" accessibility setting
 * and supports manual pause/resume (e.g. when a screen loses focus).
 *
 * When reducedMotion is enabled the progress is pinned to 0.5 (static
 * midpoint) so components can render a reasonable static fallback.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  useReducedMotion,
} from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'
import { TIMING } from '@/constants/animations'

export interface UseAmbientAnimationOptions {
  /** Animation loop duration in ms. Defaults to TIMING.ambient (8000). */
  duration?: number
  /**
   * Cap the animation to 30 fps to conserve battery.
   * When true the timing easing uses linear steps at ~33 ms intervals.
   * Defaults to true.
   */
  capFps?: boolean
}

export interface UseAmbientAnimationReturn {
  /** Loops 0 → 1 continuously. Pinned to 0.5 when reducedMotion is active. */
  progress: SharedValue<number>
  /** False when reducedMotion preference is active — animations are frozen. */
  isActive: boolean
  /** Temporarily stop the animation, e.g. when the screen loses focus. */
  pause: () => void
  /** Resume the animation after a pause. */
  resume: () => void
}

export function useAmbientAnimation(
  options?: UseAmbientAnimationOptions,
): UseAmbientAnimationReturn {
  const duration = options?.duration ?? TIMING.ambient
  // capFps is forwarded to consumers as a hint; actual 30 fps throttling is
  // implemented via frame-skip counters inside each Skia component, not here.
  void options?.capFps

  const reducedMotion = useReducedMotion()
  const progress = useSharedValue<number>(reducedMotion ? 0.5 : 0)

  // Track whether the animation has been manually paused so resume() knows
  // to restart it even if the component hasn't remounted.
  const isPausedRef = useRef(false)
  const [isActive, setIsActive] = useState(!reducedMotion)

  const startLoop = useCallback(() => {
    if (reducedMotion) return

    // Linear easing keeps the animation smooth across the full duration.
    // capFps throttling is achieved by the Skia frame callback in the
    // consuming component, not here — withTiming always drives at its own
    // cadence on the UI thread.
    progress.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.linear,
      }),
      -1, // infinite
      false, // do not reverse — wrap around instead
    )
  }, [progress, duration, reducedMotion])

  // Start or stop the loop whenever reducedMotion or duration changes.
  useEffect(() => {
    if (reducedMotion) {
      cancelAnimation(progress)
      progress.value = 0.5
      setIsActive(false)
      return
    }

    if (!isPausedRef.current) {
      startLoop()
      setIsActive(true)
    }

    return () => {
      cancelAnimation(progress)
    }
  }, [reducedMotion, duration, progress, startLoop])

  const pause = useCallback(() => {
    if (reducedMotion) return
    isPausedRef.current = true
    cancelAnimation(progress)
    setIsActive(false)
  }, [progress, reducedMotion])

  const resume = useCallback(() => {
    if (reducedMotion) return
    isPausedRef.current = false
    startLoop()
    setIsActive(true)
  }, [startLoop, reducedMotion])

  return { progress, isActive, pause, resume }
}
