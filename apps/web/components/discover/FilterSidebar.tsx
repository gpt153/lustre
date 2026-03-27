'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import styles from './FilterSidebar.module.css'

const GENDER_OPTIONS = [
  { value: 'WOMAN', label: 'Kvinna' },
  { value: 'MAN', label: 'Man' },
  { value: 'NON_BINARY', label: 'Icke-binär' },
  { value: 'TRANS_WOMAN', label: 'Transkvinna' },
  { value: 'TRANS_MAN', label: 'Transman' },
  { value: 'OTHER', label: 'Annat' },
] as const

const ORIENTATION_OPTIONS = [
  { value: 'HETEROSEXUAL', label: 'Heterosexuell' },
  { value: 'HOMOSEXUAL', label: 'Homosexuell' },
  { value: 'BISEXUAL', label: 'Bisexuell' },
  { value: 'PANSEXUAL', label: 'Pansexuell' },
  { value: 'ASEXUAL', label: 'Asexuell' },
  { value: 'OTHER', label: 'Annat' },
] as const

const SEEKING_OPTIONS = [
  { value: 'CASUAL', label: 'Avslappnat' },
  { value: 'RELATIONSHIP', label: 'Relation' },
  { value: 'FRIENDSHIP', label: 'Vänskap' },
  { value: 'EXPLORATION', label: 'Utforskning' },
  { value: 'EVENT', label: 'Träff / Event' },
  { value: 'OTHER', label: 'Annat' },
] as const

export interface DiscoverFilters {
  ageMin: number
  ageMax: number
  distanceKm: number
  genders: string[]
  orientations: string[]
  seeking: string[]
}

const DEFAULT_FILTERS: DiscoverFilters = {
  ageMin: 18,
  ageMax: 60,
  distanceKm: 50,
  genders: [],
  orientations: [],
  seeking: [],
}

interface FilterSidebarProps {
  onApply: (filters: DiscoverFilters) => void
  initialFilters?: Partial<DiscoverFilters>
}

export default function FilterSidebar({
  onApply,
  initialFilters,
}: FilterSidebarProps) {
  const [filters, setFilters] = useState<DiscoverFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  })

  function setAge(field: 'ageMin' | 'ageMax', value: string) {
    const parsed = parseInt(value, 10)
    if (!isNaN(parsed)) {
      setFilters((prev) => ({ ...prev, [field]: Math.max(18, Math.min(99, parsed)) }))
    }
  }

  function setDistance(value: string) {
    const parsed = parseInt(value, 10)
    if (!isNaN(parsed)) {
      setFilters((prev) => ({ ...prev, distanceKm: Math.max(1, Math.min(500, parsed)) }))
    }
  }

  function toggleOption(
    field: 'genders' | 'orientations' | 'seeking',
    value: string
  ) {
    setFilters((prev) => {
      const current = prev[field]
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [field]: next }
    })
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS)
  }

  function handleApply() {
    onApply(filters)
  }

  return (
    <aside className={styles.sidebar} aria-label="Sökfilter">
      <div className={styles.header}>
        <h2 className={styles.heading}>Filter</h2>
        <button className={styles.resetBtn} onClick={handleReset} type="button">
          Återställ
        </button>
      </div>

      <div className={styles.sections}>
        {/* Age range */}
        <section className={styles.section}>
          <h3 className={styles.sectionLabel}>Ålder</h3>
          <div className={styles.ageRow}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="age-min">Från</label>
              <input
                id="age-min"
                type="number"
                className={styles.numberInput}
                min={18}
                max={99}
                value={filters.ageMin}
                onChange={(e) => setAge('ageMin', e.target.value)}
              />
            </div>
            <span className={styles.rangeSeparator} aria-hidden="true">–</span>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="age-max">Till</label>
              <input
                id="age-max"
                type="number"
                className={styles.numberInput}
                min={18}
                max={99}
                value={filters.ageMax}
                onChange={(e) => setAge('ageMax', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Distance */}
        <section className={styles.section}>
          <h3 className={styles.sectionLabel}>Avstånd</h3>
          <div className={styles.distanceRow}>
            <input
              id="distance"
              type="number"
              className={styles.numberInput}
              min={1}
              max={500}
              value={filters.distanceKm}
              onChange={(e) => setDistance(e.target.value)}
              aria-label="Maximalt avstånd i kilometer"
            />
            <span className={styles.distanceUnit}>km</span>
          </div>
        </section>

        {/* Gender */}
        <section className={styles.section}>
          <h3 className={styles.sectionLabel}>Kön</h3>
          <div className={styles.checkboxGroup}>
            {GENDER_OPTIONS.map((opt) => (
              <label key={opt.value} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={filters.genders.includes(opt.value)}
                  onChange={() => toggleOption('genders', opt.value)}
                />
                <span className={styles.checkboxText}>{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Orientation */}
        <section className={styles.section}>
          <h3 className={styles.sectionLabel}>Läggning</h3>
          <div className={styles.checkboxGroup}>
            {ORIENTATION_OPTIONS.map((opt) => (
              <label key={opt.value} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={filters.orientations.includes(opt.value)}
                  onChange={() => toggleOption('orientations', opt.value)}
                />
                <span className={styles.checkboxText}>{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Seeking */}
        <section className={styles.section}>
          <h3 className={styles.sectionLabel}>Söker</h3>
          <div className={styles.checkboxGroup}>
            {SEEKING_OPTIONS.map((opt) => (
              <label key={opt.value} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={filters.seeking.includes(opt.value)}
                  onChange={() => toggleOption('seeking', opt.value)}
                />
                <span className={styles.checkboxText}>{opt.label}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className={styles.applyWrap}>
        <Button variant="primary" fullWidth onClick={handleApply}>
          Tillämpa filter
        </Button>
      </div>
    </aside>
  )
}
