'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { m } from 'motion/react'
import { springs, fadeIn, staggerContainer, slideUp } from '@/lib/motion'
import { api as _api } from '@/lib/trpc'
import styles from './page.module.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any

type Category =
  | 'ANATOMY'
  | 'PLEASURE'
  | 'STI_PREVENTION'
  | 'MENTAL_HEALTH'
  | 'RELATIONSHIPS'
  | 'KINK_SAFETY'
  | 'LGBTQ'
  | 'AGING'

interface Topic {
  id: string
  slug: string
  title: string
  description: string
  category: Category
  articleCount: number
}

const CATEGORY_META: Record<Category, { label: string; emoji: string; color: string }> = {
  ANATOMY: { label: 'Anatomi', emoji: '🫀', color: 'hsl(340, 60%, 55%)' },
  PLEASURE: { label: 'Njutning', emoji: '✨', color: 'hsl(42, 57%, 46%)' },
  STI_PREVENTION: { label: 'STI-prevention', emoji: '🛡️', color: 'hsl(210, 60%, 50%)' },
  MENTAL_HEALTH: { label: 'Mental hälsa', emoji: '🧠', color: 'hsl(270, 45%, 55%)' },
  RELATIONSHIPS: { label: 'Relationer', emoji: '💞', color: 'hsl(355, 65%, 55%)' },
  KINK_SAFETY: { label: 'Kink-säkerhet', emoji: '🔒', color: 'hsl(28, 52%, 46%)' },
  LGBTQ: { label: 'HBTQ', emoji: '🌈', color: 'hsl(200, 65%, 50%)' },
  AGING: { label: 'Åldrande', emoji: '🌿', color: 'hsl(130, 35%, 45%)' },
}

const MOCK_TOPICS: Topic[] = [
  { id: 't1', slug: 'grundlaggande-anatomi', title: 'Grundläggande anatomi', description: 'Lär dig om kroppens uppbyggnad och erogena zoner.', category: 'ANATOMY', articleCount: 3 },
  { id: 't2', slug: 'klitoris-och-orgasm', title: 'Klitoris och orgasm', description: 'Vetenskapen bakom klitoris och njutning.', category: 'ANATOMY', articleCount: 2 },
  { id: 't3', slug: 'sensorisk-njutning', title: 'Sensorisk njutning', description: 'Utforska beröringens psykologi och fysiologi.', category: 'PLEASURE', articleCount: 4 },
  { id: 't4', slug: 'kondomanvandning', title: 'Kondomanvändning', description: 'Effektiv användning och val av kondomer.', category: 'STI_PREVENTION', articleCount: 2 },
  { id: 't5', slug: 'sti-testning', title: 'STI-testning', description: 'Hur och när du bör testa dig för könssjukdomar.', category: 'STI_PREVENTION', articleCount: 3 },
  { id: 't6', slug: 'sexuell-angest', title: 'Sexuell ångest', description: 'Hantera prestationsångest och sexuell stress.', category: 'MENTAL_HEALTH', articleCount: 3 },
  { id: 't7', slug: 'kroppsbild', title: 'Kroppsbild & sexualitet', description: 'Hur relationen till din kropp påverkar intimitet.', category: 'MENTAL_HEALTH', articleCount: 2 },
  { id: 't8', slug: 'kommunikation-i-relationer', title: 'Kommunikation i relationer', description: 'Öppen och ärlig dialog om behov och gränser.', category: 'RELATIONSHIPS', articleCount: 5 },
  { id: 't9', slug: 'safeword-och-eftervard', title: 'Safewords & eftervård', description: 'Protokoll för trygg BDSM-lek och emotionell återhämtning.', category: 'KINK_SAFETY', articleCount: 3 },
  { id: 't10', slug: 'hbtq-sexualitet', title: 'HBTQ-sexualitet', description: 'Sexuell hälsa och intimitet för HBTQ-personer.', category: 'LGBTQ', articleCount: 4 },
  { id: 't11', slug: 'sex-och-aldre', title: 'Sex och åldrande', description: 'Intimitet, hormoner och välmående för 40+.', category: 'AGING', articleCount: 2 },
  { id: 't12', slug: 'foreplay', title: 'Förspel & närvaro', description: 'Konsten att vara fullt närvarande och bygga spänning.', category: 'PLEASURE', articleCount: 3 },
]

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as Category[]

