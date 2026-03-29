'use client';

import { useState } from 'react';
import styles from './FilterBar.module.css';

const FILTER_CHIPS = ['Alla', 'Ålder', 'Avstånd', 'Intressen'] as const;

/* Simple SVG icons as fallbacks for Material Symbols */
function TuneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

function NotificationsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

interface FilterBarProps {
  profileCount?: number;
}

export default function FilterBar({ profileCount }: FilterBarProps) {
  const [activeChip, setActiveChip] = useState<string>('Alla');

  return (
    <header className={styles.bar}>
      {/* Search input — hidden below 900px via CSS */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className={styles.search}
          placeholder="Sök profiler..."
          aria-label="Sök profiler"
        />
      </div>

      {/* Filter chips — hidden below 599px via CSS */}
      <div className={styles.chips}>
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip}
            className={`${styles.chip} ${activeChip === chip ? styles.chipActive : ''}`}
            onClick={() => setActiveChip(chip)}
            aria-pressed={activeChip === chip}
          >
            {chip}
          </button>
        ))}
        {profileCount !== undefined && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 13,
              color: 'var(--stitch-outline, #857467)',
              marginLeft: 4,
            }}
          >
            {profileCount} profiler
          </span>
        )}
      </div>

      {/* Right side actions */}
      <div className={styles.actions}>
        <button className={styles.iconBtn} aria-label="Filter-inställningar">
          <TuneIcon />
        </button>
        <button
          className={`${styles.iconBtn} ${styles.notificationDot}`}
          aria-label="Notifikationer"
        >
          <NotificationsIcon />
        </button>
        <div className={styles.avatar} aria-label="Min profil">
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--stitch-on-surface-variant, #524439)',
            }}
          >
            <PersonIcon />
          </div>
        </div>
      </div>
    </header>
  );
}
