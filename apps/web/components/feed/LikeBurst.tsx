'use client'

import { useEffect, useRef } from 'react'
import styles from './LikeBurst.module.css'

interface LikeBurstProps {
  x: number
  y: number
  onComplete: () => void
}

const PARTICLE_COUNT = 12

export default function LikeBurst({ x, y, onComplete }: LikeBurstProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(onComplete, 700)
    return () => clearTimeout(timer)
  }, [onComplete])

  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * 360
    const distance = 40 + Math.random() * 40
    const dx = Math.cos((angle * Math.PI) / 180) * distance
    const dy = Math.sin((angle * Math.PI) / 180) * distance
    const size = 4 + Math.random() * 6
    const delay = Math.random() * 80
    const isGold = i % 3 === 0

    return { dx, dy, size, delay, isGold, id: i }
  })

  return (
    <div
      ref={containerRef}
      className={styles.burst}
      style={{ left: x, top: y }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className={styles.particle}
          style={
            {
              width: p.size,
              height: p.size,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              animationDelay: `${p.delay}ms`,
              background: p.isGold
                ? 'var(--color-gold)'
                : 'var(--color-copper)',
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
