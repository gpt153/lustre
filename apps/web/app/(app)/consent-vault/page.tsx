import { AppOnlyPrompt } from '@/components/common/AppOnlyPrompt'

export const metadata = {
  title: 'ConsentVault - Lustre',
  description: 'ConsentVault finns bara i appen för maximal säkerhet',
}

export default function ConsentVaultPage() {
  return (
    <AppOnlyPrompt
      icon="🔒"
      title="ConsentVault finns i appen"
      description="ConsentVault är en säker valv för inspelningar av intime stunder. Skärmskydd och kryptering kräver mobilappen för att fungera korrekt."
      feature="consent_vault"
      showQRCode={true}
    />
  )
}
