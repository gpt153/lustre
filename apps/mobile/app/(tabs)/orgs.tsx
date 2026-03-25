import { OrgListScreen } from '@lustre/app'
import { useRouter } from 'expo-router'

export default function OrgsTab() {
  const router = useRouter()
  return (
    <OrgListScreen
      onOrgPress={(orgId) => router.push(`/orgs/${orgId}` as any)}
      onCreatePress={() => router.push('/orgs/create' as any)}
    />
  )
}
