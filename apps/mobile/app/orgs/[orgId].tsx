import { OrgDetailScreen } from '@lustre/app'
import { useLocalSearchParams, useRouter } from 'expo-router'

export default function OrgDetailPage() {
  const { orgId } = useLocalSearchParams<{ orgId: string }>()
  const router = useRouter()

  if (!orgId) {
    return null
  }

  return (
    <OrgDetailScreen
      orgId={orgId}
      onAdminPress={() => router.push(`/orgs/${orgId}/admin` as any)}
    />
  )
}
