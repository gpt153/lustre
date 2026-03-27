'use client'

import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Card from '@/components/common/Card'
import { addToast } from '@/lib/toast-store'
import { login, devLogin } from '@/lib/auth'
import { useAuthStore } from '@/lib/stores'
import styles from './page.module.css'

// ──────────────────────────────────────────────────────────────
// OAuth brand icons
// ──────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M17.64 9.2045C17.64 8.5664 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.2045Z"
        fill="#4285F4"
      />
      <path
        d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.96409 10.71C3.78409 10.17 3.68182 9.5932 3.68182 9C3.68182 8.4068 3.78409 7.83 3.96409 7.29V4.9582H0.957275C0.347727 6.1732 0 7.5477 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
        fill="#EA4335"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <path d="M14.2346 9.5517C14.2246 7.9617 14.9446 6.7617 16.3946 5.8917C15.5746 4.7217 14.3246 4.0717 12.6946 3.9517C11.1546 3.8317 9.4646 4.8217 8.8846 4.8217C8.2746 4.8217 6.7946 3.9917 5.6246 3.9917C3.2146 4.0317 0.664597 5.9317 0.664597 9.8017C0.664597 10.9417 0.874597 12.1217 1.2946 13.3417C1.8546 14.9617 3.8746 18.9417 5.9746 18.8817C7.0546 18.8517 7.8246 18.1317 9.2346 18.1317C10.5946 18.1317 11.3146 18.8817 12.5146 18.8817C14.6346 18.8517 16.4646 15.2217 16.9946 13.5917C14.0546 12.2117 14.2346 9.6317 14.2346 9.5517ZM11.7846 2.5817C12.9746 1.1617 12.8546 -0.118301 12.8246 -0.558301C11.7646 -0.498301 10.5346 0.141699 9.8346 0.931699C9.0646 1.7817 8.6146 2.8217 8.7046 3.9317C9.8546 4.0217 10.8946 3.5217 11.7846 2.5817Z" />
    </svg>
  )
}

// ──────────────────────────────────────────────────────────────
// Page component
// ──────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDevLoading, setIsDevLoading] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const isDev = process.env.NODE_ENV === 'development'

  // Rehydrate store on mount
  useEffect(() => {
    useAuthStore.persist.rehydrate()
  }, [])

  function validate(): boolean {
    let ok = true
    if (!email.trim()) { setEmailError(true); ok = false } else { setEmailError(false) }
    if (!password) { setPasswordError(true); ok = false } else { setPasswordError(false) }
    return ok
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    const result = await login(email.trim(), password)
    setIsLoading(false)

    if (result.success) {
      router.push('/discover')
    } else {
      addToast(result.error ?? 'Inloggning misslyckades.', 'error')
      setPasswordError(true)
    }
  }

  async function handleDevLogin() {
    setIsDevLoading(true)
    const result = await devLogin()
    setIsDevLoading(false)

    if (result.success) {
      router.push('/discover')
    } else {
      addToast(result.error ?? 'Dev-inloggning misslyckades.', 'error')
    }
  }

  function handleGoogleLogin() {
    window.location.href = '/api/auth/google'
  }

  function handleAppleLogin() {
    window.location.href = '/api/auth/apple'
  }

  return (
    <div className={styles.container}>
      {/* Logo */}
      <div className={styles.logoWrap} aria-label="Lustre">
        <span className={styles.logo}>Lustre</span>
        <p className={styles.tagline}>Din dejting, på dina villkor</p>
      </div>

      {/* Login card */}
      <Card className={styles.card}>
        <h1 className={styles.heading}>Logga in</h1>

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
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordError(false) }}
            error={passwordError}
            errorMessage={passwordError ? 'Kontrollera ditt lösenord.' : undefined}
            autoComplete="current-password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoading}
            disabled={isDevLoading}
          >
            Logga in
          </Button>

          {isDev && (
            <Button
              type="button"
              variant="ghost"
              fullWidth
              loading={isDevLoading}
              disabled={isLoading}
              onClick={handleDevLogin}
              className={styles.devButton}
            >
              Dev Login (admin)
            </Button>
          )}
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerText}>eller fortsätt med</span>
        </div>

        {/* OAuth buttons */}
        <div className={styles.oauthGroup}>
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={handleGoogleLogin}
            className={styles.oauthButton}
          >
            <GoogleIcon />
            <span>Fortsätt med Google</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={handleAppleLogin}
            className={styles.oauthButton}
          >
            <AppleIcon />
            <span>Fortsätt med Apple</span>
          </Button>
        </div>

        <p className={styles.registerLink}>
          Inget konto?{' '}
          <Link href="/register" className={styles.link}>
            Skapa konto
          </Link>
        </p>
      </Card>
    </div>
  )
}
