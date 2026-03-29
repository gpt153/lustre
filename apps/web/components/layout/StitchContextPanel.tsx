import styles from './StitchContextPanel.module.css'

const trendingMoments = [
  {
    name: 'Lake Reflections',
    author: 'Amanda Torsten',
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop',
    rotation: 'rotate2' as const,
  },
  {
    name: 'Creative Spills',
    author: 'Niklas Sjoqvist',
    img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop',
    rotation: 'rotateNeg3' as const,
  },
]

const suggestedProfiles = [
  {
    name: 'Elara Vance',
    label: 'Film Photographer',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
  },
  {
    name: 'Julian Thorne',
    label: 'Pottery Artist',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
  },
]

export default function StitchContextPanel() {
  return (
    <aside className={styles.panel}>
      {/* Trending Moments */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.headingIcon} aria-hidden="true">✦</span>
          Trending Moments
        </h2>
        <div className={styles.trendingList}>
          {trendingMoments.map((item) => (
            <div key={item.name} className={styles.trendingItem}>
              <div className={`${styles.miniPolaroid} ${styles[item.rotation]}`}>
                <img
                  src={item.img}
                  alt={item.name}
                  className={styles.miniPolaroidImg}
                  width={56}
                  height={56}
                />
              </div>
              <div className={styles.trendingText}>
                <p className={styles.trendingName}>{item.name}</p>
                <p className={styles.trendingAuthor}>{item.author}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested Profiles */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>
          <span className={styles.headingIcon} aria-hidden="true">+</span>
          Suggested
        </h2>
        <div className={styles.suggestedCard}>
          <div className={styles.suggestedList}>
            {suggestedProfiles.map((profile) => (
              <div key={profile.name} className={styles.suggestedItem}>
                <div className={styles.suggestedInfo}>
                  <img
                    src={profile.img}
                    alt={profile.name}
                    className={styles.avatar}
                    width={40}
                    height={40}
                  />
                  <div>
                    <p className={styles.suggestedName}>{profile.name}</p>
                    <p className={styles.suggestedLabel}>{profile.label}</p>
                  </div>
                </div>
                <button className={styles.addButton} aria-label={`Add ${profile.name}`}>
                  +
                </button>
              </div>
            ))}
          </div>
          <button className={styles.viewAllLink}>
            View All Connections
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerCopyright}>LUSTRE © 2024</p>
        <p className={styles.footerTagline}>Every moment is a treasure.</p>
      </footer>
    </aside>
  )
}
