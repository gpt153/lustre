'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { trpc } from '@lustre/api'
import { Button } from '@/components/common/Button'
import styles from './page.module.css'

export default function OrgDetailPage() {
  const params = useParams()
  const orgId = params.orgId as string

  const orgQuery = trpc.org.get.useQuery({ id: orgId })
  const joinMutation = trpc.org.join.useMutation()
  const leaveMutation = trpc.org.leave.useMutation()

  if (orgQuery.isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--color-copper)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (orgQuery.isError || !orgQuery.data) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Organisation hittades inte</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Försök igen senare eller gå tillbaka till organisationsvyn.</p>
        </div>
      </div>
    )
  }

  const org = orgQuery.data
  const isMember = org.isMember
  const canAdmin = org.memberRole === 'OWNER' || org.memberRole === 'ADMIN'

  const handleJoin = async () => {
    try {
      await joinMutation.mutateAsync({ orgId })
      orgQuery.refetch()
    } catch (error) {
      console.error('Failed to join organization:', error)
    }
  }

  const handleLeave = async () => {
    if (!confirm('Är du säker på att du vill lämna organisationen?')) return
    try {
      await leaveMutation.mutateAsync({ orgId })
      orgQuery.refetch()
    } catch (error) {
      console.error('Failed to leave organization:', error)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        {org.coverImageUrl ? (
          <Image
            src={org.coverImageUrl}
            alt={org.name}
            fill
            className={styles.heroImage}
            priority
          />
        ) : (
          <div className={styles.heroImage} style={{ backgroundColor: 'var(--bg-secondary)' }} />
        )}
      </div>

      <div className={styles.headerSection}>
        <div className={styles.orgLogo}>🏢</div>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>
            {org.name}
            {org.verified && <span className={styles.verifiedBadge}>✓ Verifierad</span>}
          </h1>
          <div className={styles.metaRow}>
            <span>{org._count.members} medlemmar</span>
            <span>{org.type}</span>
            {org.locationName && <span>{org.locationName}</span>}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.main}>
          {org.description && (
            <div className={styles.descriptionSection}>
              <h2 className={styles.sectionTitle}>Om organisationen</h2>
              <p className={styles.description}>{org.description}</p>
            </div>
          )}

          {org._count && org._count.events > 0 && (
            <div>
              <h2 className={styles.sectionTitle}>Event ({org._count.events})</h2>
              <div className={styles.eventsGrid}>
                {[...Array(Math.min(org._count.events, 6))].map((_, i) => (
                  <div key={i} className={styles.eventItem}>
                    <h4 className={styles.eventName}>Event {i + 1}</h4>
                    <p className={styles.eventMeta}>Kommande event</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Medlemmar</h3>
            <p className={styles.infoValue}>{org._count.members}</p>
          </div>

          {org._count && org._count.events > 0 && (
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Event</h3>
              <p className={styles.infoValue}>{org._count.events}</p>
            </div>
          )}

          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Typ</h3>
            <p className={styles.infoText}>{org.type}</p>
          </div>

          {org.contactEmail && (
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Kontakt</h3>
              <p className={styles.infoText}>{org.contactEmail}</p>
            </div>
          )}

          <div className={styles.actionButton}>
            {!isMember ? (
              <Button variant="primary" onClick={handleJoin} disabled={joinMutation.isPending}>
                {joinMutation.isPending ? 'Går med...' : 'Gå med i organisation'}
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={handleLeave} disabled={leaveMutation.isPending}>
                  {leaveMutation.isPending ? 'Lämnar...' : 'Lämna organisation'}
                </Button>
                {canAdmin && (
                  <Link href={`/orgs/${orgId}/admin`} style={{ textDecoration: 'none', marginTop: 'var(--space-2)', display: 'block' }}>
                    <Button variant="primary">Admin</Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
