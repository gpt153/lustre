'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { m } from 'motion/react'
import { springs, fadeIn, staggerContainer, slideUp } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
import styles from './page.module.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

type LessonStatus = 'completed' | 'in-progress' | 'locked'

interface Lesson {
  id: string
  order: number
  title: string
  description: string
  status: LessonStatus
  assessmentCriteria?: string
}

interface ModuleDetail {
  id: string
  order: number
  title: string
  description: string
  isSpicy: boolean
  badgeName?: string
  badgeEarned: boolean
  completedLessons: number
  lessons: Lesson[]
}

const MOCK_MODULE: ModuleDetail = {
  id: 'mod-2',
  order: 2,
  title: 'Aktiv lyssning',
  description: 'Förstå vad din partner egentligen menar och svara med empati. Aktiv lyssning är grunden för all djup kommunikation.',
  isSpicy: false,
  badgeName: 'Lyssnaren',
  badgeEarned: false,
  completedLessons: 1,
  lessons: [
    {
      id: 'les-2-1',
      order: 1,
      title: 'Vad är aktiv lyssning?',
      description: 'Lär dig skillnaden mellan att höra och att verkligen lyssna.',
      status: 'completed',
    },
    {
      id: 'les-2-2',
      order: 2,
      title: 'Återkopplingstekniker',
      description: 'Öva på att sammanfatta och spegelreflektera vad din partner säger.',
      status: 'in-progress',
    },
    {
      id: 'les-2-3',
      order: 3,
      title: 'Lyssnande under konflikt',
      description: 'Håll lyssnandet aktivt även när samtalet är svårt.',
      status: 'locked',
    },
  ],
}

function statusIcon(status: LessonStatus): string {
  if (status === 'completed') return '✓'
  if (status === 'in-progress') return '◉'
  return '○'
}

function statusLabel(status: LessonStatus): string {
  if (status === 'completed') return 'Avklarad'
  if (status === 'in-progress') return 'Pågår'
  return 'Låst'
}

export default function ModuleDetailPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params = useParams() as any
  const moduleId = params.moduleId as string

  const [module, setModule] = useState<ModuleDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const result = await api.module.get.query({ moduleId })
        setModule(result)
      } catch {
        setModule(MOCK_MODULE)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [moduleId])

  const data = module ?? MOCK_MODULE
  const progress = data.lessons.length > 0
    ? (data.completedLessons / data.lessons.length) * 100
    : 0

  return (
    <div className={styles.page}>
      {/* Back navigation */}
      <m.div variants={fadeIn} initial="initial" animate="animate" transition={springs.soft}>
        <Link href="/learn" className={styles.backLink}>
          ← Alla moduler
        </Link>
      </m.div>

      {/* Module header */}
      <m.div
        className={styles.moduleHeader}
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ ...springs.soft, delay: 0.05 }}
      >
        <div className={styles.moduleTop}>
          <div className={styles.moduleNumberBadge}>
            <span>{data.isSpicy ? '🌶️' : data.order}</span>
          </div>
          <div className={styles.moduleMeta}>
            {data.isSpicy && <span className={styles.spicyPill}>🌶️ 18+</span>}
            {data.badgeEarned && data.badgeName && (
              <span className={styles.badgeEarned}>🏅 {data.badgeName} — Upplåst!</span>
            )}
          </div>
        </div>

        <h1 className={styles.moduleTitle}>{data.title}</h1>
        <p className={styles.moduleDesc}>{data.description}</p>

        {/* Progress bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressMeta}>
            <span className={styles.progressLabel}>FRAMSTEG</span>
            <span className={styles.progressValue}>{data.completedLessons}/{data.lessons.length} lektioner</span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Badge indicator if not earned */}
        {!data.badgeEarned && data.badgeName && (
          <div className={styles.badgePending}>
            <span className={styles.badgePendingIcon}>🎖️</span>
            <span className={styles.badgePendingText}>
              Slutför alla lektioner för att tjäna badgen <strong>{data.badgeName}</strong>
            </span>
          </div>
        )}
      </m.div>

      {/* Lesson list */}
      <section className={styles.lessonsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Lektioner</span>
        </div>

        <m.div
          className={styles.lessonList}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.lessonSkeleton} />
            ))
            : data.lessons.map((lesson, i) => (
              <m.div
                key={lesson.id}
                className={[
                  styles.lessonRow,
                  styles[`status-${lesson.status}`],
                  lesson.status === 'locked' ? styles.lessonLocked : '',
                ].filter(Boolean).join(' ')}
                variants={slideUp}
                transition={{ ...springs.soft, delay: i * 0.07 }}
              >
                <div className={[styles.statusIcon, styles[`icon-${lesson.status}`]].join(' ')} aria-label={statusLabel(lesson.status)}>
                  {statusIcon(lesson.status)}
                </div>

                <div className={styles.lessonBody}>
                  <div className={styles.lessonTop}>
                    <span className={styles.lessonOrder}>Lektion {lesson.order}</span>
                    <span className={[styles.statusPill, styles[`pill-${lesson.status}`]].join(' ')}>
                      {statusLabel(lesson.status)}
                    </span>
                  </div>
                  <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                  <p className={styles.lessonDesc}>{lesson.description}</p>
                </div>

                {lesson.status !== 'locked' && (
                  <div className={styles.personaButtons}>
                    <Link
                      href={`/learn/${moduleId}/lesson/${lesson.id}?persona=coach`}
                      className={styles.personaBtn}
                      title="Träna med Axel (coach)"
                    >
                      <span className={styles.personaAvatar}>🧑</span>
                      <span className={styles.personaName}>Axel</span>
                      <span className={styles.personaRole}>Coach</span>
                    </Link>
                    <Link
                      href={`/learn/${moduleId}/lesson/${lesson.id}?persona=partner`}
                      className={[styles.personaBtn, styles.personaBtnPartner].join(' ')}
                      title="Träna med Sophia (partner)"
                    >
                      <span className={styles.personaAvatar}>👩</span>
                      <span className={styles.personaName}>Sophia</span>
                      <span className={styles.personaRole}>Partner</span>
                    </Link>
                  </div>
                )}
              </m.div>
            ))}
        </m.div>
      </section>
    </div>
  )
}
