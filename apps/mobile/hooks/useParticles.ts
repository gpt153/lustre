/**
 * useParticles
 *
 * Particle physics hook for the Match Ceremony burst effect.
 * Creates a burst of particles from a center point and simulates
 * per-frame physics: gravity, air resistance, opacity fade.
 *
 * All state lives in a ref array — we trigger a single re-render
 * via a frame counter so Skia reads fresh values each frame.
 */

import { useCallback, useRef, useState } from 'react'

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  /** radius in pixels, 2-6 */
  size: number
  /** copper '#B87333' or gold '#D4A843' */
  color: string
  /** 0.0 – 1.0, decreases over lifetime */
  opacity: number
  /** total lifespan in seconds */
  lifetime: number
  /** seconds elapsed since birth */
  elapsed: number
}

const COPPER = '#B87333'
const GOLD = '#D4A843'

function createBurst(
  cx: number,
  cy: number,
  count: number,
): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 150 + Math.random() * 200 // 150-350 px/s
    return {
      x: cx,
      y: cy,
      vx: (Math.cos(angle) * speed) / 60, // per-frame at 60fps
      vy: (Math.sin(angle) * speed) / 60,
      size: 2 + Math.random() * 4, // 2-6 px
      color: Math.random() > 0.5 ? COPPER : GOLD,
      opacity: 1,
      lifetime: 1.5 + Math.random() * 1.5, // 1.5-3s
      elapsed: 0,
    }
  })
}

interface UseParticlesOptions {
  count: number
}

interface UseParticlesReturn {
  particles: Particle[]
  startBurst: (cx: number, cy: number) => void
  stopBurst: () => void
  stepFrame: () => void
  isActive: boolean
}

export function useParticles({ count }: UseParticlesOptions): UseParticlesReturn {
  const particlesRef = useRef<Particle[]>([])
  const [isActive, setIsActive] = useState(false)
  // Exposed so SkiaParticles can read current particles synchronously
  const [, forceUpdate] = useState(0)

  const startBurst = useCallback(
    (cx: number, cy: number) => {
      particlesRef.current = createBurst(cx, cy, count)
      setIsActive(true)
    },
    [count],
  )

  const stopBurst = useCallback(() => {
    particlesRef.current = []
    setIsActive(false)
  }, [])

  /**
   * stepFrame — called by useFrameCallback on each GPU frame.
   * Mutates particle positions in place; does NOT setState to avoid
   * scheduling React renders. The Canvas reads particlesRef.current directly.
   */
  const stepFrame = useCallback(() => {
    const ps = particlesRef.current
    if (ps.length === 0) return

    let allDead = true
    for (const p of ps) {
      if (p.opacity <= 0) continue
      allDead = false

      p.x += p.vx
      p.y += p.vy
      p.vy += 0.5 // gravity (px/frame²)
      p.vx *= 0.98 // air resistance
      p.vy *= 0.98
      p.elapsed += 1 / 60
      p.opacity = Math.max(0, 1 - p.elapsed / p.lifetime)
    }

    if (allDead) {
      particlesRef.current = []
      setIsActive(false)
    }

    // Bump render counter so Skia Canvas re-renders with fresh particle data
    forceUpdate((n) => n + 1)
  }, [])

  return {
    particles: particlesRef.current,
    startBurst,
    stopBurst,
    stepFrame,
    isActive,
  }
}
