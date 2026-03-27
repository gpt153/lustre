'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'
import { Input } from '@/components/common/Input'
import { AuthCard } from '@/components/auth/AuthCard'
import styles from '@/components/auth/AuthCard.module.css'

type Step = 1 | 2 | 3 | 4
const TOTAL_STEPS = 4

const stepTitles: Record<Step, string> = {
  1: 'Skapa konto',
  2: 'Din profil',
  3: 'Ladda upp foto',
  4: 'Dina preferenser',
}

const stepDescriptions: Record<Step, string> = {
  1: 'Ange din e-postadress och välj ett lösenord.',
  2: 'Berätta lite om dig själv.',
  3: 'Lägg till ett profilfoto för att öka dina chanser.',
  4: 'Vad letar du efter? Vi hjälper dig hitta rätt.',
}

interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  displayName: string
  birthYear: string
  gender: string
  seeking: string
  photoFile: File | null
  inviteCode: string
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthCard title="Skapa konto"><div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Laddar...</div></AuthCard>}>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accessToken = useAuthStore((state) => state.accessToken)
  const setTokens = useAuthStore((state) => state.setTokens)

  const [step, setStep] = useState<Step>(1)
  const [error, setError] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [form, setForm] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    birthYear: '',
    gender: '',
    seeking: '',
    photoFile: null,
    inviteCode: searchParams.get('invite') ?? '',
  })

  useEffect(() => {
    if (accessToken) {
      router.replace('/discover')
    }
  }, [accessToken, router])

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken)
      router.replace('/discover')
    },
    onError: (err) => setError(err.message),
  })

  const updateForm = (field: keyof RegisterFormData, value: string | File | null) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!form.email) return 'E-postadress krävs'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Ogiltig e-postadress'
      if (!form.password) return 'Lösenord krävs'
      if (form.password.length < 8) return 'Lösenordet måste vara minst 8 tecken'
      if (form.password !== form.confirmPassword) return 'Lösenorden matchar inte'
    }
    if (step === 2) {
      if (!form.displayName.trim()) return 'Visningsnamn krävs'
      if (form.displayName.trim().length < 2) return 'Visningsnamnet är för kort'
      if (!form.birthYear) return 'Födelseår krävs'
      const year = parseInt(form.birthYear, 10)
      const currentYear = new Date().getFullYear()
      if (isNaN(year) || year < currentYear - 100 || year > currentYear - 18) {
        return 'Du måste vara minst 18 år för att registrera dig'
      }
      if (!form.gender) return 'Kön krävs'
    }
    return null
  }

  const handleNext = () => {
    const validationError = validateStep()
    if (validationError) {
      setError(validationError)
      return
    }
    if (step < TOTAL_STEPS) {
      setStep((prev) => (prev + 1) as Step)
      setError(null)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step)
      setError(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    registerMutation.mutate({
      email: form.email,
      password: form.password,
      displayName: form.displayName,
      birthYear: parseInt(form.birthYear, 10),
      gender: form.gender,
      seeking: form.seeking || undefined,
      inviteCode: form.inviteCode || undefined,
    })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Välj en bildfil (JPG, PNG, WebP)')
      return
    }
    updateForm('photoFile', file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const stepProgress = Array.from({ length: TOTAL_STEPS }, (_, i) => {
    if (i + 1 < step) return 'complete'
    if (i + 1 === step) return 'active'
    return 'pending'
  })

  return (
    <AuthCard title={stepTitles[step]}>
      {/* Step indicator */}
      <div className={styles.stepIndicator} role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label={`Steg ${step} av ${TOTAL_STEPS}`}>
        {stepProgress.map((status, i) => (
          <div
            key={i}
            className={[
              styles.step,
              status === 'complete' ? styles.stepComplete : '',
              status === 'active' ? styles.stepActive : '',
            ].filter(Boolean).join(' ')}
          />
        ))}
      </div>

      <div className={styles.stepHeader}>
        <p className={styles.stepDescription}>{stepDescriptions[step]}</p>
      </div>

      <form onSubmit={step === TOTAL_STEPS ? handleSubmit : (e) => { e.preventDefault(); handleNext() }} noValidate>
        {/* ─ Step 1: Email & password ─ */}
        {step === 1 && (
          <div className={styles.form}>
            <Input
              label="E-postadress"
              type="email"
              value={form.email}
              onChange={(v) => updateForm('email', v)}
              placeholder="din@email.se"
            />
            <Input
              label="Lösenord"
              type="password"
              value={form.password}
              onChange={(v) => updateForm('password', v)}
              placeholder="Minst 8 tecken"
            />
            <Input
              label="Bekräfta lösenord"
              type="password"
              value={form.confirmPassword}
              onChange={(v) => updateForm('confirmPassword', v)}
              placeholder="Upprepa lösenordet"
            />
          </div>
        )}

        {/* ─ Step 2: Profile basics ─ */}
        {step === 2 && (
          <div className={styles.form}>
            <Input
              label="Visningsnamn"
              value={form.displayName}
              onChange={(v) => updateForm('displayName', v)}
              placeholder="Vad ska folk se?"
            />
            <Input
              label="Födelseår"
              type="number"
              value={form.birthYear}
              onChange={(v) => updateForm('birthYear', v)}
              placeholder={`t.ex. ${new Date().getFullYear() - 25}`}
            />
            <div>
              <label htmlFor="gender-select" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px', fontFamily: 'var(--font-body)' }}>
                Kön
              </label>
              <select
                id="gender-select"
                value={form.gender}
                onChange={(e) => updateForm('gender', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-medium)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">Välj kön...</option>
                <option value="MAN">Man</option>
                <option value="WOMAN">Kvinna</option>
                <option value="NON_BINARY">Icke-binär</option>
                <option value="TRANS_MAN">Transman</option>
                <option value="TRANS_WOMAN">Transkvinna</option>
                <option value="GENDERQUEER">Genderqueer</option>
                <option value="GENDERFLUID">Genderfluid</option>
                <option value="AGENDER">Agender</option>
                <option value="OTHER">Annat</option>
                <option value="PREFER_NOT_TO_SAY">Föredrar att inte säga</option>
              </select>
            </div>
          </div>
        )}

        {/* ─ Step 3: Photo upload ─ */}
        {step === 3 && (
          <div className={styles.form}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)' }}>
              {photoPreview ? (
                <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                  <img
                    src={photoPreview}
                    alt="Förhandsgranskning av profilfoto"
                    style={{
                      width: '140px',
                      height: '140px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--color-copper)',
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    border: '2px dashed var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(184, 115, 51, 0.04)',
                    color: 'var(--text-muted)',
                  }}
                  aria-hidden="true"
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}

              <label
                htmlFor="photo-upload"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--border-medium)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {photoPreview ? 'Byt foto' : 'Välj foto'}
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}
                aria-label="Ladda upp profilfoto"
              />

              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.5' }}>
                Profiler med foto får upp till 10x fler matchningar.
                Du kan hoppa över detta och lägga till foto senare.
              </p>
            </div>
          </div>
        )}

        {/* ─ Step 4: Preferences ─ */}
        {step === 4 && (
          <div className={styles.form}>
            <div>
              <label htmlFor="seeking-select" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px', fontFamily: 'var(--font-body)' }}>
                Vad letar du efter?
              </label>
              <select
                id="seeking-select"
                value={form.seeking}
                onChange={(e) => updateForm('seeking', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-medium)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">Välj vad du söker...</option>
                <option value="DATING">Dejting</option>
                <option value="RELATIONSHIP">Relation</option>
                <option value="FRIENDSHIP">Vänskap</option>
                <option value="CASUAL">Casual</option>
                <option value="NETWORKING">Nätverkande</option>
                <option value="EXPLORATION">Utforskning</option>
                <option value="OPEN">Öppen för allt</option>
              </select>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', padding: 'var(--space-4)', background: 'rgba(184, 115, 51, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              Genom att skapa konto godkänner du våra{' '}
              <Link href="/terms" style={{ color: 'var(--color-copper)' }}>
                villkor
              </Link>{' '}
              och{' '}
              <Link href="/privacy" style={{ color: 'var(--color-copper)' }}>
                integritetspolicy
              </Link>.
              Du måste vara minst 18 år.
            </p>
          </div>
        )}

        {error && (
          <p className={styles.errorMessage} role="alert" style={{ marginTop: 'var(--space-4)' }}>
            {error}
          </p>
        )}

        <div className={styles.stepActions}>
          {step > 1 && (
            <button
              type="button"
              className={styles.backButton}
              onClick={handleBack}
              disabled={registerMutation.isPending}
            >
              Tillbaka
            </button>
          )}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={registerMutation.isPending}
            aria-busy={registerMutation.isPending}
            style={{ flex: 1 }}
          >
            {step === TOTAL_STEPS
              ? registerMutation.isPending
                ? 'Skapar konto...'
                : 'Skapa konto'
              : 'Nästa'}
          </button>
        </div>
      </form>

      {step === 1 && (
        <div className={styles.links}>
          <Link href="/login" className={styles.linkMuted}>
            Har du redan ett konto? <strong>Logga in</strong>
          </Link>
        </div>
      )}
    </AuthCard>
  )
}
