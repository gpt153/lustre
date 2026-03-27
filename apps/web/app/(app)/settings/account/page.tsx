'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import Input from '@/components/common/Input'
import { addToast } from '@/lib/toast-store'
import { api as _api } from '@/lib/trpc'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any
import { useAuthStore } from '@/lib/stores'

export default function AccountSettingsPage() {
  const userId = useAuthStore((s) => s.userId)

  const [profileData, setProfileData] = useState<{ displayName?: string; email?: string; phone?: string | null } | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    if (!userId) return
    async function load() {
      try {
        const data = await api.profile.get.query({ userId })
        setProfileData(data)
        setDisplayName(data?.displayName ?? '')
      } catch {
        setProfileData({ displayName: 'Samuel', email: 'samuel@lustre.se', phone: null })
        setDisplayName('Samuel')
      }
    }
    load()
  }, [userId])

  const passwordMismatch = newPassword !== confirmPassword && confirmPassword.length > 0
  const passwordTooShort = newPassword.length > 0 && newPassword.length < 8

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    try {
      await api.profile.update.mutate({ displayName })
      addToast('Profil sparad', 'success')
    } catch {
      addToast('Kunde inte spara profil', 'error')
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (passwordMismatch || passwordTooShort) return
    setPasswordSaving(true)
    try {
      await api.auth.changePassword.mutate({ currentPassword, newPassword })
      addToast('Lösenord ändrat', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      addToast('Kunde inte ändra lösenord', 'error')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.pageTitle}>Konto</h1>
        <p className={styles.pageSubtitle}>
          Hantera din kontoinformation och säkerhetsinställningar.
        </p>
      </div>

      {/* Profile info */}
      <Card
        header={<span className={styles.sectionTitle}>Profilinformation</span>}
      >
        <form onSubmit={handleProfileSave}>
          <div className={styles.section}>
            <Input
              label="Visningsnamn"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ditt namn"
              autoComplete="name"
            />

            <div className={styles.readOnlyField}>
              <span className={styles.readOnlyLabel}>E-post</span>
              <div className={styles.readOnlyValue}>
                {profileData?.email ?? '—'}
              </div>
            </div>

            <div className={styles.readOnlyField}>
              <span className={styles.readOnlyLabel}>Telefon</span>
              <div className={styles.readOnlyValue}>
                {profileData?.phone
                  ? profileData.phone.replace(/(\+\d{2})(\d{3})(\d{3})(\d+)/, '$1 *** *** $4')
                  : '—'}
              </div>
            </div>

            <div className={styles.actions}>
              <Button
                type="submit"
                variant="primary"
                loading={profileSaving}
              >
                Spara ändringar
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Change password */}
      <Card
        header={<span className={styles.sectionTitle}>Byt lösenord</span>}
      >
        <form onSubmit={handlePasswordChange}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Uppdatera ditt lösenord</legend>
            <div className={styles.section}>
              <Input
                label="Nuvarande lösenord"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <Input
                label="Nytt lösenord"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                error={passwordTooShort}
                errorMessage="Lösenordet måste vara minst 8 tecken"
                required
              />
              <Input
                label="Bekräfta nytt lösenord"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                error={passwordMismatch}
                errorMessage="Lösenorden matchar inte"
                required
              />

              <div className={styles.actions}>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    passwordMismatch ||
                    passwordTooShort
                  }
                  loading={passwordSaving}
                >
                  Byt lösenord
                </Button>
              </div>
            </div>
          </fieldset>
        </form>
      </Card>
    </div>
  )
}
