import { useRouter } from 'expo-router'
import { trpc } from '@lustre/api'
import { OnboardingWizard } from '@lustre/app/src/components/OnboardingWizard'
import { useProfileStore } from '@lustre/app/src/stores/profileStore'

export default function OnboardingScreen() {
  const router = useRouter()
  const createProfile = trpc.profile.create.useMutation()
  const profileStore = useProfileStore()

  const handleComplete = (data: any) => {
    createProfile.mutate(data, {
      onSuccess: () => {
        profileStore.setHasProfile(true)
        router.replace('/(tabs)')
      },
    })
  }

  return (
    <OnboardingWizard onComplete={handleComplete} isSubmitting={createProfile.isPending} />
  )
}
