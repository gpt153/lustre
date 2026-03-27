/**
 * useStoryNavigation
 *
 * Manages segment index state for the story-format profile card.
 * Provides next/prev navigation functions and an optional auto-advance
 * timer that can be paused/resumed.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseStoryNavigationOptions {
  segmentCount: number
  /** Auto-advance interval in ms. Pass 0 or omit to disable. */
  autoAdvanceMs?: number
  onComplete?: () => void
}

export interface StoryNavigationState {
  currentIndex: number
  next: () => void
  prev: () => void
  goTo: (index: number) => void
  pauseTimer: () => void
  resumeTimer: () => void
  isComplete: boolean
}

export function useStoryNavigation({
  segmentCount,
  autoAdvanceMs = 0,
  onComplete,
}: UseStoryNavigationOptions): StoryNavigationState {
  const [currentIndex, setCurrentIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPausedRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const next = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1
      if (nextIndex >= segmentCount) {
        onComplete?.()
        return prev
      }
      return nextIndex
    })
  }, [segmentCount, onComplete])

  const prev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, segmentCount - 1))
      setCurrentIndex(clamped)
    },
    [segmentCount],
  )

  const pauseTimer = useCallback(() => {
    isPausedRef.current = true
    clearTimer()
  }, [clearTimer])

  const resumeTimer = useCallback(() => {
    isPausedRef.current = false
  }, [])

  // Auto-advance logic
  useEffect(() => {
    if (autoAdvanceMs <= 0 || isPausedRef.current) return
    clearTimer()
    timerRef.current = setTimeout(() => {
      next()
    }, autoAdvanceMs)
    return clearTimer
  }, [currentIndex, autoAdvanceMs, next, clearTimer])

  return {
    currentIndex,
    next,
    prev,
    goTo,
    pauseTimer,
    resumeTimer,
    isComplete: currentIndex >= segmentCount - 1,
  }
}
