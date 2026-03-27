/**
 * ModeTransition — Context provider wrapper
 *
 * Provides two contexts to the entire app:
 *
 *   ModeTransformContext  — animated colors + modeProgress shared value
 *   AnimationSpeedContext — speed multiplier (vanilla 1.0, spicy 0.77)
 *
 * Place this once in _layout.tsx, outside AuthGate so it covers all routes.
 */

import React, { createContext, useContext } from 'react'
import type { SharedValue, DerivedValue } from 'react-native-reanimated'
import { useModeStore } from '@lustre/app/src/stores/modeStore'
import { useModeTransform } from '@/hooks/useModeTransform'
import type { AnimatedColors } from '@/hooks/useModeTransform'

// ---------------------------------------------------------------------------
// ModeTransformContext
// ---------------------------------------------------------------------------

interface ModeTransformContextValue {
  modeProgress: SharedValue<number>
  toggleMode: (toSpicy: boolean) => void
  animatedColors: AnimatedColors
}

const ModeTransformContext = createContext<ModeTransformContextValue | null>(null)

export function useModeTransformContext(): ModeTransformContextValue {
  const ctx = useContext(ModeTransformContext)
  if (!ctx) {
    throw new Error('useModeTransformContext must be used within ModeTransition')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// AnimationSpeedContext
// ---------------------------------------------------------------------------

/**
 * Speed multiplier for all timed animations.
 * vanilla = 1.0x baseline, spicy = 0.77x (perceived 1.3x faster).
 *
 * Usage:
 *   const speed = useAnimationSpeed()
 *   withTiming(value, { duration: TIMING.medium * speed })
 */
const AnimationSpeedContext = createContext<number>(1.0)

export function useAnimationSpeed(): number {
  return useContext(AnimationSpeedContext)
}

function AnimationSpeedProvider({ children }: { children: React.ReactNode }) {
  const mode = useModeStore((s) => s.mode)
  const speed = mode === 'spicy' ? 0.77 : 1.0
  return (
    <AnimationSpeedContext.Provider value={speed}>
      {children}
    </AnimationSpeedContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// ModeTransformProvider (inner — runs the hook)
// ---------------------------------------------------------------------------

function ModeTransformProvider({ children }: { children: React.ReactNode }) {
  const { modeProgress, toggleMode, animatedColors } = useModeTransform()

  return (
    <ModeTransformContext.Provider value={{ modeProgress, toggleMode, animatedColors }}>
      {children}
    </ModeTransformContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// ModeTransition — the single export consumed by _layout.tsx
// ---------------------------------------------------------------------------

interface ModeTransitionProps {
  children: React.ReactNode
}

export function ModeTransition({ children }: ModeTransitionProps) {
  return (
    <ModeTransformProvider>
      <AnimationSpeedProvider>
        {children}
      </AnimationSpeedProvider>
    </ModeTransformProvider>
  )
}
