import { View } from 'react-native'

interface MatchCeremonyProps {
  visible: boolean
  currentUserPhotoUrl: string
  matchedUserPhotoUrl: string
  matchedUserName?: string
  onSendMessage: () => void
  onContinueDiscovering: () => void
  onDismiss: () => void
}

export function MatchCeremony(_props: MatchCeremonyProps) {
  return <View />
}
