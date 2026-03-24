'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@lustre/app'
import { trpc } from '@lustre/api'
import { YStack, Text, H2 } from 'tamagui'

export default function ProfilePage() {
  const router = useRouter()
  const { displayName, logout } = useAuth()
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout()
      router.push('/auth')
    },
  })

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
      <H2 color="$primary">Profile</H2>
      {displayName && (
        <Text color="$textSecondary" marginTop="$2">
          Welcome, {displayName}
        </Text>
      )}
      <Text color="$textSecondary" marginTop="$4">
        Coming Soon
      </Text>

      <button
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        style={{
          marginTop: '32px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#fff',
          backgroundColor: logoutMutation.isPending ? '#666' : '#E91E63',
          border: 'none',
          borderRadius: '8px',
          cursor: logoutMutation.isPending ? 'not-allowed' : 'pointer',
        }}
      >
        {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
      </button>
    </YStack>
  )
}
