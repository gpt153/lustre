'use client'

import { useRouter } from 'next/navigation'
import { YStack, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import { ProfileEditScreen } from '@lustre/app/src/screens/ProfileEditScreen'
import { useProfile } from '@lustre/app/src/hooks/useProfile'

export default function ProfileEditPage() {
  const router = useRouter()
  const { profile, isLoading } = useProfile()
  const updateMutation = trpc.profile.update.useMutation()

  if (isLoading || !profile) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner size="large" color="$primary" />
      </YStack>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      <ProfileEditScreen
        initialValues={profile}
        onSave={(values) => {
          updateMutation.mutate(values, {
            onSuccess: () => router.push('/profile'),
          })
        }}
        onCancel={() => router.push('/profile')}
        isSaving={updateMutation.isPending}
      />
    </div>
  )
}
