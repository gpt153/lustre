import { ReactNode } from 'react'
import { useModeStore } from '../stores/modeStore'

interface ModeWrapperProps {
  mode: 'vanilla' | 'spicy'
  children: ReactNode
  fallback?: ReactNode
}

export function ModeWrapper({ mode, children, fallback = null }: ModeWrapperProps) {
  const currentMode = useModeStore((state) => state.mode)
  return currentMode === mode ? <>{children}</> : <>{fallback}</>
}
