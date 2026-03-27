'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import Card from '@/components/common/Card'
import { addToast } from '@/lib/toast-store'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

type ThemeOption = 'light' | 'dark' | 'system'

const THEMES: Array<{
  key: ThemeOption
  name: string
  desc: string
  previewClass: string
}> = [
  {
    key: 'light',
    name: 'Ljust',
    desc: 'Varm vit bakgrund',
    previewClass: styles.previewLight,
  },
  {
    key: 'dark',
    name: 'Mörkt',
    desc: 'Kolsvart, mjuka ögon',
    previewClass: styles.previewDark,
  },
  {
    key: 'system',
    name: 'System',
    desc: 'Följer OS-inställning',
    previewClass: styles.previewAuto,
  },
]

function applyTheme(theme: ThemeOption) {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    root.setAttribute('data-theme', theme)
  }

  try {
    localStorage.setItem('lustre-theme', theme)
  } catch {
    // ignore
  }
}

function getStoredTheme(): ThemeOption {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = localStorage.getItem('lustre-theme') as ThemeOption | null
    return stored ?? 'dark'
  } catch {
    return 'dark'
  }
}

export default function ThemeSettingsPage() {
  const [theme, setTheme] = useState<ThemeOption>('dark')

  useEffect(() => {
    setTheme(getStoredTheme())
  }, [])

  async function handleThemeSelect(selected: ThemeOption) {
    setTheme(selected)
    applyTheme(selected)
    try {
      await api.settings.updateTheme.mutate({ theme: selected })
    } catch {
      addToast('Kunde inte spara tema', 'error')
    }
    addToast(
      selected === 'light'
        ? 'Ljust tema aktiverat'
        : selected === 'dark'
          ? 'Mörkt tema aktiverat'
          : 'Systemtema aktiverat',
      'success'
    )
  }

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.pageTitle}>Tema</h1>
        <p className={styles.pageSubtitle}>
          Välj ett färgtema som passar din stämning.
        </p>
      </div>

      <Card header={<span className={styles.sectionTitle}>Färgtema</span>}>
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ display: 'none' }}>Välj färgtema</legend>
          <div className={styles.themeGrid} role="radiogroup" aria-label="Färgtema">
            {THEMES.map((t) => (
              <button
                key={t.key}
                type="button"
                role="radio"
                aria-checked={theme === t.key}
                className={[
                  styles.themeCard,
                  theme === t.key ? styles.themeCardActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleThemeSelect(t.key)}
              >
                <div className={[styles.preview, t.previewClass].join(' ')}>
                  <div className={styles.checkmark} aria-hidden="true">
                    <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path
                        d="M1.5 5l2.5 2.5 4.5-4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <div className={styles.themeName}>{t.name}</div>
                  <div className={styles.themeDesc}>{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </fieldset>
      </Card>
    </div>
  )
}
