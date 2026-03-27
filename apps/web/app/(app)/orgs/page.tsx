'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { trpc } from '@lustre/api'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonCard } from '@/components/common/Skeleton'
import { Button } from '@/components/common/Button'
import styles from './page.module.css'

export default function OrgsPage() {
  const listQuery = trpc.org.list.useInfiniteQuery(
    { limit: 12 },
    { getNextPageParam: (lastPage: any) => lastPage.nextCursor }
  )

  const orgs = listQuery.data?.pages.flatMap((page: any) => page.orgs) ?? []

  const loadMoreRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!loadMoreRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
          listQuery.fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [listQuery.hasNextPage, listQuery.isFetchingNextPage])

  if (listQuery.isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Organisationer</h1>
          <Link href="/orgs/create" style={{ textDecoration: 'none' }}>
            <Button variant="primary">Skapa organisation</Button>
          </Link>
        </div>

        <div className={styles.gridContainer}>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Organisationer</h1>
        <Link href="/orgs/create" style={{ textDecoration: 'none' }}>
          <Button variant="primary">Skapa organisation</Button>
        </Link>
      </div>

      {orgs.length === 0 ? (
        <EmptyState
          title="Inga organisationer hittades"
          description="Börja skapa en organisation för att komma igång."
          action={
            <Link href="/orgs/create" style={{ textDecoration: 'none' }}>
              <Button variant="primary">Skapa organisation</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className={styles.gridContainer}>
            {orgs.map((org: any) => (
              <Link key={org.id} href={`/orgs/${org.id}`} style={{ textDecoration: 'none' }}>
                <OrgCard org={org} />
              </Link>
            ))}
          </div>

          <div ref={loadMoreRef} style={{ height: 1, margin: 'var(--space-4) 0' }} />

          {listQuery.isFetchingNextPage && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
              <div style={{ width: 24, height: 24, border: '2px solid var(--color-copper)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function OrgCard({ org }: { org: any }) {
  return (
    <div className={styles.orgCard}>
      <div className={styles.orgHeader}>
        <div className={styles.orgLogo}>🏢</div>
        <div className={styles.orgInfo}>
          <h3 className={styles.orgName}>{org.name}</h3>
          {org.verified && (
            <div className={styles.verifiedBadge}>
              ✓ Verifierad
            </div>
          )}
        </div>
      </div>

      {org.description && (
        <p className={styles.description}>{org.description}</p>
      )}

      <div className={styles.meta}>
        <span>{org._count.members} medlemmar</span>
        {org.locationName && <span>{org.locationName}</span>}
        <span>{org.type}</span>
      </div>

      <div className={styles.viewButton}>
        <Button variant="secondary" size="md" type="button">
          Visa detaljer
        </Button>
      </div>
    </div>
  )
}
