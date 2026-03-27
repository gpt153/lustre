'use client'

import { useMemo } from 'react'
import styles from './ParticleBurst.module.css'

interface ParticleBurstProps {
  active: boolean
  count?: number
}

interface Particle {
  id: number
  dx: number
  dy: number
  size: number
  color: 'copper' | 'gold' | 'copperLight' | 'goldLight'
  delay: number
  duration: number
}

const COLORS = ['copper', 'gold', 'copperLight', 'goldLight'] as const

export default function ParticleBurst({ active, count = 28 }: ParticleBurstProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8
      const distance = 80 + Math.random() * 120
      return {
        id: i,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        size: 6 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 120,
        duration: 700 + Math.random() * 200,
      }
    })
  }, [count])

  if (!active) return null

  return (
    <div className={styles.container} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`${styles.particle} ${styles[p.color]}`}
          style={
            {
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}ms`,
              animationDuration: `${p.duration}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
