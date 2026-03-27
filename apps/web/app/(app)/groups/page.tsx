'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { m, AnimatePresence } from 'motion/react'
import { springs, fadeIn, staggerContainer, slideUp } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

import GroupCard, { type GroupCardData } from '@/components/groups/GroupCard'
import EmptyState from '@/components/common/EmptyState'
import Skeleton from '@/components/common/Skeleton'
import styles from './page.module.css'

const MOCK_GROUPS: GroupCardData[] = [
  {
    id: 'g1',
    name: 'Stockholms Polyamori',
    description: 'En trygg gemenskap för polyamorösa och icke-monogama i Stockholmsregionen. Träffas månadsvis för diskussioner, stöd och sociala aktiviteter.',
    memberCount: 187,
    visibility: 'OPEN',
    tags: ['Polyamori', 'Stockholm', 'Community'],
    isJoined: true,
  },
  {
    id: 'g2',
    name: 'BDSM & Kink — Sverige',
    description: 'Rikstäckande grupp för BDSM-intresserade. Diskutera allt från säkerhet och samtycke till gear och scener i en respektfull miljö.',
    memberCount: 432,
    visibility: 'OPEN',
    tags: ['BDSM', 'Kink', 'Sverige'],
    isJoined: false,
  },
  {
    id: 'g3',
    name: 'Queer Dating — Göteborg',
    description: 'Dejting och gemenskap för LGBTQ+ personer i Göteborgsregionen. Anordnar regelbundna mingel och virtuella träffar.',
    memberCount: 93,
    visibility: 'OPEN',
    tags: ['Queer', 'LGBTQ+', 'Göteborg'],
    isJoined: false,
  },
  {
    id: 'g4',
    name: 'Sensuell Yoga & Rörelse',
    description: 'Privat grupp för dig som är intresserad av kroppsnärvaro, tantrisk yoga och rörelsebaserade praktiker. Begränsat antal platser.',
    memberCount: 55,
    visibility: 'PRIVATE',
    tags: ['Yoga', 'Kropp', 'Wellness'],
    isJoined: false,
  },
  {
    id: 'g5',
    name: 'Öppen Relation — Nybörjare',
    description: 'Välkomnande grupp för dig som är ny till öppna relationer. Inga dumma frågor! Dela erfarenheter, be om råd och lär av varandra.',
    memberCount: 274,
    visibility: 'OPEN',
    tags: ['Öppen relation', 'Nybörjare', 'Stöd'],
    isJoined: false,
  },
  {
    id: 'g6',
    name: 'Lustre Creators',
    description: 'Grupp för fotografer, konstnärer och kreativa som vill utforska sinnlighet och kroppslighet i sina skapelser. Dela verk och inspirera varandra.',
    memberCount: 128,
    visibility: 'OPEN',
    tags: ['Konst', 'Foto', 'Kreativitet'],
    isJoined: true,
  },
]

export default function GroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<GroupCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const result = await api.group.list.query({})
        setGroups(Array.isArray(result) && result.length > 0 ? result : MOCK_GROUPS)
      } catch {
        setGroups(MOCK_GROUPS)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <m.div
          className={styles.headerContent}
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={springs.soft}
        >
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.heading}>Grupper</h1>
              <p className={styles.subheading}>Hitta din gemenskap</p>
            </div>
            <m.button
              className={styles.createBtn}
              onClick={() => router.push('/groups/create')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              aria-label="Skapa ny grupp"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Ny grupp
            </m.button>
          </div>
        </m.div>
      </header>

      {/* Content */}
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <m.div
              key="skeleton"
              className={styles.grid}
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="initial"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonHeader}>
                    <Skeleton shape="box" width={48} height={48} borderRadius={8} />
                    <div className={styles.skeletonHeaderText}>
                      <Skeleton shape="text" width="70%" height={16} />
                      <Skeleton shape="text" width="40%" height={12} />
                    </div>
                  </div>
                  <Skeleton shape="text" lines={2} height={13} />
                </div>
              ))}
            </m.div>
          ) : groups.length === 0 ? (
            <m.div
              key="empty"
              variants={slideUp}
              initial="initial"
              animate="animate"
              transition={springs.soft}
            >
              <EmptyState
                title="Inga grupper ännu"
                description="Var den första att skapa en gemenskap på Lustre."
                action={{ label: 'Skapa grupp', onClick: () => router.push('/groups/create') }}
              />
            </m.div>
          ) : (
            <m.div
              key="grid"
              className={styles.grid}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onClick={(id) => router.push(`/groups/${id}`)}
                />
              ))}
            </m.div>
          )}
        </AnimatePresence>
      </main>

      {/* FAB */}
      <m.button
        className={styles.fab}
        onClick={() => router.push('/groups/create')}
        aria-label="Skapa ny grupp"
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.94 }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M11 4v14M4 11h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </m.button>
    </div>
  )
}
