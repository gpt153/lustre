'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'

export default function BankIDPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setTokens, setUser, setNeedsPayment } = useAuthStore()

  const [isOpening, setIsOpening] = useState(true)
  const [bankidUrl, setBankidUrl] = useState<string | null>(null)
  const [authState, setAuthState] = useState<string | null>(null)

  const initMutation = trpc.auth.bankid.init.useMutation()
  const callbackMutation = trpc.auth.bankid.callback.useMutation({
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken)
      setUser(data.user.id, data.user.displayName || null)

      if (data.isNewUser) {
        setNeedsPayment(true)
        router.push('/auth/payment')
      } else {
        if (!data.user.displayName) {
          router.push('/auth/display-name')
        } else {
          router.push('/')
        }
      }
    },
    onError: () => {
      setIsOpening(false)
    },
  })

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    // If we have code and state from callback, verify immediately
    if (code && state) {
      callbackMutation.mutate({ code, state })
      return
    }

    // If we've already opened BankID and no code has returned, show "verified" button
    if (bankidUrl && !code) {
      setIsOpening(false)
      return
    }

    // Initial load - open BankID
    if (!bankidUrl && !code) {
      initMutation.mutate(undefined, {
        onSuccess: (data) => {
          setBankidUrl(data.authUrl)
          setAuthState(data.state)
          window.open(data.authUrl, '_blank')
          setIsOpening(false)
        },
      })
    }
  }, [searchParams, bankidUrl, authState, callbackMutation, initMutation])

  const handleVerified = () => {
    // User clicked "I've verified with BankID"
    // In a real scenario, we'd either:
    // 1. Check if the redirect from BankID included code in the URL
    // 2. Or let the user manually paste the verification code
    // For now, just wait for the automatic callback
    if (searchParams.get('code')) {
      const code = searchParams.get('code')
      const state = searchParams.get('state') || authState
      if (code && state) {
        callbackMutation.mutate({ code, state })
      }
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
        BankID-verifiering
      </h2>

      {isOpening && (
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
            Öppnar BankID...
          </p>
        </div>
      )}

      {!isOpening && bankidUrl && !callbackMutation.isPending && (
        <>
          <p
            style={{
              color: '#aaa',
              fontSize: '14px',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}
          >
            BankID har öppnats i en ny flik. Verifiera dig och klicka sedan
            knappen nedan.
          </p>

          <button
            onClick={handleVerified}
            disabled={callbackMutation.isPending}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#fff',
              backgroundColor: callbackMutation.isPending ? '#666' : '#E91E63',
              border: 'none',
              borderRadius: '8px',
              cursor: callbackMutation.isPending ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              if (!callbackMutation.isPending) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  '#c2185b'
              }
            }}
            onMouseLeave={(e) => {
              if (!callbackMutation.isPending) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  '#E91E63'
              }
            }}
          >
            {callbackMutation.isPending
              ? 'Verifierar...'
              : 'Jag har verifierat med BankID'}
          </button>

          {callbackMutation.error && (
            <p
              style={{
                color: '#ff6b6b',
                fontSize: '12px',
                marginTop: '12px',
              }}
            >
              Verifiering misslyckades. Försök igen.
            </p>
          )}
        </>
      )}

      {callbackMutation.isPending && (
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
          <p
            style={{
              color: '#aaa',
              marginTop: '16px',
              fontSize: '14px',
            }}
          >
            Verifierar...
          </p>
        </div>
      )}
    </div>
  )
}
