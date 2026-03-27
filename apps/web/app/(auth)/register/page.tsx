'use client'

import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Card from '@/components/common/Card'
import { addToast } from '@/lib/toast-store'
import { login } from '@/lib/auth'
import { api as _api } from '@/lib/trpc'
import { useAuthStore } from '@/lib/stores'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any
import styles from './page.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [confirmError, setConfirmError] = useState(false)
  const [termsError, setTermsError] = useState(false)

  // Rehydrate store on mount
  useEffect(() => {
    useAuthStore.persist.rehydrate()
  }, [])

  function validate(): boolean {
    let ok = true

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!emailValid) { setEmailError(true); ok = false } else { setEmailError(false) }

    if (password.length < 8) { setPasswordError(true); ok = false } else { setPasswordError(false) }

    if (password !== confirmPassword) { setConfirmError(true); ok = false } else { setConfirmError(false) }

    if (!termsAccepted) { setTermsError(true); ok = false } else { setTermsError(false) }

    return ok
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    try {
      // Register the account
      await api.auth.register.mutate({
        email: email.trim(),
        password,
      })

      // Auto-login after successful registration
      const loginResult = await login(email.trim(), password)

      if (loginResult.success) {
        addToast('Välkommen till Lustre!', 'success')
        router.push('/discover')
      } else {
        // Registration succeeded but login failed — redirect to login
        addToast('Kontot skapat! Logga in för att fortsätta.', 'info')
        router.push('/login')
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registrering misslyckades. Försök igen.'
      addToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Logo */}
      <div className={styles.logoWrap} aria-label="Lustre">
        <span className={styles.logo}>Lustre</span>
        <p className={styles.tagline}>Skapa ditt konto</p>
      </div>

      {/* Register card */}
      <Card className={styles.card}>
        <h1 className={styles.heading}>Registrera dig</h1>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input
            type="email"
            label="E-postadress"
            placeholder="du@exempel.se"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(false) }}
            error={emailError}
            errorMessage={emailError ? 'Ange en giltig e-postadress.' : undefined}
            autoComplete="email"
            autoCapitalize="off"
            required
          />

          <Input
            type="password"
            label="Lösenord"
            placeholder="Minst 8 tecken"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordError(false) }}
            error={passwordError}
            errorMessage={passwordError ? 'Lösenordet måste vara minst 8 tecken.' : undefined}
            autoComplete="new-password"
            helperText={!passwordError ? 'Minst 8 tecken.' : undefined}
            required
          />

          <Input
            type="password"
            label="Bekräfta lösenord"
            placeholder="Upprepa lösenordet"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(false) }}
            error={confirmError}
            errorMessage={confirmError ? 'Lösenorden matchar inte.' : undefined}
            autoComplete="new-password"
            required
          />

          {/* Terms checkbox */}
          <div className={styles.termsWrap}>
            <label className={`${styles.termsLabel} ${termsError ? styles.termsLabelError : ''}`}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={termsAccepted}
                onChange={(e) => { setTermsAccepted(e.target.checked); setTermsError(false) }}
              />
              <span>
                Jag godkänner{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className={styles.termsLink}>
                  användarvillkoren
                </a>{' '}
                och bekräftar att jag är 18 år eller äldre.
              </span>
            </label>
            {termsError && (
              <p className={styles.termsError} role="alert">
                Du måste godkänna villkoren för att fortsätta.
              </p>
            )}
          </div>

          {/* Swish verification info */}
          <div className={styles.swishInfo}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 7v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="5" r="0.75" fill="currentColor" />
            </svg>
            <p>
              För att aktivera ditt konto krävs en verifieringsbetalning via{' '}
              <strong>Swish</strong> (10 kr engångsavgift). Vi hämtar ditt namn och
              telefonnummer från Swish för att säkerställa ett konto per person.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoading}
          >
            Skapa konto
          </Button>
        </form>

        <p className={styles.loginLink}>
          Har du redan ett konto?{' '}
          <Link href="/login" className={styles.link}>
            Logga in
          </Link>
        </p>
      </Card>
    </div>
  )
}
