import { OrgAdminScreen } from '@lustre/app'
import { useLocalSearchParams } from 'expo-router'

export default function OrgAdminPage() {
  const { orgId } = useLocalSearchParams<{ orgId: string }>()

  if (!orgId) {
    return null
  }

  return <OrgAdminScreen orgId={orgId} />
}
