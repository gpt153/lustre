'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@lustre/api'

export default function RegisterSwishPage() {
  const router = useRouter()
  const [pollingEnabled, setPollingEnabled] = useState(false)

  const checkStatus = trpc.auth.swish.checkStatus.useQuery(undefined, {
    enabled: pollingEnabled,
    refetchInterval: 2000,
  })

  useEffect(() => {
    if (checkStatus.data?.status === 'PAID') {
      router.push('/register/verifying')
    }
  }, [checkStatus.data, router])

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-2xl font-bold text-primary">Betala med Swish</h1>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          Öppna Swish-appen på din telefon och slutför betalningen på 10 kr till Lustre.
        </p>

        <div className="p-8 border-2 border-dashed border-border rounded-lg">
          <p className="text-4xl">📱</p>
          <p className="text-sm text-muted-foreground mt-2">
            Swish QR-kod / betalningsinstruktioner visas här
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Swish Handel API-integration krävs för QR-generering
          </p>
        </div>

        <button
          onClick={() => setPollingEnabled(true)}
          disabled={pollingEnabled}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50"
        >
          Jag har betalat — vänta på bekräftelse
        </button>

        {pollingEnabled && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Väntar på betalningsbekräftelse...
          </p>
        )}
      </div>
    </div>
  )
}
