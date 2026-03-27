'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { m } from 'motion/react'
import { springs, fadeIn, staggerContainer, slideUp, scaleIn } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
import styles from './page.module.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

interface LessonDetail {
  id: string
  order: number
  title: string
  description: string
  assessmentCriteria: string[]
  isSpicy?: boolean
  moduleTitle?: string
}

const MOCK_LESSON: LessonDetail = {
  id: 'les-2-2',
  order: 2,
  title: 'Återkopplingstekniker',
  description: 'Lär dig att sammanfatta vad din partner säger och spegelreflektera deras känslor. Den här lektionen ger dig konkreta tekniker för att visa att du verkligen lyssnar.',
  assessmentCriteria: [
    'Sammanfattar partnerns ord med egna ord minst en gång',
    'Namnger en känsla som partnern verkar uppleva',
    'Ställer en öppen följdfråga',
    'Undviker att avbryta eller ge råd utan att bli ombedd',
  ],
  isSpicy: false,
  moduleTitle: 'Aktiv lyssning',
}

export default function LessonPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params = useParams() as any
  const searchParams = useSearchParams()
  const moduleId = params.moduleId as string
  const lessonId = params.lessonId as string
  const defaultPersona = searchParams?.get('persona') as 'coach' | 'partner' | null

  const [lesson, setLesson] = useState<LessonDetail | null>(null)
  const [selectedMode, setSelectedMode] = useState<'voice' | 'text'>('text')

  useEffect(() => {
    async function load() {
      try {
        const result = await api.module.get.query({ moduleId })
        const lessonData = result?.lessons?.find((l: { id: string }) => l.id === lessonId)
        if (lessonData) {
          setLesson({ ...lessonData, moduleTitle: result.title })
        } else {
          setLesson(MOCK_LESSON)
        }
      } catch {
        setLesson(MOCK_LESSON)
      }
    }
    load()
  }, [moduleId, lessonId])

  const data = lesson ?? MOCK_LESSON

  function buildSessionUrl(persona: 'coach' | 'partner') {
    const context = encodeURIComponent(`${data.moduleTitle ?? ''}: ${data.title}`)
    return `/coach/start?persona=${persona}&context=${context}&mode=${selectedMode}&lessonId=${lessonId}`
  }

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <m.div
        className={styles.breadcrumb}
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={springs.soft}
      >
        <Link href="/learn" className={styles.breadcrumbLink}>Lärande</Link>
        <span className={styles.breadcrumbSep}>›</span>
        <Link href={`/learn/${moduleId}`} className={styles.breadcrumbLink}>{data.moduleTitle ?? 'Modul'}</Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>Lektion {data.order}</span>
      </m.div>

      {/* Lesson header */}
      <m.div
        className={styles.lessonHeader}
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ ...springs.soft, delay: 0.05 }}
      >
        {data.isSpicy && (
          <span className={styles.spicyBadge}>🌶️ 18+ Spicy</span>
        )}
        <div className={styles.lessonMeta}>
          <span className={styles.lessonOrderLabel}>Lektion {data.order}</span>
        </div>
        <h1 className={styles.lessonTitle}>{data.title}</h1>
        <p className={styles.lessonDesc}>{data.description}</p>
      </m.div>

      {/* Assessment criteria */}
      <m.section
        className={styles.criteriaSection}
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ ...springs.soft, delay: 0.1 }}
      >
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Bedömningskriterier</span>
        </div>
        <div className={styles.criteriaCard}>
          <p className={styles.criteriaIntro}>
            Under sessionen utvärderas du på dessa punkter:
          </p>
          <m.ul
            className={styles.criteriaList}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {data.assessmentCriteria.map((criterion, i) => (
              <m.li
                key={i}
                className={styles.criteriaItem}
                variants={slideUp}
                transition={{ ...springs.soft, delay: i * 0.06 }}
              >
                <span className={styles.criteriaCheck} aria-hidden="true">✦</span>
                <span>{criterion}</span>
              </m.li>
            ))}
          </m.ul>
        </div>
      </m.section>

      {/* Mode selector */}
      <m.section
        className={styles.modeSection}
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={{ ...springs.soft, delay: 0.15 }}
      >
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Sessionsläge</span>
        </div>
        <div className={styles.modePicker}>
          <button
            className={[styles.modeOption, selectedMode === 'text' ? styles.modeActive : ''].join(' ')}
            onClick={() => setSelectedMode('text')}
            aria-pressed={selectedMode === 'text'}
          >
            <span className={styles.modeIcon}>💬</span>
            <div className={styles.modeInfo}>
              <span className={styles.modeName}>Text</span>
              <span className={styles.modeDesc}>Skriv och läs — 2 tokens/min</span>
            </div>
          </button>
          <button
            className={[styles.modeOption, selectedMode === 'voice' ? styles.modeActive : ''].join(' ')}
            onClick={() => setSelectedMode('voice')}
            aria-pressed={selectedMode === 'voice'}
          >
            <span className={styles.modeIcon}>🎙️</span>
            <div className={styles.modeInfo}>
              <span className={styles.modeName}>Röst</span>
              <span className={styles.modeDesc}>Tala naturligt — 15 tokens/min</span>
            </div>
          </button>
        </div>
      </m.section>

      {/* Persona cards */}
      <m.section
        className={styles.personaSection}
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={{ ...springs.soft, delay: 0.2 }}
      >
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Välj persona</span>
        </div>
        <div className={styles.personaGrid}>
          {/* Axel */}
          <m.div
            className={[styles.personaCard, defaultPersona === 'coach' ? styles.personaSelected : ''].join(' ')}
            variants={scaleIn}
            initial="initial"
            animate="animate"
            transition={{ ...springs.soft, delay: 0.22 }}
          >
            <div className={styles.personaAvatar}>
              <span className={styles.personaEmoji}>🧑</span>
              <div className={styles.personaAvatarGlow} aria-hidden="true" />
            </div>
            <div className={styles.personaInfo}>
              <h3 className={styles.personaName}>Axel</h3>
              <span className={styles.personaRoleBadge}>Coach</span>
              <p className={styles.personaBio}>
                Axel är din stöttande storebror-coach. Han ger direkt feedback,
                firar dina framsteg och hjälper dig att växa med varje session.
              </p>
            </div>
            <Link
              href={buildSessionUrl('coach')}
              className={styles.personaStartBtn}
              aria-label={`Starta session med Axel som ${selectedMode === 'voice' ? 'röst' : 'text'}`}
            >
              Starta med Axel
              <span className={styles.btnArrow} aria-hidden="true">→</span>
            </Link>
          </m.div>

          {/* Sophia */}
          <m.div
            className={[styles.personaCard, styles.personaCardPartner, defaultPersona === 'partner' ? styles.personaSelected : ''].join(' ')}
            variants={scaleIn}
            initial="initial"
            animate="animate"
            transition={{ ...springs.soft, delay: 0.28 }}
          >
            <div className={styles.personaAvatar}>
              <span className={styles.personaEmoji}>👩</span>
              <div className={[styles.personaAvatarGlow, styles.personaAvatarGlowPartner].join(' ')} aria-hidden="true" />
            </div>
            <div className={styles.personaInfo}>
              <h3 className={styles.personaName}>Sophia</h3>
              <span className={[styles.personaRoleBadge, styles.partnerBadge].join(' ')}>Partner</span>
              <p className={styles.personaBio}>
                Sophia spelar rollen som din partner. Hon reagerar realistiskt,
                ger naturliga svar och skapar äkta övningssituationer.
              </p>
            </div>
            <Link
              href={buildSessionUrl('partner')}
              className={[styles.personaStartBtn, styles.personaStartBtnPartner].join(' ')}
              aria-label={`Starta session med Sophia som ${selectedMode === 'voice' ? 'röst' : 'text'}`}
            >
              Starta med Sophia
              <span className={styles.btnArrow} aria-hidden="true">→</span>
            </Link>
          </m.div>
        </div>
      </m.section>
    </div>
  )
}
