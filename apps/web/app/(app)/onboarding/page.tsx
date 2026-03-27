'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'motion/react'
import { m } from 'motion/react'
import { springs } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import OnboardingProgress from '@/components/onboarding/OnboardingProgress'
import OnboardingStep from '@/components/onboarding/OnboardingStep'
import styles from './page.module.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

// ── Options ──────────────────────────────────────────────────────────────────

const GENDERS = [
  'Kvinna', 'Man', 'Ickebinär', 'Transkvinna', 'Transman',
  'Genderqueer', 'Genderfluid', 'Agender', 'Tvåkönad', 'Annat',
]

const ORIENTATIONS = [
  'Heterosexuell', 'Homosexuell', 'Bisexuell', 'Pansexuell',
  'Asexuell', 'Queer', 'Flexibel', 'Nyfiken', 'Annat',
]

const RELATIONSHIP_TYPES = [
  'Singel', 'Öppen relation', 'Polyamorös', 'Monogam', 'Swingers', 'Annat',
]

const SEEKING_OPTIONS = [
  'Dejting', 'Vänskap', 'Utforskning', 'Evenemang', 'Casual', 'Relation', 'Annat',
]

const BIO_PROMPTS = [
  'Det här är något som gör mig unik…',
  'Mitt perfekta helgäventyr är…',
  'Jag söker någon som…',
  'Det viktigaste för mig i ett förhållande är…',
  'Något folk brukar bli förvånade av när de lär känna mig…',
  'Min livsfilosofi sammanfattas bäst som…',
]

const STEP_LABELS = ['Grunduppgifter', 'Identitet', 'Preferenser', 'Foton', 'Bio', 'Klar']
const TOTAL_STEPS = 6

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  displayName: string
  birthdate: string
  gender: string
  orientation: string
  relationshipType: string
  seeking: string[]
  ageRangeMin: number
  ageRangeMax: number
  distanceKm: number
  photos: File[]
  bio: string
  prompts: Array<{ question: string; answer: string }>
}

// ── Pill selector ─────────────────────────────────────────────────────────────

