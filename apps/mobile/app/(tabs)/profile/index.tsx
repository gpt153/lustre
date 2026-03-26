import { useState } from 'react'
import { YStack, Text, Spinner } from 'tamagui'
import { useRouter } from 'expo-router'
import { trpc } from '@lustre/api'
import { useAuth, useAuthStore } from '@lustre/app'
import { ProfileViewScreen } from '@lustre/app/src/screens/ProfileViewScreen'
import { ProfileEditScreen } from '@lustre/app/src/screens/ProfileEditScreen'
import { useProfile } from '@lustre/app/src/hooks/useProfile'

export default function ProfileIndexScreen() {
  const router = useRouter()
  const auth = useAuth()
  const logout = useAuthStore((state) => state.logout)
  const { profile, isLoading, needsOnboarding } = useProfile()
  const [editing, setEditing] = useState(false)
  const logoutMutation = trpc.auth.logout.useMutation()
  const updateMutation = trpc.profile.update.useMutation()

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color="$primary" />
      </YStack>
    )
  }

  if (needsOnboarding || !profile) {
    router.replace('/(auth)/onboarding')
    return null
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => { logout(); router.replace('/(auth)/welcome') },
      onError: () => { logout(); router.replace('/(auth)/welcome') },
    })
  }

  if (editing) {
    return (
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
    )
  }

  return (
    <ProfileViewScreen
      profile={profile}
      isOwnProfile
      onEdit={() => setEditing(true)}
      onLogout={handleLogout}
    />
  )
}
