'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@lustre/app'

export default function AuthPage() {
  const router = useRouter()
  const { setTokens, setUser } = useAuthStore()

  const handleStartAuth = () => {
    router.push('/register')
  }

  const handleDevLogin = async () => {
    const res = await fetch('/api/dev-login', {
      method: 'POST',
    })
    const data = await res.json()
    setTokens(data.accessToken, data.refreshToken)
    setUser(data.user.id, data.user.displayName)
    router.push('/home')
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1
        style={{
          fontSize: '48px',
          fontWeight: 700,
          color: '#E91E63',
          margin: '0 0 16px 0',
        }}
      >
        Lustre
      </h1>

      <p
        style={{
          fontSize: '16px',
          color: '#aaa',
          margin: '0 0 48px 0',
          lineHeight: '1.5',
        }}
      >
        En könspositivt socialt nätverk för vuxna
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={handleStartAuth}
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
          Skapa konto
        </button>

        <button
          onClick={() => router.push('/login')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 600,
            color: '#fff',
            backgroundColor: '#7C4DFF',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              '#6a3cde'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              '#7C4DFF'
          }}
        >
          Logga in
        </button>
      </div>

      <p
        style={{
          fontSize: '12px',
          color: '#666',
          margin: '32px 0 0 0',
          lineHeight: '1.6',
        }}
      >
        Du verifieras via Swish för att säkerställa att du är över 18 år
      </p>

      {process.env.NODE_ENV !== 'production' && (
        <button
          onClick={handleDevLogin}
          style={{
            marginTop: '32px',
            padding: '8px 16px',
            fontSize: '12px',
            color: '#888',
            backgroundColor: 'transparent',
            border: '1px dashed #444',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Dev login
        </button>
      )}
    </div>
  )
}
