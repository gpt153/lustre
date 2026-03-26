'use client'

import { useRouter } from 'next/navigation'
import { AdCreateScreen } from '@lustre/app/src/screens/AdCreateScreen'

export default function AdCreatePage() {
  const router = useRouter()

  return (
    <AdCreateScreen
      onSuccess={(campaignId) => router.push(`/ads/${campaignId}`)}
      onCancel={() => router.push('/ads')}
    />
  )
}
