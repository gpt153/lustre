'use client'

import { useRouter } from 'next/navigation'
import { trpc } from '@lustre/api'
import { OnboardingWizard } from '@lustre/app/src/components/OnboardingWizard'
import { useProfileStore } from '@lustre/app/src/stores/profileStore'

declare const window: Window & { umami?: { track: (event: string, props?: Record<string, unknown>) => void } }

export default function OnboardingPage() {
  const router = useRouter()
  const createProfile = trpc.profile.create.useMutation()
  const profileStore = useProfileStore()

  const handleStep = (step: number, stepName: string) => {
    if (step === 6) {
      window.umami?.track('onboarding_complete')
    } else {
      window.umami?.track('onboarding_step', { step, stepName })
    }
  }

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
      <OnboardingWizard onComplete={handleComplete} isSubmitting={createProfile.isPending} onStep={handleStep} />
    </div>
  )
}
