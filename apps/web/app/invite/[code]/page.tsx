import Link from 'next/link'
import styles from './page.module.css'

interface Props {
  params: Promise<{ code: string }>
}

export default async function InviteLandingPage({ params }: Props) {
  const { code } = await params

  const benefits = [
    {
      icon: '🔒',
      title: 'Verifierad gemenskap',
      description: 'Alla användare är verifierade via Swish — en person, ett konto.',
    },
    {
      icon: '💬',
      title: 'AI Gatekeeper',
      description: 'Skydda din tid med vår AI som filtrerar bort oönskade meddelanden.',
    },
    {
      icon: '🛡️',
      title: 'SafeDate',
      description: 'Inbyggda säkerhetsfunktioner för trygga träffar — alltid gratis.',
    },
    {
      icon: '⭐',
      title: '50 tokens att börja med',
      description: 'Du får 50 tokens direkt när du skapar ditt konto via inbjudan.',
    },
  ]

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoArea} aria-label="Lustre">
          <div className={styles.logoMark} aria-hidden="true">✦</div>
          <span className={styles.logoText}>Lustre</span>
        </div>

        {/* Headline */}
        <div className={styles.heroSection}>
          <h1 className={styles.heading}>Du har blivit inbjuden!</h1>
          <p className={styles.subheading}>
            En vän har bjudit in dig till Lustre — en sex-positiv social plattform för
            nyfikna, äkta och respektfulla möten.
          </p>
        </div>

        {/* CTA */}
        <Link
          href={`/register?invite=${code}`}
          className={styles.ctaButton}
          aria-label="Skapa konto på Lustre"
        >
          Skapa konto
        </Link>

        <p className={styles.ctaNote}>
          Gratis att gå med &nbsp;·&nbsp; Alltid respektfullt &nbsp;·&nbsp; Verifierade användare
        </p>

        {/* Divider */}
        <div className={styles.divider} aria-hidden="true">
          <span className={styles.dividerText}>Varför Lustre?</span>
        </div>

        {/* Benefits */}
        <ul className={styles.benefits} aria-label="Fördelar med Lustre">
          {benefits.map((benefit) => (
            <li key={benefit.title} className={styles.benefitItem}>
              <span className={styles.benefitIcon} aria-hidden="true">{benefit.icon}</span>
              <div className={styles.benefitContent}>
                <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                <p className={styles.benefitDescription}>{benefit.description}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Footer note */}
        <p className={styles.footer}>
          Har du redan ett konto?{' '}
          <Link href="/login" className={styles.footerLink}>
            Logga in
          </Link>
        </p>
      </div>
    </main>
  )
}
