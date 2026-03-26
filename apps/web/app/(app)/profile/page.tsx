'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { YStack, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import { useAuth, useAuthStore } from '@lustre/app'
import { ProfileViewScreen } from '@lustre/app/src/screens/ProfileViewScreen'
import { ProfileEditScreen } from '@lustre/app/src/screens/ProfileEditScreen'
import { useProfile } from '@lustre/app/src/hooks/useProfile'

export default function ProfilePage() {
  const router = useRouter()
  const { logout } = useAuth()
  const authLogout = useAuthStore((state) => state.logout)
  const { profile, isLoading, needsOnboarding } = useProfile()
  const [editing, setEditing] = useState(false)
  const logoutMutation = trpc.auth.logout.useMutation()
  const updateMutation = trpc.profile.update.useMutation()

  useEffect(() => {
    if (!isLoading && (needsOnboarding || !profile)) {
      router.push('/onboarding')
    }
  }, [isLoading, needsOnboarding, profile, router])

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner size="large" color="$primary" />
      </YStack>
    )
  }

  if (needsOnboarding || !profile) {
    return null
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => { authLogout(); router.push('/auth') },
      onError: () => { authLogout(); router.push('/auth') },
    })
  }

  if (editing) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
        <ProfileEditScreen
          initialValues={profile}
          onSave={(values) => {
            updateMutation.mutate(values, {
              onSuccess: () => setEditing(false),
            })
          }}
          onCancel={() => setEditing(false)}
          isSaving={updateMutation.isPending}
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      <ProfileViewScreen
        profile={profile}
        isOwnProfile
        onEdit={() => setEditing(true)}
        onLogout={handleLogout}
      />
    </div>
  )
}
