'use client'

import styles from './StreakCounter.module.css'

interface HeatmapDataPoint {
  date: Date
  level: 0 | 1 | 2 | 3 | 4
}

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
  heatmapData?: HeatmapDataPoint[]
}

function generateHeatmapData(weeks: number = 52): HeatmapDataPoint[] {
  const data: HeatmapDataPoint[] = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - weeks * 7)

  for (let i = 0; i < weeks * 7; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const level = (Math.random() * 5) as 0 | 1 | 2 | 3 | 4
    data.push({ date, level })
  }

  return data
}

export function StreakCounter({
  currentStreak,
  longestStreak,
  heatmapData,
}: StreakCounterProps) {
  const data = heatmapData || generateHeatmapData()
  const hasStreak = currentStreak > 0

  return (
    <div className={styles.streakCounter}>
      <div className={styles.streakIcon}>{hasStreak ? '🔥' : '💤'}</div>
      <div className={styles.streakNumber}>{currentStreak}</div>
      <div className={styles.streakLabel}>
        {hasStreak ? 'dagar i rad' : 'ingen streak'}
      </div>
      {longestStreak > 0 && (
        <div className={styles.streakLabel}>
          Bäst: {longestStreak} dagar
        </div>
      )}

      <div className={styles.heatmap}>
        {data.map((point, idx) => (
          <div
            key={`${point.date.toISOString()}-${idx}`}
            className={`${styles.heatmapCell} ${styles[`heatmapLevel${point.level}`]}`}
            title={`${point.date.toLocaleDateString('sv-SE')}: ${point.level} activit${point.level !== 1 ? 'ies' : 'y'}`}
          />
        ))}
      </div>
    </div>
  )
}
