import { FeedList } from '@/components/feed/FeedList'
import styles from './page.module.css'

export const metadata = {
  title: 'Feed — Lustre',
}

export default function FeedPage() {
  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <FeedList />
      </div>
    </div>
  )
}
