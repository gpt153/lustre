'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { m, AnimatePresence } from 'motion/react'
import { springs, fadeIn, staggerContainer, slideUp } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any
import { useAuthStore } from '@/lib/stores'

import Button from '@/components/common/Button'
import Skeleton from '@/components/common/Skeleton'
import styles from './page.module.css'

interface GroupDetail {
  id: string
  name: string
  description: string
  memberCount: number
  visibility: 'OPEN' | 'PRIVATE'
  isJoined: boolean
  tags?: string[]
  createdAt: string
  members: Array<{ id: string; displayName: string; photoUrl?: string; role?: string }>
  recentPosts: Array<{ id: string; author: string; content: string; createdAt: string }>
}

const MOCK_GROUPS: Record<string, GroupDetail> = {
  g1: {
    id: 'g1',
    name: 'Stockholms Polyamori',
    description:
      'En trygg gemenskap för polyamorösa och icke-monogama i Stockholmsregionen. Vi träffas månadsvis för diskussioner, stöd och sociala aktiviteter. Alla är välkomna oavsett var de befinner sig på sin polyamoriresa — nybörjare som erfarna.',
    memberCount: 187,
    visibility: 'OPEN',
    isJoined: true,
    tags: ['Polyamori', 'Stockholm', 'Community', 'Icke-monogami'],
    createdAt: '2025-09-15T00:00:00Z',
    members: [
      { id: 'u1', displayName: 'Emma', role: 'owner' },
      { id: 'u2', displayName: 'Sofia' },
      { id: 'u3', displayName: 'Lina' },
      { id: 'u4', displayName: 'Jonas' },
      { id: 'u5', displayName: 'Maja' },
      { id: 'u6', displayName: 'Alex' },
    ],
    recentPosts: [
      {
        id: 'p1',
        author: 'Emma',
        content: 'Nästa träff är den 12 april kl 18:00 på Södra Bar. Alla är välkomna! Ta gärna med en vän.',
        createdAt: '2026-03-25T14:30:00Z',
      },
      {
        id: 'p2',
        author: 'Sofia',
        content: 'Rekommenderar boken "More Than Two" för alla nybörjare — finaste intro till polyamori jag hittat.',
        createdAt: '2026-03-23T09:15:00Z',
      },
      {
        id: 'p3',
        author: 'Lina',
        content: 'Kul att se så många nya ansikten på senaste träffen! Hoppas ni alla trivdes.',
        createdAt: '2026-03-20T18:00:00Z',
      },
    ],
  },
  g2: {
    id: 'g2',
    name: 'BDSM & Kink — Sverige',
    description:
      'Rikstäckande grupp för BDSM-intresserade. Diskutera allt från säkerhet och samtycke till gear och scener i en respektfull miljö. Vi har nolltolerans mot oönskat beteende.',
    memberCount: 432,
    visibility: 'OPEN',
    isJoined: false,
    tags: ['BDSM', 'Kink', 'Sverige', 'Säkerhet'],
    createdAt: '2025-06-01T00:00:00Z',
    members: [
      { id: 'u7', displayName: 'Karin', role: 'owner' },
      { id: 'u8', displayName: 'David' },
      { id: 'u9', displayName: 'Anna' },
      { id: 'u10', displayName: 'Per' },
    ],
    recentPosts: [
      {
        id: 'p4',
        author: 'Karin',
        content: 'Påminnelse: Nästa Munch är den 8 april. Lokalen är begränsad så anmäl dig tidigt!',
        createdAt: '2026-03-26T12:00:00Z',
      },
      {
        id: 'p5',
        author: 'David',
        content: 'Bra diskussion om kommunikation och gränser på senaste träffen. Tack alla för era bidrag.',
        createdAt: '2026-03-22T20:30:00Z',
      },
    ],
  },
}

