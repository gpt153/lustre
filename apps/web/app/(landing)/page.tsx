import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroSection } from '@/components/landing/HeroSection'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Lustre — Dejta på dina villkor',
  description: 'Sex-positiv dejtingapp med ConsentVault, säkra dejter och AI-coach.',
  openGraph: {
    title: 'Lustre — Dejta på dina villkor',
    description: 'Sex-positiv dejtingapp med ConsentVault, säkra dejter och AI-coach.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lustre — Dejta på dina villkor',
    description: 'Sex-positiv dejtingapp med ConsentVault, säkra dejter och AI-coach.',
  },
}

/* ─── Feature data ──────────────────────────── */

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    title: 'ConsentVault',
    text: 'Dela intimt innehåll utan risk för hämnporr. DRM-skyddat med ömsesidigt samtycke, revoke med ett klick, och krypterad lagring.',
    tag: 'Säkerhet',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Vanilla & Spicy Mode',
    text: 'En app, två upplevelser. Byt mellan vanlig dejting och ett öppnare utforskande med ett klick. Du bestämmer vad du vill visa.',
    tag: 'Flexibilitet',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'SafeDate',
    text: 'GPS-delning med säkerhetskontakter, automatisk eskalering om incheckning missas. Trygghet för fysiska möten — alltid gratis.',
    tag: 'Trygghet',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: 'AI-coach',
    text: 'Personlig coaching i kommunikation, consent och intimitet. Röst- eller textbaserade sessioner med Axel och Sophia. Lär dig, utforska, väx.',
    tag: 'Lärande',
  },
] as const

/* ─── Testimonial data ──────────────────────── */

const testimonials = [
  {
    quote: 'Äntligen en app där jag inte behöver skämmas för vad jag vill ha. Lustre känns som en plattform som faktiskt respekterar mig.',
    name: 'Sofia K.',
    role: 'Stockholm',
    initials: 'SK',
  },
  {
    quote: 'ConsentVault är ett geni. Vi har äntligen ett säkert sätt att dela intima stunder utan att behöva oroa oss.',
    name: 'Marcus & Emma',
    role: 'Göteborg',
    initials: 'ME',
  },
  {
    quote: 'SafeDate-funktionen gav mig tryggheten att träffa nya människor. Vet att mina vänner har koll om något händer.',
    name: 'Alex T.',
    role: 'Malmö',
    initials: 'AT',
  },
]

/* ─── Structured data ───────────────────────── */

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Lustre',
  description: 'Sex-positiv dejtingapp med ConsentVault, säkra dejter och AI-coach.',
  url: 'https://lovelustre.com',
  logo: 'https://lovelustre.com/logo.png',
  sameAs: [],
  foundingLocation: {
    '@type': 'Place',
    name: 'Stockholm, Sverige',
  },
}

