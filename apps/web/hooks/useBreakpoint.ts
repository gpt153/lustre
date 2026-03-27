'use client'
import { useState, useEffect } from 'react'

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide'

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>('desktop')

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 600) setBp('mobile')
      else if (w < 900) setBp('tablet')
      else if (w < 1440) setBp('desktop')
      else setBp('wide')
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return bp
}
