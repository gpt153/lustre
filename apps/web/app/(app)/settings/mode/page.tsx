'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import Card from '@/components/common/Card'
import { addToast } from '@/lib/toast-store'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any
import { useAuthStore } from '@/lib/stores'

type ContentFilter = 'SOFT' | 'OPEN' | 'EXPLICIT' | 'NO_DICK_PICS'

const CONTENT_FILTERS: Array<{
  key: ContentFilter
  emoji: string
  name: string
  desc: string
}> = [
  {
    key: 'SOFT',
    emoji: '🌸',
    name: 'SOFT',
    desc: 'Endast SFW-innehåll, inga nakna bilder',
  },
  {
    key: 'OPEN',
    emoji: '🔓',
    name: 'OPEN',
    desc: 'Blandat innehåll, varsamt modererat',
  },
  {
    key: 'EXPLICIT',
    emoji: '🔥',
    name: 'EXPLICIT',
    desc: 'Allt innehåll tillåtet (18+)',
  },
  {
    key: 'NO_DICK_PICS',
    emoji: '🚫',
    name: 'NO DICK PICS',
    desc: 'Filtrerar bort oönskade genitalbilder',
  },
]

export default function ModeSettingsPage() {
  const userId = useAuthStore((s) => s.userId)

  const [mode, setMode] = useState<'vanilla' | 'spicy'>('vanilla')
  const [filter, setFilter] = useState<ContentFilter>('OPEN')

  useEffect(() => {
    if (!userId) return
    async function load() {
      try {
        const modeData = await api.settings.getMode.query()
        if (modeData?.mode) setMode(modeData.mode)
      } catch {
        // use default
      }
      try {
        const filterData = await api.contentFilter.get.query()
        if (filterData?.preset) setFilter(filterData.preset)
      } catch {
        // use default
      }
    }
    load()
  }, [userId])

  async function handleModeToggle() {
    const newMode = mode === 'vanilla' ? 'spicy' : 'vanilla'
    setMode(newMode)
    // Also update the html data-mode attribute for immediate accent color change
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-mode', newMode)
    }
    try {
      await api.settings.setMode.mutate({ mode: newMode })
      addToast('Läge uppdaterat', 'success')
    } catch {
      addToast('Kunde inte uppdatera läge', 'error')
    }
  }

  async function handleFilterSelect(key: ContentFilter) {
    setFilter(key)
    try {
      await api.contentFilter.update.mutate({ preset: key })
      addToast('Innehållsfilter sparat', 'success')
    } catch {
      addToast('Kunde inte spara filter', 'error')
    }
  }

  const isSpicy = mode === 'spicy'

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.pageTitle}>Läge</h1>
        <p className={styles.pageSubtitle}>
          Välj mellan Vanilla och Spicy för att anpassa din upplevelse.
        </p>
      </div>

      {/* Mode toggle */}
      <Card header={<span className={styles.sectionTitle}>Vanilla / Spicy</span>}>
        <div className={styles.modeToggleWrapper}>
          <button
            type="button"
            className={styles.modeTrack}
            onClick={handleModeToggle}
            aria-label={`Byt till ${isSpicy ? 'Vanilla' : 'Spicy'} läge`}
          >
            <div
              className={[
                styles.modeThumb,
                isSpicy ? styles.modeThumbSpicy : styles.modeThumbVanilla,
              ].join(' ')}
              aria-hidden="true"
            />
            <span className={[styles.modeOption, !isSpicy ? styles.modeOptionActive : ''].filter(Boolean).join(' ')}>
              🌿 Vanilla
            </span>
            <span className={[styles.modeOption, isSpicy ? styles.modeOptionActive : ''].filter(Boolean).join(' ')}>
              🌶️ Spicy
            </span>
          </button>

          {/* Accent swatch */}
          <div className={styles.accentPreview}>
            <div
              className={[
                styles.accentSwatch,
                isSpicy ? styles.accentSwatchSpicy : styles.accentSwatchVanilla,
              ].join(' ')}
              aria-hidden="true"
            />
            <span className={styles.accentLabel}>
              Accentfärg:{' '}
              <span className={styles.accentName}>
                {isSpicy ? 'Ember' : 'Sage'}
              </span>
            </span>
          </div>
        </div>
      </Card>

      {/* Content filter */}
      <Card header={<span className={styles.sectionTitle}>Innehållsfilter</span>}>
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ display: 'none' }}>Välj innehållsfilternivå</legend>
          <div className={styles.filterGrid}>
            {CONTENT_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="radio"
                aria-checked={filter === f.key}
                className={[
                  styles.filterCard,
                  filter === f.key ? styles.filterCardActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleFilterSelect(f.key)}
              >
                <span className={styles.filterEmoji} aria-hidden="true">
                  {f.emoji}
                </span>
                <span className={styles.filterName}>{f.name}</span>
                <span className={styles.filterDesc}>{f.desc}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </Card>
    </div>
  )
}
