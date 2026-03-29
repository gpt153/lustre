import ScatteredGallery from '@/components/profile/ScatteredGallery'
import StickyNote from '@/components/profile/StickyNote'
import styles from './page.module.css'

const MOCK_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop',
    alt: 'Emma porträtt',
    caption: 'Sommar i Stockholm',
  },
  {
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=750&fit=crop',
    alt: 'Emma på kafé',
    caption: 'Morgonkaffe',
  },
  {
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=750&fit=crop',
    alt: 'Emma utomhus',
    caption: 'Stadsäventyr',
  },
  {
    url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=750&fit=crop',
    alt: 'Emma ler',
    caption: 'Alltid glad',
  },
  {
    url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=750&fit=crop',
    alt: 'Emma på vandring',
    caption: 'Utsikten!',
  },
]

const INTERESTS = [
  { label: 'Fotografi', icon: '📷', variant: 'primary' as const },
  { label: 'Vintage', icon: '🎞️', variant: 'secondary' as const },
  { label: 'Yoga', icon: '🧘', variant: 'surface' as const },
  { label: 'Resor', icon: '✈️', variant: 'tertiary' as const },
  { label: 'Musik', icon: '🎵', variant: 'primary' as const },
  { label: 'Konst', icon: '🎨', variant: 'secondary' as const },
]

const tagVariantMap = {
  primary: styles.tagPrimary,
  secondary: styles.tagSecondary,
  tertiary: styles.tagTertiary,
  surface: styles.tagSurface,
}

export default function TestProfilePage() {
  return (
    <div className={styles.page}>
      {/* Minimal header */}
      <header className={styles.header}>
        <span className={styles.headerTitle}>Lustre</span>
      </header>

      <div className={styles.layout}>
        {/* Left 60% — Scattered Gallery */}
        <section className={styles.galleryPanel}>
          <ScatteredGallery photos={MOCK_PHOTOS} />

          {/* Sticky notes overlaid on gallery */}
          <div className={styles.stickyNotes}>
            <StickyNote
              text={'"Fråga mig om min vinylsamling!"'}
              rotation="pos3"
            />
          </div>
          <div className={styles.stickyNote2}>
            <StickyNote
              text="Nytt yogaretreat nästa vecka!"
              rotation="neg6"
            />
          </div>
        </section>

        {/* Right 40% — Info Panel */}
        <section className={styles.infoPanel}>
          <div className={styles.infoContent}>
            {/* Name + verified */}
            <div>
              <div className={styles.nameRow}>
                <h1 className={styles.name}>Emma, 28</h1>
                <span className={styles.verified} title="Verifierad">✓</span>
              </div>
              <div className={styles.locationRow}>
                <span className={styles.locationIcon}>📍</span>
                <span>Stockholm</span>
                <span className={styles.dot} />
                <span className={styles.distance}>3 km bort</span>
              </div>
            </div>

            {/* Bio */}
            <div className={styles.bio}>
              <p className={styles.bioText}>
                &ldquo;Fotograf på dagarna, yogaentusiast på kvällarna.
                Jag tror att de bästa historierna hittas mellan sidorna i ett
                pass och genom linsen på en gammal Hasselblad.&rdquo;
              </p>
              <div className={styles.bioSparkle} aria-hidden="true">✨</div>
            </div>

            {/* Interests */}
            <div>
              <h4 className={styles.interestsLabel}>Intressen</h4>
              <div className={styles.interestTags}>
                {INTERESTS.map((interest) => (
                  <span
                    key={interest.label}
                    className={`${styles.interestTag} ${tagVariantMap[interest.variant]}`}
                  >
                    <span>{interest.icon}</span>
                    {interest.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Sticky notes inline */}
            <div className={styles.notesSection}>
              <StickyNote
                text={'"Gillar långa promenader längs Södermalm"'}
                rotation="neg2"
              />
              <StickyNote
                text="Letar efter någon att dela solnedgångar med"
                rotation="pos1"
              />
            </div>

            {/* CTA */}
            <div className={styles.ctaRow}>
              <button className={styles.sendButton}>
                <span>✉️</span>
                Skicka meddelande
              </button>
              <button className={styles.heartButton} aria-label="Gilla">
                ♡
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
