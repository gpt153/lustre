/**
 * useConsentCeremony
 *
 * State management for the ConsentCeremony flow.
 *
 * Tracks per-item consent state for both the local user and their partner,
 * derives allConfirmed, and provides a WebSocket integration hook that will
 * wire up to F14 ConsentVault's Phoenix channel when the real-time layer is
 * connected.
 */

import { useState, useCallback, useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConsentItemIcon = 'shield' | 'heart' | 'lock'

export interface ConsentItemDef {
  id: string
  label: string
  icon: ConsentItemIcon
  confirmedByMe: boolean
  confirmedByThem: boolean
}

export interface UseConsentCeremonyOptions {
  /** ID of the partner we are establishing consent with. */
  partnerId: string
  /** Display name of the partner (for "Waiting for …" text). */
  partnerName: string
  /** Called once both parties have confirmed all items. */
  onAllConfirmed?: () => void
}

export interface UseConsentCeremonyReturn {
  items: ConsentItemDef[]
  allConfirmedByMe: boolean
  allConfirmedByThem: boolean
  allConfirmed: boolean
  partnerName: string
  /** Whether the partner has opened the ceremony on their device. */
  partnerPresent: boolean
  /** Toggle a single item for the local user. */
  confirmItem: (id: string, value: boolean) => void
  /** Confirm all items at once (called on final button press). */
  confirmAll: () => void
}

// ---------------------------------------------------------------------------
// Default consent items (Safety / Intimacy / Privacy triad)
// ---------------------------------------------------------------------------

const DEFAULT_ITEMS: Omit<ConsentItemDef, 'confirmedByMe' | 'confirmedByThem'>[] = [
  { id: 'safety', label: 'Vi är trygga med varandra', icon: 'shield' },
  { id: 'intimacy', label: 'Vi respekterar varandras gränser', icon: 'heart' },
  { id: 'privacy', label: 'Det här stannar mellan oss', icon: 'lock' },
]

function buildInitialItems(): ConsentItemDef[] {
  return DEFAULT_ITEMS.map((item) => ({
    ...item,
    confirmedByMe: false,
    confirmedByThem: false,
  }))
}

// ---------------------------------------------------------------------------
// WebSocket event types (mirrors F14 ConsentVault Phoenix channel contract)
// ---------------------------------------------------------------------------

interface ConsentConfirmEvent {
  type: 'consent_item_confirmed'
  itemId: string
  userId: string
}

interface ConsentPresenceEvent {
  type: 'consent_presence'
  userId: string
  present: boolean
}

type ConsentWsEvent = ConsentConfirmEvent | ConsentPresenceEvent

// Placeholder for the WebSocket channel ref — will be replaced by the real
// Phoenix channel subscription once the ConsentVault WS integration lands.
type WsChannelRef = {
  push: (event: string, payload: Record<string, unknown>) => void
  on: (event: string, handler: (payload: ConsentWsEvent) => void) => void
  off: (event: string) => void
} | null

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useConsentCeremony({
  partnerId,
  partnerName,
  onAllConfirmed,
}: UseConsentCeremonyOptions): UseConsentCeremonyReturn {
  const [items, setItems] = useState<ConsentItemDef[]>(buildInitialItems)
  const [partnerPresent, setPartnerPresent] = useState(false)

  // Ref to the WS channel — populated when the real ConsentVault channel is
  // available. Stays null during the UI-only ceremony (no backend hit).
  const channelRef = useRef<WsChannelRef>(null)

  // ---------------------------------------------------------------------------
  // WebSocket integration placeholder
  //
  // When F14's Phoenix channel is wired up, replace the body of this effect:
  //
  //   const channel = phoenixSocket.channel(`consent:${partnerId}`)
  //   channelRef.current = channel
  //   channel.join()
  //   channel.on('consent_item_confirmed', handler)
  //   channel.on('consent_presence', handler)
  //   return () => channel.leave()
  //
  // The handler updates `items` state so Reanimated shared values in
  // ConsentCeremony re-render reactively.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const channel = channelRef.current
    if (!channel) return

    const handleEvent = (payload: ConsentWsEvent) => {
      if (payload.type === 'consent_presence') {
        if (payload.userId === partnerId) {
          setPartnerPresent(payload.present)
        }
        return
      }

      if (payload.type === 'consent_item_confirmed') {
        if (payload.userId === partnerId) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === payload.itemId ? { ...item, confirmedByThem: true } : item,
            ),
          )
        }
      }
    }

    channel.on('consent_item_confirmed', handleEvent)
    channel.on('consent_presence', handleEvent)

    return () => {
      channel.off('consent_item_confirmed')
      channel.off('consent_presence')
    }
  }, [partnerId])

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const allConfirmedByMe = items.every((i) => i.confirmedByMe)
  const allConfirmedByThem = items.every((i) => i.confirmedByThem)
  const allConfirmed = allConfirmedByMe && allConfirmedByThem

  useEffect(() => {
    if (allConfirmed) {
      onAllConfirmed?.()
    }
  }, [allConfirmed, onAllConfirmed])

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const confirmItem = useCallback(
    (id: string, value: boolean) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, confirmedByMe: value } : item)),
      )

      // Emit to WebSocket when channel is available
      channelRef.current?.push('consent_item_confirmed', { itemId: id, confirmed: value })
    },
    [],
  )

  const confirmAll = useCallback(() => {
    setItems((prev) => prev.map((item) => ({ ...item, confirmedByMe: true })))
    channelRef.current?.push('consent_all_confirmed', {})
  }, [])

  return {
    items,
    allConfirmedByMe,
    allConfirmedByThem,
    allConfirmed,
    partnerName,
    partnerPresent,
    confirmItem,
    confirmAll,
  }
}