export default function SexualHealthPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<Category | 'ALL'>('ALL')

  useEffect(() => {
    async function load() {
      try {
        const result = await api.education.listTopics.query()
        setTopics(result)
      } catch {
        setTopics(MOCK_TOPICS)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const displayTopics = isLoading ? MOCK_TOPICS : topics
  const filtered = activeCategory === 'ALL'
    ? displayTopics
    : displayTopics.filter(t => t.category === activeCategory)

  // Group by category for display
  const groupedByCategory = ALL_CATEGORIES.reduce<Record<Category, Topic[]>>((acc, cat) => {
    acc[cat] = filtered.filter(t => t.category === cat)
    return acc
  }, {} as Record<Category, Topic[]>)

  return (
    <div className={styles.page}>
      {/* Back */}
      <m.div variants={fadeIn} initial="initial" animate="animate" transition={springs.soft}>
        <Link href="/learn" className={styles.backLink}>← Lärande</Link>
      </m.div>

      {/* Header */}
      <m.div
        className={styles.header}
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ ...springs.soft, delay: 0.05 }}
      >
        <div className={styles.headerIcon} aria-hidden="true">🩺</div>
        <div className={styles.headerText}>
          <span className={styles.eyebrow}>Kunskapsbas</span>
          <h1 className={styles.heading}>Sexuell hälsa</h1>
          <p className={styles.subheading}>
            Evidensbaserade artiklar, poddar och quiz om kropp, njutning, relationer och välmående
          </p>
        </div>
      </m.div>

      {/* Category filter */}
      <m.div
        className={styles.filterRow}
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={{ ...springs.soft, delay: 0.1 }}
      >
        <button
          className={[styles.filterChip, activeCategory === 'ALL' ? styles.filterActive : ''].join(' ')}
          onClick={() => setActiveCategory('ALL')}
        >
          Alla
        </button>
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            className={[styles.filterChip, activeCategory === cat ? styles.filterActive : ''].join(' ')}
            onClick={() => setActiveCategory(cat)}
            style={activeCategory === cat ? { '--chip-color': CATEGORY_META[cat].color } as React.CSSProperties : undefined}
          >
            <span>{CATEGORY_META[cat].emoji}</span>
            <span>{CATEGORY_META[cat].label}</span>
          </button>
        ))}
      </m.div>

      {/* Topics — grouped or flat */}
      {activeCategory === 'ALL' ? (
        // Show all categories grouped
        ALL_CATEGORIES.map(cat => {
          const catTopics = groupedByCategory[cat]
          if (catTopics.length === 0) return null
          return (
            <section key={cat} className={styles.categorySection}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryEmoji}>{CATEGORY_META[cat].emoji}</span>
                <span className={styles.categoryLabel}>{CATEGORY_META[cat].label}</span>
                <span className={styles.categoryCount}>{catTopics.length}</span>
              </div>
              <m.div
                className={styles.topicGrid}
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {catTopics.map((topic, i) => (
                  <TopicCard key={topic.id} topic={topic} index={i} />
                ))}
              </m.div>
            </section>
          )
        })
      ) : (
        // Show flat filtered list
        <m.div
          className={styles.topicGrid}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {filtered.map((topic, i) => (
            <TopicCard key={topic.id} topic={topic} index={i} />
          ))}
        </m.div>
      )}

      {filtered.length === 0 && !isLoading && (
        <m.div
          className={styles.empty}
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          <span className={styles.emptyIcon}>🔍</span>
          <p>Inga ämnen i den här kategorin än.</p>
        </m.div>
      )}
    </div>
  )
}

function TopicCard({ topic, index }: { topic: Topic; index: number }) {
  const meta = CATEGORY_META[topic.category]

  return (
    <m.div
      variants={slideUp}
      transition={{ ...springs.soft, delay: index * 0.05 }}
    >
      <Link
        href={`/learn/sexual-health/${topic.slug}`}
        className={styles.topicCard}
        style={{ '--topic-color': meta.color } as React.CSSProperties}
      >
        <div className={styles.topicIcon} aria-hidden="true">{meta.emoji}</div>
        <div className={styles.topicBody}>
          <h3 className={styles.topicTitle}>{topic.title}</h3>
          <p className={styles.topicDesc}>{topic.description}</p>
        </div>
        <div className={styles.topicFooter}>
          <span className={styles.topicArticleCount}>{topic.articleCount} artiklar</span>
          <span className={styles.topicArrow} aria-hidden="true">→</span>
        </div>
      </Link>
    </m.div>
  )
}
