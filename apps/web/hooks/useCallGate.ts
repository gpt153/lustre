'use client'

import { useState, useCallback } from 'react'

export function useCallGate() {
  const [isCallGateOpen, setIsCallGateOpen] = useState(false)

  const openCallGate = useCallback(() => {
    setIsCallGateOpen(true)
  }, [])

  const closeCallGate = useCallback(() => {
    setIsCallGateOpen(false)
  }, [])

  return {
    isCallGateOpen,
    openCallGate,
    closeCallGate,
  }
}
