import ConversationList from '@/components/chat/ConversationList'
import styles from './page.module.css'

/**
 * Chat landing page — /chat
 *
 * Two-column layout: conversation list on the left,
 * empty right panel prompting the user to select a conversation.
 * On mobile (<900px) only the conversation list is shown.
 */
export default function ChatPage() {
  return (
    <div className={styles.layout}>
      <ConversationList />
      <div className={styles.emptyPanel}>
        <div className={styles.emptyContent}>
          <div className={styles.emptyIcon} aria-hidden="true">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle
                cx="28"
                cy="28"
                r="26"
                stroke="var(--color-copper)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.5"
              />
              <path
                d="M16 22h24M16 30h16"
                stroke="var(--color-copper)"
                strokeWidth="1.75"
                strokeLinecap="round"
                opacity="0.8"
              />
              <circle
                cx="38"
                cy="36"
                r="7"
                fill="var(--color-copper)"
                opacity="0.15"
              />
              <path
                d="M35 36h6M38 33v6"
                stroke="var(--color-copper)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className={styles.emptyHeading}>Välj en konversation</h2>
          <p className={styles.emptyDescription}>
            Klicka på en konversation till vänster för att läsa och skicka
            meddelanden.
          </p>
        </div>
      </div>
    </div>
  )
}
