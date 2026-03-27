'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { trpc } from '@lustre/api'
import { Button } from '@/components/common/Button'
import styles from './page.module.css'

export default function GroupDetailPage() {
  const params = useParams()
  const groupId = params.groupId as string

  const groupQuery = trpc.group.get.useQuery({ id: groupId })
  const membersQuery = trpc.group.members.useQuery({ groupId })
  const joinMutation = trpc.group.join.useMutation()
  const leaveMutation = trpc.group.leave.useMutation()

  if (groupQuery.isLoading) {
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

  if (groupQuery.isError || !groupQuery.data) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Grupp hittades inte</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Försök igen senare eller gå tillbaka till gruppvyn.</p>
        </div>
      </div>
    )
  }

  const group = groupQuery.data
  const isMember = group.isMember
  const isModerator = group.isModerator
  const members = membersQuery.data ?? []

  const handleJoin = async () => {
    try {
      await joinMutation.mutateAsync({ groupId })
      groupQuery.refetch()
    } catch (error) {
      console.error('Failed to join group:', error)
    }
  }

  const handleLeave = async () => {
    if (!confirm('Är du säker på att du vill lämna gruppen?')) return
    try {
      await leaveMutation.mutateAsync({ groupId })
      groupQuery.refetch()
    } catch (error) {
      console.error('Failed to leave group:', error)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        {group.coverImageUrl ? (
          <Image
            src={group.coverImageUrl}
            alt={group.name}
            fill
            className={styles.heroImage}
            priority
          />
        ) : (
          <div className={styles.heroImage} style={{ backgroundColor: 'var(--bg-secondary)' }} />
        )}
      </div>

      <div className={styles.headerSection}>
        <div className={styles.groupAvatar}>👥</div>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{group.name}</h1>
          <div className={styles.metaRow}>
            <span>{group._count.members} medlemmar</span>
            <span>{group.category}</span>
            <span>{group.visibility === 'OPEN' ? 'Öppen' : 'Privat'}</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.main}>
          {group.description && (
            <div className={styles.descriptionSection}>
              <h2 className={styles.sectionTitle}>Om gruppen</h2>
              <p className={styles.description}>{group.description}</p>
            </div>
          )}

          <div className={styles.feedSection}>
            <h2 className={styles.sectionTitle}>Medlemmar ({members.length})</h2>
            {members.length > 0 ? (
              <div className={styles.memberGrid}>
                {members.map((member: any) => (
                  <div key={member.id} className={styles.memberCard}>
                    <div className={styles.memberAvatar}>
                      {(member.user?.displayName ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <p className={styles.memberName}>{member.user?.displayName ?? 'Medlem'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Inga medlemmar ännu.</p>
            )}
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Medlemmar</h3>
            <p className={styles.infoValue}>{group._count.members}</p>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Kategori</h3>
            <p className={styles.infoText}>{group.category}</p>
          </div>

          {group.visibility && (
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Typ</h3>
              <p className={styles.infoText}>{group.visibility === 'OPEN' ? 'Öppen grupp' : 'Privat grupp'}</p>
            </div>
          )}

          <div className={styles.joinButton}>
            {!isMember ? (
              <Button variant="primary" onClick={handleJoin} disabled={joinMutation.isPending}>
                {joinMutation.isPending ? 'Går med...' : 'Gå med i grupp'}
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={handleLeave} disabled={leaveMutation.isPending}>
                  {leaveMutation.isPending ? 'Lämnar...' : 'Lämna grupp'}
                </Button>
                {isModerator && (
                  <Link href={`/groups/${groupId}/moderation`} style={{ textDecoration: 'none', marginTop: 'var(--space-2)', display: 'block' }}>
                    <Button variant="primary">Moderera</Button>
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
