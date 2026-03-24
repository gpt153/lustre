'use client'

import { useRouter } from 'next/navigation'
import { trpc } from '@lustre/api'
import { OnboardingWizard } from '@lustre/app/src/components/OnboardingWizard'
import { useProfileStore } from '@lustre/app/src/stores/profileStore'

export default function OnboardingPage() {
  const router = useRouter()
  const createProfile = trpc.profile.create.useMutation()
  const profileStore = useProfileStore()

  const handleComplete = (data: any) => {
    createProfile.mutate(data, {
      onSuccess: () => {
        profileStore.setHasProfile(true)
        router.push('/profile')
      },
    })
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      <OnboardingWizard onComplete={handleComplete} isSubmitting={createProfile.isPending} />
    </div>
  )
}