function getFallbackGroup(id: string): GroupDetail {
  return (
    MOCK_GROUPS[id] ?? {
      id,
      name: 'Grupp',
      description: 'Beskrivning saknas.',
      memberCount: 0,
      visibility: 'OPEN',
      isJoined: false,
      createdAt: new Date().toISOString(),
      members: [],
      recentPosts: [],
    }
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Idag'
  if (days === 1) return 'Igår'
  if (days < 7) return `${days} dagar sedan`
  return new Date(dateStr).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

export default function GroupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params?.groupId as string
  const userId = useAuthStore((s) => s.userId)

  const [group, setGroup] = useState<GroupDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [joinLoading, setJoinLoading] = useState(false)
  const [isJoined, setIsJoined] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const result = await api.group.get.query({ groupId })
        setGroup(result)
        setIsJoined(result.isJoined ?? false)
      } catch {
        const fallback = getFallbackGroup(groupId)
        setGroup(fallback)
        setIsJoined(fallback.isJoined)
      } finally {
        setIsLoading(false)
      }
    }
    if (groupId) load()
  }, [groupId])

  async function handleJoinLeave() {
    if (!userId || !group) return
    setJoinLoading(true)
    try {
      if (isJoined) {
        await api.group.leave.mutate({ groupId: group.id })
        setIsJoined(false)
      } else {
        await api.group.join.mutate({ groupId: group.id })
        setIsJoined(true)
      }
    } catch {
      setIsJoined((prev) => !prev)
    } finally {
      setJoinLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Back button */}
      <m.button
        className={styles.backBtn}
        onClick={() => router.back()}
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={springs.soft}
        aria-label="Tillbaka till grupper"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Tillbaka
      </m.button>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <m.div
            key="skeleton"
            className={styles.skeletonContainer}
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="initial"
          >
            <div className={styles.skeletonHeader}>
              <Skeleton shape="box" width={72} height={72} borderRadius={12} />
              <div className={styles.skeletonHeaderText}>
                <Skeleton shape="text" width="60%" height={24} />
                <Skeleton shape="text" width="40%" height={14} />
              </div>
            </div>
            <Skeleton shape="text" lines={3} height={14} />
            <Skeleton shape="text" width="100%" height={44} borderRadius={10} />
          </m.div>
        ) : group ? (
          <m.div
            key="content"
            className={styles.content}
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={springs.soft}
          >
            {/* Group header */}
            <div className={styles.groupHeader}>
              <div className={styles.groupAvatar} aria-hidden="true">
                {group.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.groupHeaderInfo}>
                <h1 className={styles.groupName}>{group.name}</h1>
                <div className={styles.groupMeta}>
                  <span className={styles.memberCountBadge}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <circle cx="4.5" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M1 11c0-1.9 1.6-3.5 3.5-3.5S8 9.1 8 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      <circle cx="10" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M11.5 11c0-1.3-.8-2.4-2-2.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    {group.memberCount} medlemmar
                  </span>
                  <span className={`${styles.visibilityBadge} ${group.visibility === 'PRIVATE' ? styles.private : styles.open}`}>
                    {group.visibility === 'PRIVATE' ? 'Privat' : 'Öppen'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className={styles.section}>
              <h2 className={styles.sectionHeading}>Om gruppen</h2>
              <p className={styles.description}>{group.description}</p>
              {group.tags && group.tags.length > 0 && (
                <div className={styles.tags}>
                  {group.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Join/Leave */}
            <div className={styles.joinSection}>
              {isJoined && (
                <div className={styles.joinedConfirmed}>
                  <span className={styles.joinedCheck}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  Du är medlem
                </div>
              )}
              <Button
                variant={isJoined ? 'secondary' : 'primary'}
                size="lg"
                fullWidth
                loading={joinLoading}
                onClick={handleJoinLeave}
                className={!isJoined ? styles.copperBtn : undefined}
              >
                {isJoined ? 'Lämna gruppen' : 'Gå med'}
              </Button>
            </div>

            {/* Recent posts placeholder */}
            <div className={styles.section}>
              <h2 className={styles.sectionHeading}>Senaste inlägg</h2>
              {group.recentPosts.length > 0 ? (
                <m.div
                  className={styles.postsList}
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {group.recentPosts.map((post) => (
                    <m.div
                      key={post.id}
                      className={styles.postCard}
                      variants={slideUp}
                      transition={springs.soft}
                    >
                      <div className={styles.postHeader}>
                        <div className={styles.postAvatar} aria-hidden="true">
                          {post.author.charAt(0)}
                        </div>
                        <div className={styles.postMeta}>
                          <span className={styles.postAuthor}>{post.author}</span>
                          <span className={styles.postTime}>{timeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                      <p className={styles.postContent}>{post.content}</p>
                    </m.div>
                  ))}
                </m.div>
              ) : (
                <p className={styles.noPostsText}>Inga inlägg ännu. Bli den första att dela något!</p>
              )}
            </div>

            {/* Members */}
            <div className={styles.section}>
              <h2 className={styles.sectionHeading}>Medlemmar ({group.memberCount})</h2>
              <div className={styles.memberGrid}>
                {group.members.slice(0, 12).map((member) => (
                  <div key={member.id} className={styles.memberItem}>
                    <div className={`${styles.memberAvatar} ${member.role === 'owner' ? styles.ownerAvatar : ''}`}>
                      {member.displayName.charAt(0)}
                    </div>
                    <span className={styles.memberName}>{member.displayName}</span>
                    {member.role === 'owner' && (
                      <span className={styles.ownerBadge} title="Grundare">★</span>
                    )}
                  </div>
                ))}
                {group.memberCount > 12 && (
                  <div className={styles.memberItem}>
                    <div className={styles.memberAvatarMore}>
                      +{group.memberCount - 12}
                    </div>
                    <span className={styles.memberName}>fler</span>
                  </div>
                )}
              </div>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
