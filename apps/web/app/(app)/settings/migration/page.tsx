'use client'

import { useState } from 'react'
import styles from './page.module.css'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import Input from '@/components/common/Input'
import { addToast } from '@/lib/toast-store'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

type Step = 1 | 2 | 3

interface PreviewData {
  username: string
  bio: string
  photoUrls: string[]
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M5 14l6 6L23 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const STEPS = [
  { n: 1, label: 'Sök' },
  { n: 2, label: 'Granska' },
  { n: 3, label: 'Importera' },
]

export default function MigrationSettingsPage() {
  const [step, setStep] = useState<Step>(1)
  const [username, setUsername] = useState('')
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [consent, setConsent] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [importing, setImporting] = useState(false)

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) return
    setPreviewing(true)
    try {
      const data = await api.migration.previewBodyContact.query({ username })
      if (data) {
        setPreview(data as PreviewData)
        setStep(2)
      }
    } catch {
      addToast('Kunde inte hämta profil från BodyContact', 'error')
    } finally {
      setPreviewing(false)
    }
  }

  async function handleStartImport() {
    if (!consent || !preview) return
    setStep(3)
    setProgress(10)
    setImporting(true)

    // Simulate progress increments
    const tick = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(tick)
          return 90
        }
        return p + 15
      })
    }, 600)

    try {
      await api.migration.importBodyContact.mutate({ username: preview.username, consent: true })
      setProgress(100)
      setTimeout(() => {
        setDone(true)
      }, 400)
    } catch {
      clearInterval(tick)
      addToast('Import misslyckades', 'error')
    } finally {
      setImporting(false)
    }
  }

  function handleReset() {
    setStep(1)
    setUsername('')
    setPreview(null)
    setConsent(false)
    setProgress(0)
    setDone(false)
  }

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.pageTitle}>Migration</h1>
        <p className={styles.pageSubtitle}>
          Importera din profil från BodyContact för att snabbt komma igång.
        </p>
      </div>

      <Card header={<span className={styles.sectionTitle}>Importera från BodyContact</span>}>
        {/* Step indicator */}
        <div className={styles.stepIndicator} aria-label="Steg i importprocessen">
          {STEPS.map((s) => (
            <div key={s.n} className={styles.step}>
              <div
                className={[
                  styles.stepDot,
                  step === s.n ? styles.stepDotActive : '',
                  step > s.n ? styles.stepDotDone : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-current={step === s.n ? 'step' : undefined}
              >
                {step > s.n ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l2.5 2.5 5.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  s.n
                )}
              </div>
              <span
                className={[
                  styles.stepLabel,
                  step === s.n ? styles.stepLabelActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: username search */}
        {step === 1 && (
          <form onSubmit={handlePreview}>
            <div className={styles.searchRow}>
              <div className={styles.searchInput}>
                <Input
                  label="BodyContact-användarnamn"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ditt_användarnamn"
                  autoComplete="off"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                loading={previewing}
                disabled={!username.trim()}
              >
                Förhandsgranska
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: preview */}
        {step === 2 && preview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div className={styles.previewCard}>
              <div className={styles.previewBio}>
                <p className={styles.previewUsername}>{preview.username}</p>
                <p className={styles.previewBioText}>
                  {preview.bio || 'Ingen bio funnen'}
                </p>
                <span className={styles.previewPhotoCount}>
                  {preview.photoUrls.length} foto{preview.photoUrls.length !== 1 ? 'n' : ''} hittad{preview.photoUrls.length !== 1 ? '' : ''}
                </span>
              </div>
              {preview.photoUrls.length > 0 && (
                <div className={styles.previewPhotos}>
                  {preview.photoUrls.slice(0, 4).map((url, i) => (
                    <div key={i} className={styles.previewPhotoThumb} aria-label={`Foto ${i + 1}`}>
                      {i + 1}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label className={styles.consentRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                aria-describedby="consent-description"
              />
              <span id="consent-description" className={styles.consentText}>
                Jag bekräftar att jag äger denna profil på BodyContact och godkänner
                att bio och foton importeras till mitt Lustre-konto.
              </span>
            </label>

            <div className={styles.actions}>
              <Button variant="ghost" onClick={() => setStep(1)}>
                Tillbaka
              </Button>
              <Button
                variant="primary"
                disabled={!consent}
                loading={importing}
                onClick={handleStartImport}
              >
                Importera
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: importing / done */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            {done ? (
              <div className={styles.successState}>
                <div className={styles.successIcon}>
                  <CheckIcon />
                </div>
                <h2 className={styles.successTitle}>Import klar!</h2>
                <p className={styles.successText}>
                  Din profil från BodyContact har importerats till Lustre.
                </p>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Importera en annan profil
                </Button>
              </div>
            ) : (
              <div className={styles.progressWrapper}>
                <div className={styles.progressLabel}>
                  <span>Importerar profil…</span>
                  <span>{progress}%</span>
                </div>
                <div className={styles.progressTrack} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