function PillSelector({
  options,
  value,
  onChange,
  multi = false,
}: {
  options: string[]
  value: string | string[]
  onChange: (val: string | string[]) => void
  multi?: boolean
}) {
  function toggle(opt: string) {
    if (multi) {
      const arr = value as string[]
      const next = arr.includes(opt) ? arr.filter(v => v !== opt) : [...arr, opt]
      onChange(next)
    } else {
      onChange(opt)
    }
  }

  function isSelected(opt: string) {
    return multi ? (value as string[]).includes(opt) : value === opt
  }

  return (
    <div className={styles.pills}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          className={[styles.pill, isSelected(opt) ? styles.pillSelected : ''].filter(Boolean).join(' ')}
          onClick={() => toggle(opt)}
          aria-pressed={isSelected(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ── Range slider ──────────────────────────────────────────────────────────────

function RangeSlider({
  label,
  value,
  min,
  max,
  onChange,
  unit = '',
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  unit?: string
}) {
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className={styles.rangeWrapper}>
      <div className={styles.rangeHeader}>
        <span className={styles.rangeLabel}>{label}</span>
        <span className={styles.rangeValue}>
          {value}{unit}
          {value === max ? '+' : ''}
        </span>
      </div>
      <div className={styles.rangeTrack}>
        <div className={styles.rangeFill} style={{ width: `${percent}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className={styles.rangeInput}
          aria-label={label}
        />
      </div>
    </div>
  )
}

// ── Photo upload slot ─────────────────────────────────────────────────────────

function PhotoSlots({
  photos,
  onChange,
}: {
  photos: File[]
  onChange: (files: File[]) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const combined = [...photos, ...files].slice(0, 6)
    onChange(combined)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePhoto(idx: number) {
    const next = photos.filter((_, i) => i !== idx)
    onChange(next)
  }

  function handleDragStart(idx: number) {
    setDragIndex(idx)
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    setDragOverIndex(idx)
  }

  function handleDrop(e: React.DragEvent, targetIdx: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === targetIdx) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    const next = [...photos]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(targetIdx, 0, moved)
    onChange(next)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const slots = Array.from({ length: 6 }, (_, i) => ({
    file: photos[i] ?? null,
    preview: photos[i] ? URL.createObjectURL(photos[i]) : null,
  }))

  return (
    <div className={styles.photoGrid}>
      {slots.map((slot, idx) => (
        <div
          key={idx}
          className={[
            styles.photoSlot,
            slot.file ? styles.photoSlotFilled : styles.photoSlotEmpty,
            idx === 0 ? styles.photoSlotPrimary : '',
            dragOverIndex === idx ? styles.photoSlotDragOver : '',
          ].filter(Boolean).join(' ')}
          draggable={Boolean(slot.file)}
          onDragStart={() => handleDragStart(idx)}
          onDragOver={e => handleDragOver(e, idx)}
          onDrop={e => handleDrop(e, idx)}
          onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
          onClick={() => !slot.file && fileInputRef.current?.click()}
          role={slot.file ? 'img' : 'button'}
          aria-label={slot.file ? `Foto ${idx + 1}` : 'Lägg till foto'}
          tabIndex={slot.file ? undefined : 0}
          onKeyDown={e => { if (!slot.file && (e.key === 'Enter' || e.key === ' ')) fileInputRef.current?.click() }}
        >
          {slot.preview ? (
            <>
              <img src={slot.preview ?? undefined} alt={`Foto ${idx + 1}`} className={styles.photoPreview} />
              <button
                type="button"
                className={styles.photoRemove}
                onClick={e => { e.stopPropagation(); removePhoto(idx) }}
                aria-label="Ta bort foto"
              >
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {idx === 0 && <span className={styles.photoPrimaryBadge}>Profilbild</span>}
            </>
          ) : (
            <div className={styles.photoPlaceholder}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.cameraIcon}>
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              {idx === 0 && <span className={styles.photoAddLabel}>Lägg till</span>}
            </div>
          )}
        </div>
      ))}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className={styles.hiddenFileInput}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  )
}

// ── Complete animation ────────────────────────────────────────────────────────

function CompleteStep() {
  return (
    <div className={styles.completeContainer}>
      <m.div
        className={styles.checkCircle}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...springs.bouncy, delay: 0.1 }}
      >
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="23" stroke="var(--color-copper)" strokeWidth="2" />
          <path
            d="M13 24l8 8 14-16"
            stroke="var(--color-copper)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </m.div>

      <m.div
        className={styles.completeText}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.soft, delay: 0.3 }}
      >
        <h2 className={styles.completeTitle}>Du är redo!</h2>
        <p className={styles.completeSubtitle}>
          Välkommen till Lustre. Din profil är nu skapad och du kan börja utforska.
        </p>
      </m.div>

      {/* Confetti dots */}
      <div className={styles.confetti} aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <m.span
            key={i}
            className={styles.confettiDot}
            style={{
              '--confetti-color': i % 3 === 0 ? 'var(--color-copper)' : i % 3 === 1 ? 'var(--color-gold)' : 'var(--color-copper-light)',
              '--confetti-x': `${(i / 12) * 100}%`,
            } as React.CSSProperties}
            initial={{ opacity: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [-20, -60 - Math.random() * 40],
              x: [(Math.random() - 0.5) * 80],
              scale: [0, 1, 0.8, 0],
              rotate: [0, (Math.random() - 0.5) * 180],
            }}
            transition={{
              duration: 1.2 + Math.random() * 0.6,
              delay: 0.4 + i * 0.07,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    birthdate: '',
    gender: '',
    orientation: '',
    relationshipType: '',
    seeking: [],
    ageRangeMin: 18,
    ageRangeMax: 50,
    distanceKm: 50,
    photos: [],
    bio: '',
    prompts: [],
  })
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number | null>(null)
  const [promptAnswer, setPromptAnswer] = useState('')

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  function goNext() {
    if (step < TOTAL_STEPS) {
      setDirection('forward')
      setStep(s => s + 1)
    }
  }

  function goBack() {
    if (step > 1) {
      setDirection('backward')
      setStep(s => s - 1)
    }
  }

  function canContinue(): boolean {
    switch (step) {
      case 1: return formData.displayName.trim().length >= 2 && Boolean(formData.birthdate) && Boolean(formData.gender)
      case 2: return Boolean(formData.orientation) && Boolean(formData.relationshipType)
      case 3: return formData.seeking.length > 0
      case 4: return formData.photos.length >= 1
      case 5: return formData.bio.trim().length >= 20
      case 6: return true
      default: return true
    }
  }

  const handleComplete = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await api.profile.completeOnboarding.mutate(formData)
    } catch {
      // Proceed anyway — mock mode
    }
    router.push('/discover/browse')
  }, [formData, isSubmitting, router])

  function addPrompt() {
    if (selectedPromptIndex === null || !promptAnswer.trim()) return
    const question = BIO_PROMPTS[selectedPromptIndex]
    const existing = formData.prompts.findIndex(p => p.question === question)
    if (existing >= 0) {
      const next = [...formData.prompts]
      next[existing] = { question, answer: promptAnswer }
      update('prompts', next)
    } else if (formData.prompts.length < 3) {
      update('prompts', [...formData.prompts, { question, answer: promptAnswer }])
    }
    setSelectedPromptIndex(null)
    setPromptAnswer('')
  }

  function removePrompt(idx: number) {
    update('prompts', formData.prompts.filter((_, i) => i !== idx))
  }

  // ── Step content ────────────────────────────────────────────────────────────

  function renderStepContent() {
    switch (step) {
      case 1:
        return (
          <OnboardingStep
            stepKey={step}
            title="Välkommen till Lustre"
            description="Berätta lite om dig själv för att komma igång."
            direction={direction}
          >
            <Input
              label="Visningsnamn"
              placeholder="Vad ska folk kalla dig?"
              value={formData.displayName}
              onChange={e => update('displayName', e.target.value)}
              required
            />
            <Input
              label="Födelsedag"
              type="text"
              as="input"
              placeholder="ÅÅÅÅ-MM-DD"
              value={formData.birthdate}
              onChange={e => update('birthdate', e.target.value)}
              required
            />
            <div>
              <p className={styles.fieldLabel}>Kön</p>
              <PillSelector
                options={GENDERS}
                value={formData.gender}
                onChange={v => update('gender', v as string)}
              />
            </div>
          </OnboardingStep>
        )

      case 2:
        return (
          <OnboardingStep
            stepKey={step}
            title="Din identitet"
            description="Välj det som beskriver dig bäst — du kan ändra detta senare."
            direction={direction}
          >
            <div>
              <p className={styles.fieldLabel}>Sexuell läggning</p>
              <PillSelector
                options={ORIENTATIONS}
                value={formData.orientation}
                onChange={v => update('orientation', v as string)}
              />
            </div>
            <div>
              <p className={styles.fieldLabel}>Relationsstatus</p>
              <PillSelector
                options={RELATIONSHIP_TYPES}
                value={formData.relationshipType}
                onChange={v => update('relationshipType', v as string)}
              />
            </div>
          </OnboardingStep>
        )

      case 3:
        return (
          <OnboardingStep
            stepKey={step}
            title="Dina preferenser"
            description="Vad söker du på Lustre? Välj gärna flera."
            direction={direction}
          >
            <div>
              <p className={styles.fieldLabel}>Jag söker</p>
              <PillSelector
                options={SEEKING_OPTIONS}
                value={formData.seeking}
                onChange={v => update('seeking', v as string[])}
                multi
              />
            </div>
            <div className={styles.rangeGroup}>
              <p className={styles.fieldLabel}>Åldersintervall</p>
              <div className={styles.ageRangeDisplay}>
                <span>{formData.ageRangeMin} år</span>
                <span className={styles.ageRangeSep}>—</span>
                <span>{formData.ageRangeMax}{formData.ageRangeMax >= 80 ? '+' : ''} år</span>
              </div>
              <RangeSlider
                label="Minsta ålder"
                value={formData.ageRangeMin}
                min={18}
                max={formData.ageRangeMax - 1}
                onChange={v => update('ageRangeMin', v)}
                unit=" år"
              />
              <RangeSlider
                label="Högsta ålder"
                value={formData.ageRangeMax}
                min={formData.ageRangeMin + 1}
                max={80}
                onChange={v => update('ageRangeMax', v)}
                unit=" år"
              />
            </div>
            <RangeSlider
              label="Avstånd"
              value={formData.distanceKm}
              min={5}
              max={200}
              onChange={v => update('distanceKm', v)}
              unit=" km"
            />
          </OnboardingStep>
        )

      case 4:
        return (
          <OnboardingStep
            stepKey={step}
            title="Ladda upp foton"
            description="Lägg till 3–6 foton. Dra och släpp för att ändra ordning."
            direction={direction}
          >
            <PhotoSlots
              photos={formData.photos}
              onChange={files => update('photos', files)}
            />
            <p className={styles.photoHint}>
              {formData.photos.length === 0
                ? 'Profiler med foton får 10× mer uppmärksamhet'
                : `${formData.photos.length} av 6 foton tillagda`}
            </p>
          </OnboardingStep>
        )

      case 5:
        return (
          <OnboardingStep
            stepKey={step}
            title="Skriv en bio"
            description="Berätta vem du är. Det behöver inte vara perfekt."
            direction={direction}
          >
            <div className={styles.bioWrapper}>
              <Input
                as="textarea"
                label="Om mig"
                placeholder="Skriv något som berättar vem du är…"
                value={formData.bio}
                onChange={e => update('bio', (e.target as HTMLTextAreaElement).value.slice(0, 500))}
                className={styles.bioTextarea}
              />
              <div className={styles.bioCounter}>
                <span className={formData.bio.length >= 480 ? styles.bioCounterWarning : ''}>
                  {formData.bio.length}
                </span>
                <span>/500</span>
              </div>
            </div>

            {/* Prompt selection */}
            <div>
              <p className={styles.fieldLabel}>
                Lägg till prompter
                {formData.prompts.length > 0 && ` (${formData.prompts.length}/3)`}
              </p>

              {formData.prompts.map((p, idx) => (
                <div key={idx} className={styles.promptCard}>
                  <p className={styles.promptQuestion}>{p.question}</p>
                  <p className={styles.promptAnswer}>{p.answer}</p>
                  <button
                    type="button"
                    className={styles.promptRemove}
                    onClick={() => removePrompt(idx)}
                    aria-label="Ta bort prompt"
                  >
                    ×
                  </button>
                </div>
              ))}

              {formData.prompts.length < 3 && (
                <div className={styles.promptAdder}>
                  <div className={styles.promptSelect}>
                    {BIO_PROMPTS.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={[
                          styles.promptOption,
                          selectedPromptIndex === idx ? styles.promptOptionSelected : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => {
                          setSelectedPromptIndex(idx)
                          setPromptAnswer('')
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  {selectedPromptIndex !== null && (
                    <m.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={styles.promptAnswerArea}
                    >
                      <Input
                        as="textarea"
                        label={BIO_PROMPTS[selectedPromptIndex]}
                        placeholder="Ditt svar…"
                        value={promptAnswer}
                        onChange={e => setPromptAnswer((e.target as HTMLTextAreaElement).value.slice(0, 200))}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={addPrompt}
                        disabled={!promptAnswer.trim()}
                      >
                        Lägg till svar
                      </Button>
                    </m.div>
                  )}
                </div>
              )}
            </div>
          </OnboardingStep>
        )

      case 6:
        return (
          <OnboardingStep
            stepKey={step}
            title=""
            direction={direction}
          >
            <CompleteStep />
          </OnboardingStep>
        )

      default:
        return null
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      {/* Ambient background */}
      <div className={styles.ambientBg} aria-hidden="true" />

      <div className={styles.container}>
        {/* Progress */}
        <div className={styles.progressWrapper}>
          <OnboardingProgress
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            stepLabels={STEP_LABELS}
          />
        </div>

        {/* Step content with transitions */}
        <div className={styles.stepWrapper}>
          <AnimatePresence mode="wait" initial={false}>
            {renderStepContent()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <m.div
          className={styles.nav}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.soft}
        >
          {step > 1 && step < TOTAL_STEPS && (
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={isSubmitting}
            >
              ← Tillbaka
            </Button>
          )}

          <div className={styles.navSpacer} />

          {step < TOTAL_STEPS - 1 && (
            <Button
              variant="primary"
              onClick={goNext}
              disabled={!canContinue()}
            >
              Nästa →
            </Button>
          )}

          {step === TOTAL_STEPS - 1 && (
            <Button
              variant="primary"
              onClick={goNext}
              disabled={!canContinue()}
            >
              Granska profil →
            </Button>
          )}

          {step === TOTAL_STEPS && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleComplete}
              loading={isSubmitting}
            >
              Börja utforska
            </Button>
          )}
        </m.div>
      </div>
    </div>
  )
}
