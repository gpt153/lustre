import { useEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { useCall } from '../hooks/useCall'

interface CallScreenProps {
  callId: string
  conversationId: string
  displayName: string
  onNavigateBack: () => void
  /** Optional platform-specific video view (mobile passes LiveKit VideoTrack, web passes video element) */
  RemoteVideoView?: React.ComponentType
  LocalVideoView?: React.ComponentType
}

export function CallScreen({
  callId,
  conversationId,
  displayName,
  onNavigateBack,
  RemoteVideoView,
  LocalVideoView,
}: CallScreenProps) {
  const {
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
  } = useCall(callId, conversationId)

  useEffect(() => {
    if (status === 'ended' || status === 'rejected') {
      onNavigateBack()
    }
  }, [status, onNavigateBack])

  const statusLabel =
    status === 'ringing' && isInitiator
      ? 'Calling\u2026'
      : status === 'ringing' && !isInitiator
        ? 'Incoming call'
        : status === 'connecting'
          ? 'Connecting\u2026'
          : status === 'connected'
            ? 'Connected'
            : status === 'ended'
              ? 'Call ended'
              : status === 'rejected'
                ? 'Call declined'
                : ''

  const showActiveControls =
    (status === 'ringing' && isInitiator) ||
    status === 'connecting' ||
    status === 'connected'

  return (
    <YStack flex={1} backgroundColor="$background" position="relative">
      {/* Remote video or avatar placeholder */}
      <YStack flex={1} backgroundColor="$gray1" alignItems="center" justifyContent="center">
        {RemoteVideoView ? (
          <RemoteVideoView />
        ) : (
          <YStack alignItems="center" gap="$md">
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
            <Text color="$color" fontSize={20} fontWeight="600">
              {displayName}
            </Text>
            <Text color="$gray11" fontSize={14}>
              {statusLabel}
            </Text>
          </YStack>
        )}
      </YStack>

      {/* Local video picture-in-picture */}
      {LocalVideoView && isCameraOn && (
        <YStack
          position="absolute"
          bottom={140}
          right={16}
          width={100}
          height={140}
          borderRadius={12}
          overflow="hidden"
          backgroundColor="$gray3"
        >
          <LocalVideoView />
        </YStack>
      )}

      {/* Incoming call accept / decline buttons (receiver only, RINGING state) */}
      {status === 'ringing' && !isInitiator && (
        <XStack
          position="absolute"
          bottom={48}
          left={0}
          right={0}
          justifyContent="center"
          gap="$xl"
          paddingHorizontal="$lg"
        >
          <YStack alignItems="center" gap="$xs">
            <TouchableOpacity
              onPress={rejectCall}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#ef4444',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text fontSize={28}>✕</Text>
            </TouchableOpacity>
            <Text color="$gray11" fontSize={12}>
              Decline
            </Text>
          </YStack>
          <YStack alignItems="center" gap="$xs">
            <TouchableOpacity
              onPress={acceptCall}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#22c55e',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text fontSize={28}>✓</Text>
            </TouchableOpacity>
            <Text color="$gray11" fontSize={12}>
              Accept
            </Text>
          </YStack>
        </XStack>
      )}

      {/* Active call controls (initiator while ringing, or while connecting / connected) */}
      {showActiveControls && (
        <XStack
          position="absolute"
          bottom={48}
          left={0}
          right={0}
          justifyContent="center"
          gap="$lg"
          paddingHorizontal="$lg"
        >
          <YStack alignItems="center" gap="$xs">
            <TouchableOpacity
              onPress={toggleMute}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: isMuted ? '#ef4444' : '#374151',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text fontSize={24}>{isMuted ? '🔇' : '🎤'}</Text>
            </TouchableOpacity>
            <Text color="$gray11" fontSize={11}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </YStack>

          <YStack alignItems="center" gap="$xs">
            <TouchableOpacity
              onPress={toggleCamera}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: isCameraOn ? '#374151' : '#ef4444',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text fontSize={24}>📷</Text>
            </TouchableOpacity>
            <Text color="$gray11" fontSize={11}>
              {isCameraOn ? 'Camera off' : 'Camera on'}
            </Text>
          </YStack>

          <YStack alignItems="center" gap="$xs">
            <TouchableOpacity
              onPress={toggleBlur}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: isBlurred ? '#6366f1' : '#374151',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text fontSize={24}>🌫️</Text>
            </TouchableOpacity>
            <Text color="$gray11" fontSize={11}>
              {isBlurred ? 'Blur on' : 'Blur off'}
            </Text>
          </YStack>

          <YStack alignItems="center" gap="$xs">
            <TouchableOpacity
              onPress={endCall}
              style={{
                width: 56,
                height: 56,
                borderRadius: 32,
                backgroundColor: '#ef4444',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text fontSize={24}>📵</Text>
            </TouchableOpacity>
            <Text color="$gray11" fontSize={11}>
              End
            </Text>
          </YStack>
        </XStack>
      )}
    </YStack>
  )
}
