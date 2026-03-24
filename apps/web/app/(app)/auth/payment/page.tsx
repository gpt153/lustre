'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'

export default function PaymentPage() {
  const router = useRouter()
  const { setNeedsPayment } = useAuthStore()

  const [paymentId, setPaymentId] = useState<string | null>(null)

  const createPaymentMutation = trpc.auth.swish.createPayment.useMutation({
    onSuccess: (data) => {
      setPaymentId(data.id)
    },
  })

  const statusQuery = trpc.auth.swish.checkStatus.useQuery(undefined, {
    enabled: !!paymentId,
    refetchInterval: 3000,
  })

  useEffect(() => {
    if (statusQuery.data?.status === 'PAID') {
      setNeedsPayment(false)
      router.push('/auth/display-name')
    }
  }, [statusQuery.data])

  useEffect(() => {
    if (!paymentId) {
      createPaymentMutation.mutate({})
    }
  }, [paymentId])

  const handleOpenSwish = () => {
    if (paymentId) {
      const swishUrl = `swish://payment?token=${paymentId}`
      window.location.href = swishUrl
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#fff',
          margin: '0 0 24px 0',
        }}
      >
        Betala 10 kr med Swish
      </h2>

      <p
        style={{
          color: '#aaa',
          fontSize: '14px',
          marginBottom: '24px',
          lineHeight: '1.6',
        }}
      >
        En liten betalning säkerställer att du är en verklig person
      </p>

      {createPaymentMutation.isPending && (
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #E91E63',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <p
            style={{
              color: '#aaa',
              marginTop: '16px',
              fontSize: '14px',
            }}
          >
            Förbereder betalning...
          </p>
        </div>
      )}

      {paymentId && !statusQuery.data?.status && (
        <>
          <div
            style={{
              marginBottom: '24px',
              padding: '24px',
              backgroundColor: '#1a1a1a',
              borderRadius: '8px',
              border: '2px dashed #666',
            }}
          >
            <p
              style={{
                color: '#666',
                fontSize: '12px',
                margin: '0 0 12px 0',
              }}
            >
              QR-kod för Swish-betalning
            </p>
            <div
              style={{
                width: '200px',
                height: '200px',
                backgroundColor: '#333',
                borderRadius: '4px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '12px',
              }}
            >
              [QR Code Placeholder]
            </div>
          </div>

          <button
            onClick={handleOpenSwish}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#fff',
              backgroundColor: '#E91E63',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              width: '100%',
              marginBottom: '12px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                '#c2185b'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                '#E91E63'
            }}
          >
            Öppna Swish
          </button>

          <p
            style={{
              color: '#666',
              fontSize: '12px',
              margin: '12px 0 0 0',
            }}
          >
            {statusQuery.isFetching
              ? 'Kontrollerar betalning...'
              : 'Väntar på betalning'}
          </p>

          {statusQuery.error && (
            <p
              style={{
                color: '#ff6b6b',
                fontSize: '12px',
                marginTop: '8px',
              }}
            >
              Kunde inte kontrollera betalningsstatus. Försök igen.
            </p>
          )}
        </>
      )}
    </div>
  )
}
