'use client'

import PolaroidCard from '@/components/common/PolaroidCard'
import PolaroidMasonryGrid from '@/components/common/PolaroidMasonryGrid'
import FilterBar from '@/components/discover/FilterBar'
import DiscoverFAB from '@/components/discover/DiscoverFAB'
import styles from './page.module.css'

const PROFILES = [
  { name: 'Emma, 28', tagline: 'Midnight talks > everything', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=750&fit=crop' },
  { name: 'Sofia, 31', tagline: 'Konstnär och äventyrare', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop' },
  { name: 'Lina, 25', tagline: 'Yoga och böcker', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=750&fit=crop' },
  { name: 'Alex, 33', tagline: 'Dog dad, wine lover', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop' },
  { name: 'Maja, 27', tagline: 'Skrattar för mycket', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=750&fit=crop' },
  { name: 'Julia, 30', tagline: 'Söker djupa samtal', img: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=750&fit=crop' },
  { name: 'Klara, 26', tagline: "Let's get lost somewhere", img: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=750&fit=crop' },
  { name: 'Ida, 29', tagline: 'Sjuksköterska med stort hjärta', img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=750&fit=crop' },
  { name: 'Daniel, 30', tagline: 'Film photography & coffee', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=750&fit=crop' },
  { name: 'Chloe, 24', tagline: 'Golden hour enthusiast', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=750&fit=crop' },
  { name: 'Liam, 28', tagline: 'Amateur chef, professional eater', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=750&fit=crop' },
  { name: 'Maya, 26', tagline: 'Seeking a concert buddy', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=750&fit=crop' },
]

export default function TestPolaroidPage() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #fff8f6 0%, #faebe6 50%, #f4e5e0 100%)',
      minHeight: '100vh',
    }}>
      {/* Wave 2: FilterBar */}
      <FilterBar profileCount={PROFILES.length} />

      <div style={{ padding: '24px 12px' }}>
        {/* Wave 2: Discovery title */}
        <h1 style={{
          fontFamily: 'var(--font-epilogue, sans-serif)',
          fontSize: '48px',
          fontWeight: 800,
          letterSpacing: '-0.05em',
          color: '#211a17',
          marginBottom: '8px',
        }}>
          Daily Discoveries
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#524439',
          fontStyle: 'italic',
          marginBottom: '40px',
        }}>
          Hittade {PROFILES.length} matchningar idag
        </p>

        {/* Wave 2: Discovery masonry grid with profile cards */}
        <PolaroidMasonryGrid>
          {PROFILES.map((profile, i) => (
            <PolaroidCard
              key={i}
              imageUrl={profile.img}
              imageAlt={`${profile.name}s profilbild`}
              caption={`${profile.name} — ${profile.tagline}`}
              stack={i < 3}
              hoverable
              onClick={() => { window.location.href = '/test-profile' }}
            >
              <div className={styles.polaroidActions}>
                <button className={styles.actionBtn} aria-label="Passa" onClick={(e) => e.stopPropagation()}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                </button>
                <button className={styles.actionBtn} aria-label="Spark" onClick={(e) => e.stopPropagation()}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button className={styles.actionBtn} aria-label="Gilla" onClick={(e) => e.stopPropagation()}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" /></svg>
                </button>
              </div>
            </PolaroidCard>
          ))}
        </PolaroidMasonryGrid>
      </div>

      {/* Wave 2: FAB */}
      <DiscoverFAB />
    </div>
  )
}