/* ─── Page ──────────────────────────────────── */

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <main>
        {/* ─── Hero ─── */}
        <HeroSection />

        {/* ─── Features ─── */}
        <section className={styles.features} aria-labelledby="features-heading">
          <div className={styles.featuresInner}>
            <div className={styles.featuresHeader}>
              <div className={styles.sectionLabel}>Vad gör Lustre unikt</div>
              <h2 className={styles.sectionTitle} id="features-heading">
                Byggt annorlunda. På riktigt.
              </h2>
              <p className={styles.sectionSubtitle}>
                Inte ytterligare en dejtingapp. En plattform med verktyg som faktiskt
                skyddar dig, stöttar dig och respekterar vem du är.
              </p>
            </div>

            <div className={styles.featuresGrid}>
              {features.map((f) => (
                <article key={f.title} className={styles.featureCard}>
                  <div className={styles.featureIconWrap} aria-hidden="true">
                    {f.icon}
                  </div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureText}>{f.text}</p>
                  <span className={styles.featureTag}>{f.tag}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className={styles.divider} role="separator" />

        {/* ─── ConsentVault row ─── */}
        <section className={styles.featureRow} aria-label="ConsentVault i detalj">
          <div className={styles.featureRowInner}>
            <div className={styles.featureRowContent}>
              <div className={styles.sectionLabel}>ConsentVault</div>
              <h2 className={styles.sectionTitle}>
                Intimt innehåll — på dina villkor
              </h2>
              <p className={styles.sectionSubtitle}>
                Dela videor och bilder med fullständigt DRM-skydd. Ömsesidigt
                samtycke krävs, GPS-verifiering bekräftar närvaro, och du kan
                återkalla åtkomst när som helst. Din data stannar hos dig.
              </p>
              <Link href="/register" className={styles.heroCtaPrimary}>
                Kom igång gratis
              </Link>
            </div>
            <div className={styles.featureRowVisual} aria-hidden="true">
              <svg className={styles.featureRowVisualIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
        </section>

        {/* ─── SafeDate row ─── */}
        <section className={`${styles.featureRow}`} style={{ background: 'var(--bg-secondary)' }} aria-label="SafeDate i detalj">
          <div className={`${styles.featureRowInner} ${styles.reverse}`}>
            <div className={styles.featureRowContent}>
              <div className={styles.sectionLabel}>SafeDate</div>
              <h2 className={styles.sectionTitle}>
                Tryggare dejter i verkligheten
              </h2>
              <p className={styles.sectionSubtitle}>
                Aktivera SafeDate innan ett möte. Dela din position med betrodda
                kontakter, schemalägg incheckningar, och om något verkar fel —
                automatisk eskalering utan att du behöver göra något. Gratis alltid.
              </p>
              <Link href="/register" className={styles.heroCtaPrimary}>
                Skapa konto
              </Link>
            </div>
            <div className={styles.featureRowVisual} aria-hidden="true">
              <svg className={styles.featureRowVisualIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
        </section>

        <div className={styles.divider} role="separator" />

        {/* ─── Social proof ─── */}
        <section className={styles.socialProof} aria-labelledby="social-proof-heading">
          <div className={styles.socialProofInner}>
            <div className={styles.socialProofHeader}>
              <div className={styles.sectionLabel}>Community</div>
              <h2 className={styles.sectionTitle} id="social-proof-heading">
                Tusentals dejtar bättre redan nu
              </h2>
            </div>

            <div className={styles.statsRow} role="list" aria-label="Plattformsstatistik">
              <div className={styles.statItem} role="listitem">
                <div className={styles.statNumber}>12k+</div>
                <div className={styles.statLabel}>Registrerade användare</div>
              </div>
              <div className={styles.statItem} role="listitem">
                <div className={styles.statNumber}>4.8</div>
                <div className={styles.statLabel}>App Store-betyg</div>
              </div>
              <div className={styles.statItem} role="listitem">
                <div className={styles.statNumber}>98%</div>
                <div className={styles.statLabel}>Verifierade profiler</div>
              </div>
            </div>

            <div className={styles.testimonialsGrid}>
              {testimonials.map((t) => (
                <article key={t.name} className={styles.testimonialCard}>
                  <blockquote>
                    <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                  </blockquote>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.testimonialAvatar} aria-hidden="true">
                      {t.initials}
                    </div>
                    <div>
                      <div className={styles.testimonialName}>{t.name}</div>
                      <div className={styles.testimonialRole}>{t.role}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.trustBadges} role="list" aria-label="Säkerhetsmärken">
              <div className={styles.trustBadge} role="listitem">
                <svg className={styles.trustBadgeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                100% verifierade användare
              </div>
              <div className={styles.trustBadge} role="listitem">
                <svg className={styles.trustBadgeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                End-to-end krypterat
              </div>
              <div className={styles.trustBadge} role="listitem">
                <svg className={styles.trustBadgeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Säkerhetsfunktioner gratis alltid
              </div>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className={styles.cta} aria-labelledby="cta-heading">
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle} id="cta-heading">
              Redo att dejta på riktigt?
            </h2>
            <p className={styles.ctaText}>
              Gå med i Lustre idag och upplev dejting som respekterar vem du är,
              vad du vill, och din rätt till trygghet.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/register" className={styles.heroCtaPrimary}>
                Skapa konto
              </Link>
              <Link href="/login" className={styles.heroCtaSecondary}>
                Logga in
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              Lust<span className={styles.footerBrandAccent}>re</span>
            </div>
            <nav className={styles.footerLinks} aria-label="Sidfotslänkar">
              <Link href="/privacy" className={styles.footerLink}>Integritetspolicy</Link>
              <Link href="/terms" className={styles.footerLink}>Villkor</Link>
              <Link href="/about" className={styles.footerLink}>Om oss</Link>
            </nav>
            <p className={styles.footerCopy}>
              &copy; {new Date().getFullYear()} Lustre. Stockholm, Sverige.
            </p>
          </div>
        </footer>
      </main>
    </>
  )
}
