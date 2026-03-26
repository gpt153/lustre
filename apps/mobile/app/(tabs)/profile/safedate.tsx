import { SafeDateActivateScreen } from '@lustre/app/src/screens/SafeDateActivateScreen'
import { SafeDateActiveScreen } from '@lustre/app/src/screens/SafeDateActiveScreen'
import { useSafeDate } from '@lustre/app/src/hooks/useSafeDate'
import { YStack, Spinner } from 'tamagui'

export default function ProfileSafeDateScreen() {
  const { activeSafeDate, isLoading, refetch } = useSafeDate()

  if (isLoading) return (
    <YStack flex={1} alignItems="center" justifyContent="center">
      <Spinner />
    </YStack>
  )
  if (activeSafeDate) return <SafeDateActiveScreen safeDate={activeSafeDate} />
  return <SafeDateActivateScreen onActivated={refetch} />
}
