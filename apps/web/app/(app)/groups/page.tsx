'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { trpc } from '@lustre/api'
import { GroupCard } from '@/components/groups/GroupCard'
import { EmptyState } from '@/components/common/EmptyState'
import { SkeletonCard } from '@/components/common/Skeleton'
import { Button } from '@/components/common/Button'
import styles from './page.module.css'

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const listQuery = trpc.group.list.useInfiniteQuery(
    { limit: 12 },
    { getNextPageParam: (lastPage: any) => lastPage.nextCursor }
  )

  const searchQuery_trpc = trpc.group.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  )

  const groups = searchQuery.length > 0
    ? searchQuery_trpc.data ?? []
    : listQuery.data?.pages.flatMap((page: any) => page.groups) ?? []

  const isLoading = searchQuery.length > 0 ? searchQuery_trpc.isLoading : listQuery.isLoading

  const loadMoreRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!loadMoreRef.current || searchQuery.length > 0) return
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
  }, [listQuery.hasNextPage, listQuery.isFetchingNextPage, searchQuery.length])

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Grupper</h1>
          <Link href="/groups/create" style={{ textDecoration: 'none' }}>
            <Button variant="primary">Skapa grupp</Button>
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
        <h1 className={styles.pageTitle}>Grupper</h1>
        <Link href="/groups/create" style={{ textDecoration: 'none' }}>
          <Button variant="primary">Skapa grupp</Button>
        </Link>
      </div>

      <div className={styles.searchBox}>
        <input
          className={styles.searchInput}
          placeholder="Sök grupper..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          type="text"
        />
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title="Inga grupper hittades"
          description={searchQuery.length > 0 ? 'Försök en annan sökning.' : 'Börja skapa en grupp för att komma igång.'}
          action={
            !searchQuery && (
              <Link href="/groups/create" style={{ textDecoration: 'none' }}>
                <Button variant="primary">Skapa grupp</Button>
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className={styles.gridContainer}>
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>

          {!searchQuery && (
            <>
              <div ref={loadMoreRef} className={styles.loadMoreTrigger} />

              {listQuery.isFetchingNextPage && (
                <div className={styles.loadMoreSpinner}>
                  <div style={{ width: 24, height: 24, border: '2px solid var(--color-copper)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                </div>
              )}
            </>
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
