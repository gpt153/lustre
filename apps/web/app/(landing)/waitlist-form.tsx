'use client'

import { useState, FormEvent } from 'react'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [position, setPosition] = useState<number | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || status === 'loading') return

    setStatus('loading')

    // For now, simulate the waitlist signup
    // TODO: Replace with actual API endpoint
    await new Promise(resolve => setTimeout(resolve, 800))
    setPosition(Math.floor(Math.random() * 400) + 100)
    setStatus('success')
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
