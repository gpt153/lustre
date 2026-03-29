import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@lustre/api'
import { useAuthStore } from '../stores/authStore'

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'https://api.lovelustre.com'

type CallStatus = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'rejected'

interface UseCallReturn {
  status: CallStatus
  isMuted: boolean
  isCameraOn: boolean
  isBlurred: boolean
  isInitiator: boolean
  toggleMute: () => void
  toggleCamera: () => void
  toggleBlur: () => void
  endCall: () => Promise<void>
  acceptCall: () => Promise<void>
  rejectCall: () => Promise<void>
  token: string | null
  wsUrl: string | null
  roomName: string | null
}

export function useCall(callId: string, conversationId: string): UseCallReturn {
  const accessToken = useAuthStore((state) => state.accessToken)
  const userId = useAuthStore((state) => state.userId)

  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isBlurred, setIsBlurred] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [wsUrl, setWsUrl] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)

  const statusQuery = trpc.call.getStatus.useQuery(
    { callId },
    { enabled: !!callId, refetchInterval: 2000 }
  )

  const endMutation = trpc.call.end.useMutation()
  const acceptMutation = trpc.call.accept.useMutation()
  const rejectMutation = trpc.call.reject.useMutation()

  const callData = statusQuery.data
  const isInitiator = callData?.initiatorId === userId

  let status: CallStatus = 'idle'
  if (callData) {
    if (callData.status === 'RINGING') status = 'ringing'
    else if (callData.status === 'ACTIVE') status = token ? 'connected' : 'connecting'
    else if (callData.status === 'ENDED') status = 'ended'
    else if (callData.status === 'REJECTED') status = 'rejected'
  }

  // Fetch LiveKit token when call becomes ACTIVE
  useEffect(() => {
    if (callData?.status === 'ACTIVE' && !token && accessToken) {
      fetch(`${API_URL}/api/call/token`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId }),
      })
        .then((r) => r.json())
        .then((data) => {
          setToken(data.token)
          setWsUrl(data.wsUrl)
          setRoomName(data.roomName)
        })
        .catch(() => {})
    }
  }, [callData?.status, token, accessToken, conversationId])

  const toggleMute = useCallback(() => setIsMuted((v) => !v), [])
  const toggleCamera = useCallback(() => setIsCameraOn((v) => !v), [])
  const toggleBlur = useCallback(() => setIsBlurred((v) => !v), [])

  const endCall = useCallback(async () => {
    await endMutation.mutateAsync({ callId })
    setToken(null)
  }, [callId, endMutation])

  const acceptCall = useCallback(async () => {
    await acceptMutation.mutateAsync({ callId })
  }, [callId, acceptMutation])

  const rejectCall = useCallback(async () => {
    await rejectMutation.mutateAsync({ callId })
  }, [callId, rejectMutation])

  return {
    status,
    isMuted,
    isCameraOn,
    isBlurred,
    isInitiator,
    toggleMute,
    toggleCamera,
    toggleBlur,
    endCall,
    acceptCall,
    rejectCall,
    token,
    wsUrl,
    roomName,
  }
}
