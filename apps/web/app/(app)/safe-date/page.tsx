import { AppOnlyPrompt } from '@/components/common/AppOnlyPrompt'

export const metadata = {
  title: 'SafeDate - Lustre',
  description: 'SafeDate finns bara i appen för GPS-säkerhet',
}

export default function SafeDatePage() {
  return (
    <AppOnlyPrompt
      icon="📍"
      title="SafeDate kräver mobilappen"
      description="SafeDate använder GPS-spårning och realtidsövervakning för din säkerhet. Dessa funktioner är beroende av en mobilenhet och fungerar inte på webben."
      feature="safe_date"
      showQRCode={true}
    />
  )
}
