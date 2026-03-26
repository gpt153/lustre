import { GroupListScreen } from '@lustre/app'
import { useRouter } from 'expo-router'

export default function ExploreGroupsScreen() {
  const router = useRouter()
  return (
    <GroupListScreen
      onGroupPress={(groupId) => router.push(`/groups/${groupId}` as any)}
      onCreatePress={() => router.push('/groups/create' as any)}
    />
  )
}
