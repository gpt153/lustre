'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { YStack, XStack, Text, Button } from 'tamagui'
import { Room, RoomEvent, Track, LocalVideoTrack, type RemoteTrack } from 'livekit-client'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export default function CallPage() {
  const params = useParams<{ callId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const callId = params.callId
  const conversationId = searchParams.get('conversationId') ?? ''
  const displayName = searchParams.get('displayName') ?? 'Unknown'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accessToken = useAuthStore((state: any) => state.accessToken as string | null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = useAuthStore((state: any) => state.userId as string | null)

  const [room] = useState(() => new Room())
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isBlurred, setIsBlurred] = useState(false)
  const [remoteVideoEl, setRemoteVideoEl] = useState<HTMLVideoElement | null>(null)
  const [localVideoEl, setLocalVideoEl] = useState<HTMLVideoElement | null>(null)

  const statusQuery = trpc.call.getStatus.useQuery(
    { callId },
    { enabled: !!callId, refetchInterval: 2000 }
  )
  const endMutation = trpc.call.end.useMutation()
  const acceptMutation = trpc.call.accept.useMutation()
  const rejectMutation = trpc.call.reject.useMutation()

  const callData = statusQuery.data
  const isInitiator = callData?.initiatorId === userId

  // Connect to LiveKit when call becomes ACTIVE
  useEffect(() => {
    if (callData?.status !== 'ACTIVE' || isConnected || !accessToken) return

    async function connect() {
      try {
        const res = await fetch(`${API_URL}/api/call/token`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ conversationId }),
        })
        const { token, wsUrl } = await res.json()
        await room.connect(wsUrl, token)
        setIsConnected(true)

        room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
          if (track.kind === Track.Kind.Video && remoteVideoEl) {
            track.attach(remoteVideoEl)
          }
        })

        const localTrack = room.localParticipant.getTrackPublication(Track.Source.Camera)
        if (localTrack?.track && localVideoEl) {
          localTrack.track.attach(localVideoEl)
        }
      } catch (err) {
        console.error('Failed to connect to LiveKit', err)
      }
    }

    connect()
  }, [callData?.status, isConnected, accessToken, conversationId, room, remoteVideoEl, localVideoEl])

  // Navigate away when call ends
  useEffect(() => {
    if (callData?.status === 'ENDED' || callData?.status === 'REJECTED') {
      room.disconnect()
      router.push(`/chat/${conversationId}`)
    }
  }, [callData?.status, room, router, conversationId])

  const handleEndCall = useCallback(async () => {
    await endMutation.mutateAsync({ callId })
    room.disconnect()
    router.push(`/chat/${conversationId}`)
  }, [callId, endMutation, room, router, conversationId])

  const handleAccept = useCallback(async () => {
    await acceptMutation.mutateAsync({ callId })
  }, [callId, acceptMutation])

  const handleReject = useCallback(async () => {
    await rejectMutation.mutateAsync({ callId })
    router.push(`/chat/${conversationId}`)
  }, [callId, rejectMutation, router, conversationId])

  const toggleMute = useCallback(async () => {
    if (isMuted) {
      await room.localParticipant.setMicrophoneEnabled(true)
    } else {
      await room.localParticipant.setMicrophoneEnabled(false)
    }
    setIsMuted((v) => !v)
  }, [isMuted, room])

  const toggleCamera = useCallback(async () => {
    if (isCameraOn) {
      await room.localParticipant.setCameraEnabled(false)
    } else {
      await room.localParticipant.setCameraEnabled(true)
    }
    setIsCameraOn((v) => !v)
  }, [isCameraOn, room])

  const toggleBlur = useCallback(async () => {
    try {
      const { BackgroundBlur } = await import('@livekit/track-processors')
      const camPublication = room.localParticipant.getTrackPublication(Track.Source.Camera)
      if (camPublication?.track instanceof LocalVideoTrack) {
        if (isBlurred) {
          await camPublication.track.stopProcessor()
        } else {
          await camPublication.track.setProcessor(BackgroundBlur())
        }
        setIsBlurred((v) => !v)
      }
    } catch (err) {
      console.error('Background blur not supported', err)
    }
  }, [isBlurred, room])

  const statusText = !callData ? 'Loading…'
    : callData.status === 'RINGING' && isInitiator ? 'Calling…'
    : callData.status === 'RINGING' && !isInitiator ? 'Incoming call'
    : callData.status === 'ACTIVE' ? (isConnected ? 'Connected' : 'Connecting…')
    : callData.status === 'ENDED' ? 'Call ended'
    : callData.status === 'REJECTED' ? 'Call declined'
    : ''

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="$background" position="relative">
      {/* Remote video */}
      <YStack flex={1} backgroundColor="$gray1" alignItems="center" justifyContent="center" position="relative">
        <video
          ref={(el) => setRemoteVideoEl(el)}
          autoPlay
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: isConnected ? 'block' : 'none' }}
        />
        {!isConnected && (
          <YStack alignItems="center" gap="$4">
            <YStack
              width={80}
              height={80}
              borderRadius={40}
              backgroundColor="$gray5"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={32}>{displayName[0]?.toUpperCase() ?? '?'}</Text>
            </YStack>
            <Text fontSize={20} fontWeight="600">{displayName}</Text>
            <Text color="$gray11">{statusText}</Text>
          </YStack>
        )}

        {/* Local video PiP */}
        <YStack
          position="absolute"
          bottom={140}
          right={16}
          width={160}
          height={90}
          borderRadius={8}
          overflow="hidden"
          backgroundColor="$gray3"
          display={isCameraOn && isConnected ? 'flex' : 'none'}
        >
          <video
            ref={(el) => setLocalVideoEl(el)}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </YStack>
      </YStack>

      {/* Incoming call actions */}
      {callData?.status === 'RINGING' && !isInitiator && (
        <XStack
          position="absolute"
          bottom={48}
          left={0}
          right={0}
          justifyContent="center"
          gap="$8"
          padding="$4"
        >
          <Button
            size="$5"
            backgroundColor="$red9"
            color="white"
            borderRadius="$10"
            onPress={handleReject}
          >
            Decline
          </Button>
          <Button
            size="$5"
            backgroundColor="$green9"
            color="white"
            borderRadius="$10"
            onPress={handleAccept}
          >
            Accept
          </Button>
        </XStack>
      )}

      {/* Active call controls */}
      {((callData?.status === 'RINGING' && isInitiator) || callData?.status === 'ACTIVE') ? (
        <XStack
          position="absolute"
          bottom={48}
          left={0}
          right={0}
          justifyContent="center"
          gap="$4"
          padding="$4"
        >
          <Button
            size="$4"
            backgroundColor={isMuted ? '$red9' : '$gray7'}
            color="white"
            borderRadius="$10"
            onPress={toggleMute}
          >
            {isMuted ? '🔇 Unmute' : '🎤 Mute'}
          </Button>
          <Button
            size="$4"
            backgroundColor={isCameraOn ? '$gray7' : '$red9'}
            color="white"
            borderRadius="$10"
            onPress={toggleCamera}
          >
            {isCameraOn ? '📷 Cam off' : '📷 Cam on'}
          </Button>
          <Button
            size="$4"
            backgroundColor={isBlurred ? '$blue9' : '$gray7'}
            color="white"
            borderRadius="$10"
            onPress={toggleBlur}
          >
            🌫️ Blur
          </Button>
          <Button
            size="$4"
            backgroundColor="$red9"
            color="white"
            borderRadius="$10"
            onPress={handleEndCall}
          >
            📵 End call
          </Button>
        </XStack>
      ) : null}
    </YStack>
  )
}
