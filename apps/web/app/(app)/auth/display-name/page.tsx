'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'

export default function DisplayNamePage() {
  const router = useRouter()
  const { setNeedsDisplayName } = useAuthStore()

  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')

  const setDisplayNameMutation = trpc.user.setDisplayName.useMutation({
    onSuccess: () => {
      setNeedsDisplayName(false)
      router.push('/')
    },
    onError: (err) => {
      setError(
        err.message || 'Kunde inte uppdatera visningsnamn. Försök igen.'
      )
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!displayName.trim()) {
      setError('Visningsnamn är obligatoriskt')
      return
    }

    if (displayName.length < 3) {
      setError('Visningsnamn måste vara minst 3 tecken')
      return
    }

    if (displayName.length > 30) {
      setError('Visningsnamn får inte överskrida 30 tecken')
      return
    }

    setDisplayNameMutation.mutate({ displayName: displayName.trim() })
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
        Välj visningsnamn
      </h2>

      <p
        style={{
          color: '#aaa',
          fontSize: '14px',
          marginBottom: '24px',
          lineHeight: '1.6',
        }}
      >
        Det här är det namn andra användare ser på dina profil
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ditt visningsnamn"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={setDisplayNameMutation.isPending}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '16px',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            border: error ? '2px solid #ff6b6b' : '2px solid #444',
            borderRadius: '8px',
            marginBottom: '12px',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = '#B87333'
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#ff6b6b' : '#444'
          }}
        />

        {displayName && (
          <p
            style={{
              color: '#7C4DFF',
              fontSize: '12px',
              marginBottom: '12px',
              fontWeight: 500,
            }}
          >
            Förhandsgranskning: <strong>{displayName}</strong>
          </p>
        )}

        {error && (
          <p
            style={{
              color: '#ff6b6b',
              fontSize: '12px',
              marginBottom: '12px',
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={
            setDisplayNameMutation.isPending ||
            !displayName.trim() ||
            displayName.length < 3
          }
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 600,
            color: '#fff',
            backgroundColor:
              setDisplayNameMutation.isPending ||
              !displayName.trim() ||
              displayName.length < 3
                ? '#666'
                : '#B87333',
            border: 'none',
            borderRadius: '8px',
            cursor:
              setDisplayNameMutation.isPending ||
              !displayName.trim() ||
              displayName.length < 3
                ? 'not-allowed'
                : 'pointer',
            transition: 'background-color 0.2s',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            if (
              !setDisplayNameMutation.isPending &&
              displayName.trim() &&
              displayName.length >= 3
            ) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                '#A85D2C'
            }
          }}
          onMouseLeave={(e) => {
            if (
              !setDisplayNameMutation.isPending &&
              displayName.trim() &&
              displayName.length >= 3
            ) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                '#B87333'
            }
          }}
        >
          {setDisplayNameMutation.isPending
            ? 'Sparar...'
            : 'Spara visningsnamn'}
        </button>

        {setDisplayNameMutation.error && (
          <p
            style={{
              color: '#ff6b6b',
              fontSize: '12px',
              marginTop: '12px',
            }}
          >
            {setDisplayNameMutation.error.message}
          </p>
        )}
      </form>
    </div>
  )
}
