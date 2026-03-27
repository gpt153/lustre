'use client'

import { useCallback } from 'react'
import styles from './FilterSidebar.module.css'

export interface DiscoverFilters {
  maxDistance: number
  ageMin: number
  ageMax: number
  mode: 'all' | 'vanilla' | 'spicy'
  interests: string[]
}

const DEFAULT_INTERESTS = [
  'BDSM',
  'Polyamory',
  'Fetish',
  'Role Play',
  'Tantric',
  'Swinging',
]

interface FilterSidebarProps {
  filters: DiscoverFilters
  onChange: (filters: DiscoverFilters) => void
  isOpen?: boolean
  onClose?: () => void
}

export function FilterSidebar({ filters, onChange, isOpen = true, onClose }: FilterSidebarProps) {
  const handleDistanceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...filters, maxDistance: Number(e.target.value) })
    },
    [filters, onChange]
  )

  const handleAgeMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.min(Number(e.target.value), filters.ageMax - 1)
      onChange({ ...filters, ageMin: val })
    },
    [filters, onChange]
  )

  const handleAgeMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(Number(e.target.value), filters.ageMin + 1)
      onChange({ ...filters, ageMax: val })
    },
    [filters, onChange]
  )

  const handleModeChange = useCallback(
    (mode: DiscoverFilters['mode']) => {
      onChange({ ...filters, mode })
    },
    [filters, onChange]
  )

  const toggleInterest = useCallback(
    (interest: string) => {
      const has = filters.interests.includes(interest)
      const next = has
        ? filters.interests.filter((i) => i !== interest)
        : [...filters.interests, interest]
      onChange({ ...filters, interests: next })
    },
    [filters, onChange]
  )

  if (!isOpen) return null

  return (
    <aside className={styles.sidebar} aria-label="Discovery filters">
      <div className={styles.header}>
        <h2 className={styles.title}>Filters</h2>
        {onClose && (
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close filters"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          Distance
          <span className={styles.value}>{filters.maxDistance} km</span>
        </label>
        <input
          className={styles.range}
          type="range"
          min={5}
          max={200}
          step={5}
          value={filters.maxDistance}
          onChange={handleDistanceChange}
          aria-label={`Max distance: ${filters.maxDistance} km`}
        />
        <div className={styles.rangeMarks}>
          <span>5 km</span>
          <span>200 km</span>
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Age range</label>
        <div className={styles.ageRow}>
          <div className={styles.ageField}>
            <span className={styles.ageLabel}>Min</span>
            <input
              className={styles.range}
              type="range"
              min={18}
              max={80}
              value={filters.ageMin}
              onChange={handleAgeMinChange}
              aria-label={`Minimum age: ${filters.ageMin}`}
            />
            <span className={styles.ageValue}>{filters.ageMin}</span>
          </div>
          <div className={styles.ageField}>
            <span className={styles.ageLabel}>Max</span>
            <input
              className={styles.range}
              type="range"
              min={18}
              max={80}
              value={filters.ageMax}
              onChange={handleAgeMaxChange}
              aria-label={`Maximum age: ${filters.ageMax}`}
            />
            <span className={styles.ageValue}>{filters.ageMax}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Mode</label>
        <div className={styles.modeGroup} role="group" aria-label="Mode filter">
          {(['all', 'vanilla', 'spicy'] as const).map((m) => (
            <button
              key={m}
              className={[styles.modeBtn, filters.mode === m && styles.modeBtnActive]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleModeChange(m)}
              type="button"
              aria-pressed={filters.mode === m}
            >
              {m === 'all' ? 'All' : m === 'vanilla' ? '🌿 Vanilla' : '🌶️ Spicy'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Interests</label>
        <div className={styles.interests}>
          {DEFAULT_INTERESTS.map((interest) => (
            <button
              key={interest}
              className={[
                styles.interestTag,
                filters.interests.includes(interest) && styles.interestTagActive,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => toggleInterest(interest)}
              type="button"
              aria-pressed={filters.interests.includes(interest)}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
