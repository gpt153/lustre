'use client'

import { useRouter } from 'next/navigation'
import { AdsManagerScreen } from '@lustre/app/src/screens/AdsManagerScreen'

export default function AdsPage() {
  const router = useRouter()

  return (
    <AdsManagerScreen
      onCampaignPress={(campaignId) => router.push(`/ads/${campaignId}`)}
      onCreatePress={() => router.push('/ads/create')}
    />
  )
}
