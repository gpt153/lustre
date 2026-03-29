import styles from './StickyNote.module.css'

interface StickyNoteProps {
  text: string
  rotation?: 'neg2' | 'pos1' | 'pos3' | 'neg6'
  className?: string
}

const rotationMap: Record<string, string> = {
  neg2: styles.rotateNeg2,
  pos1: styles.rotatePos1,
  pos3: styles.rotatePos3,
  neg6: styles.rotateNeg6,
}

/**
 * StickyNote — Yellow sticky note with push-pin icon.
 * Uses Caveat font and --stitch-secondary-container background.
 */
export default function StickyNote({ text, rotation = 'neg2', className }: StickyNoteProps) {
  const classes = [styles.note, rotationMap[rotation] ?? '', className ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <span className={styles.pin} aria-hidden="true">📌</span>
      <p className={styles.text}>{text}</p>
    </div>
  )
}
