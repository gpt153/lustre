import { ScrollView, YStack, XStack, Text, Spinner } from 'tamagui'
import { TouchableOpacity } from 'react-native'
import { trpc } from '@lustre/api'
import { useEffect, useState } from 'react'
import { Audio } from 'expo-av'

interface EducationPodcastScreenProps {
  topicSlug: string
  onBack: () => void
}

export function EducationPodcastScreen({ topicSlug, onBack }: EducationPodcastScreenProps) {
  const podcastsQuery = trpc.education.listPodcasts.useQuery({ topicSlug }, { enabled: !!topicSlug })
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const podcast = podcastsQuery.data?.[0]

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [sound])

  const handlePlayPause = async () => {
    try {
      if (isPlaying && sound) {
        await sound.pauseAsync()
        setIsPlaying(false)
      } else if (sound) {
        await sound.playAsync()
        setIsPlaying(true)
      } else if (podcast) {
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: podcast.audioUrl })
        setSound(newSound)
        await newSound.playAsync()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Audio playback error:', error)
    }
  }

  if (podcastsQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner />
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        gap="$3"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Text fontSize={20}>←</Text>
        </TouchableOpacity>
        <Text fontSize={16} fontWeight="600" color="$color" flex={1}>
          Podcast
        </Text>
      </XStack>

      <ScrollView flex={1}>
        <YStack paddingHorizontal="$4" paddingVertical="$4" gap="$4" paddingBottom="$6">
          {!podcast ? (
            <YStack alignItems="center" justifyContent="center" minHeight={200}>
              <Text fontSize={14} color="$gray10" textAlign="center">
                Podcast snart tillgänglig
              </Text>
            </YStack>
          ) : (
            <>
              <YStack gap="$2">
                <Text fontSize={18} fontWeight="700" color="$color">
                  {podcast.title}
                </Text>
                <Text fontSize={13} color="$gray10" lineHeight="$1.5">
                  {podcast.description}
                </Text>
              </YStack>

              <YStack
                backgroundColor="$gray2"
                borderRadius="$4"
                padding="$4"
                alignItems="center"
                gap="$4"
              >
                <TouchableOpacity onPress={handlePlayPause} activeOpacity={0.7}>
                  <YStack
                    width={80}
                    height={80}
                    borderRadius={40}
                    backgroundColor="$pink8"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={32} color="white">
                      {isPlaying ? '⏸' : '▶'}
                    </Text>
                  </YStack>
                </TouchableOpacity>

                <Text fontSize={13} color="$gray11" fontWeight="600">
                  {isPlaying ? 'Spela upp' : 'Pausa'}
                </Text>
              </YStack>
            </>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
