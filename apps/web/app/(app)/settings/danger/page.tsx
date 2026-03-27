'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Modal from '@/components/common/Modal'
import { addToast } from '@/lib/toast-store'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any
import { useAuthStore } from '@/lib/stores'

const DELETE_CONFIRM_WORD = 'DELETE'

function WarningTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 3L1.5 17.5h17L10 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14.75" r="0.75" fill="currentColor" />
    </svg>
  )
}

export default function DangerSettingsPage() {
  const router = useRouter()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [exporting, setExporting] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const confirmMatch = confirmText === DELETE_CONFIRM_WORD

  async function handleExport() {
    setExporting(true)
    try {
      const data = await api.auth.exportData.mutate()
      addToast('Dataexport förberedd — kolla din e-post', 'success')
      if (data?.downloadUrl) {
        window.open(data.downloadUrl, '_blank')
      }
    } catch {
      addToast('Kunde inte exportera data', 'error')
    } finally {
      setExporting(false)
    }
  }

  async function handleDeleteConfirm() {
    if (!confirmMatch) return
    setDeletingAccount(true)
    try {
      await api.auth.deleteAccount.mutate()
      addToast('Konto raderat', 'info')
      clearAuth()
      router.push('/auth/login')
    } catch {
      addToast('Kunde inte radera konto', 'error')
    } finally {
      setDeletingAccount(false)
    }
  }

  function handleModalClose() {
    setDeleteModalOpen(false)
    setConfirmText('')
  }

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.pageTitle}>Farozonen</h1>
        <p className={styles.pageSubtitle}>
          Permanenta åtgärder som inte kan ångras.
        </p>
      </div>

      {/* Danger card */}
      <div className={styles.dangerCard}>
        <div className={styles.dangerHeader}>
          <WarningTriangleIcon className={styles.dangerHeaderIcon} />
          <h2 className={styles.dangerHeaderTitle}>Farliga åtgärder</h2>
        </div>

        <div className={styles.dangerBody}>
          {/* Export data */}
          <div className={styles.actionRow}>
            <div className={styles.actionInfo}>
              <h3 className={styles.actionTitle}>Exportera mina data</h3>
              <p className={styles.actionDesc}>
                Ladda ner en kopia av all din data i JSON-format. Du får en länk via e-post.
              </p>
            </div>
            <Button
              variant="ghost"
              loading={exporting}
              onClick={handleExport}
            >
              Exportera data
            </Button>
          </div>

          <div className={styles.divider} />

          {/* Delete account */}
          <div className={styles.actionRow}>
            <div className={styles.actionInfo}>
              <h3 className={styles.actionTitle}>Radera konto</h3>
              <p className={styles.actionDesc}>
                Raderar permanent ditt konto, profil, foton och alla konversationer.
                Åtgärden kan inte ångras.
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => setDeleteModalOpen(true)}
            >
              Radera konto
            </Button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteModalOpen}
        onClose={handleModalClose}
        title="Radera konto"
        size="sm"
      >
        <div className={styles.modalBody}>
          <div className={styles.warningBox} role="alert">
            <WarningTriangleIcon className={styles.warningIcon} />
            <p className={styles.warningText}>
              <strong>Det här går inte att ångra.</strong> Alla dina data — profil,
              foton, meddelanden och matcher — raderas permanent. Ditt telefonnummer
              är låst i 90 dagar.
            </p>
          </div>

          <div>
            <p
              id="delete-instructions"
              className={styles.confirmInstructions}
            >
              Skriv <code>{DELETE_CONFIRM_WORD}</code> för att bekräfta radering.
            </p>
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={DELETE_CONFIRM_WORD}
              aria-describedby="delete-instructions"
              aria-label="Bekräftelsetext"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={handleModalClose}>
              Avbryt
            </Button>
            <Button
              variant="danger"
              disabled={!confirmMatch}
              loading={deletingAccount}
              onClick={handleDeleteConfirm}
            >
              Radera permanent
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
