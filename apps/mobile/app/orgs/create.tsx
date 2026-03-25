import { CreateOrgScreen } from '@lustre/app'
import { useRouter } from 'expo-router'

export default function CreateOrgPage() {
  const router = useRouter()

  return (
    <CreateOrgScreen
      onSuccess={(orgId) => router.push(`/orgs/${orgId}` as any)}
    />
  )
}
