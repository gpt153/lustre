'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@lustre/api'
import { Input } from '@/components/common/Input'
import { AuthCard } from '@/components/auth/AuthCard'
import styles from '@/components/auth/AuthCard.module.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const resetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => setError(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email) {
      setError('Ange din e-postadress')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ange en giltig e-postadress')
      return
    }
    resetMutation.mutate({ email })
  }

  if (submitted) {
    return (
      <AuthCard
        title="Kolla din e-post"
        subtitle="Vi har skickat instruktioner till dig"
      >
        <div className={styles.successIcon} aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-copper)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <p className={styles.successText}>
          Om e-postadressen <strong>{email}</strong> finns i vårt system har
          vi skickat en länk för att återställa ditt lösenord.
          Kolla även din skräppost.
        </p>

        <div className={styles.links}>
          <Link href="/login" className={styles.link}>
            Tillbaka till inloggning
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Glömt lösenord?"
      subtitle="Ange din e-postadress så skickar vi en återställningslänk."
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="E-postadress"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="din@email.se"
          disabled={resetMutation.isPending}
        />

        {error && (
          <p className={styles.errorMessage} role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={resetMutation.isPending}
          aria-busy={resetMutation.isPending}
        >
          {resetMutation.isPending ? 'Skickar...' : 'Skicka återställningslänk'}
        </button>
      </form>

      <div className={styles.links}>
        <Link href="/login" className={styles.linkMuted}>
          Kom ihåg lösenordet? <strong>Logga in</strong>
        </Link>
      </div>
    </AuthCard>
  )
}
