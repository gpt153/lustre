'use client'

import { useState, FormEvent } from 'react'

interface WaitlistFormProps {
  mode?: 'vanilla' | 'spicy'
}

export function WaitlistForm({ mode = 'vanilla' }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [position, setPosition] = useState<number | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || status === 'loading') return

    setStatus('loading')

    try {
      const res = await fetch('https://app.lovelustre.com/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mode }),
      })

      if (!res.ok) throw new Error('Failed')

      const data = await res.json()
      setPosition(data.position)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="email-success">
        <div className="email-success__check">&#10003;</div>
        <div className="email-success__title">Du är med.</div>
        <div className="email-success__text">
          Vi hör av oss när det är dags. Ju fler du bjuder in, desto tidigare får du tillgång.
        </div>
        {position && (
          <span className="email-success__position">
            Plats #{position} i kön
          </span>
        )}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="email-success">
        <div className="email-success__title">Något gick fel.</div>
        <div className="email-success__text">Försök igen om en stund.</div>
        <button className="email-form__button" onClick={() => setStatus('idle')} style={{ marginTop: '1rem' }}>
          Försök igen
        </button>
      </div>
    )
  }

  return (
    <form className="email-form" onSubmit={handleSubmit}>
      <input
        type="email"
        className="email-form__input"
        placeholder="din@email.se"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        autoComplete="email"
        aria-label="E-postadress"
      />
      <button
        type="submit"
        className="email-form__button"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Skickar...' : 'Få tidig tillgång'}
      </button>
    </form>
  )
}
