'use client'

import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()

  const handleStartAuth = () => {
    router.push('/auth/bankid')
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
          onClick={handleStartAuth}
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
        Du verifieras via BankID för att säkerställa att du är över 18 år
      </p>
    </div>
  )
}
