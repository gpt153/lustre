import { useState } from 'react'
import { ConsentVaultScreen } from '@lustre/app/src/screens/ConsentVaultScreen'
import { ConsentInitiateScreen } from '@lustre/app/src/screens/ConsentInitiateScreen'
import { ConsentConfirmScreen } from '@lustre/app/src/screens/ConsentConfirmScreen'
import { ConsentPlaybackScreen } from '@lustre/app/src/screens/ConsentPlaybackScreen'

type View = 'vault' | 'initiate' | 'confirm' | { type: 'playback'; recordingId: string }

export default function ProfileVaultScreen() {
  const [view, setView] = useState<View>('vault')

  if (view === 'initiate') return <ConsentInitiateScreen onSuccess={() => setView('vault')} />
  if (view === 'confirm') return <ConsentConfirmScreen onConfirmed={() => setView('vault')} />
  if (typeof view === 'object' && view.type === 'playback')
    return <ConsentPlaybackScreen recordingId={view.recordingId} onClose={() => setView('vault')} />

  return (
    <ConsentVaultScreen
      onNewRecording={() => setView('initiate')}
      onPlayback={(recordingId) => setView({ type: 'playback', recordingId })}
    />
  )
}
