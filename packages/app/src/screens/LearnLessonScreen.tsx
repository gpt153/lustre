import { useState } from 'react'
import { ScrollView, YStack, XStack, Text, Spinner } from 'tamagui'
import { TouchableOpacity } from 'react-native'
import { useLearnModule } from '../hooks/useLearn'

interface LearnLessonScreenProps {
  moduleId: string
  lessonId: string
  onBack: () => void
  onStartSession: (persona: 'COACH' | 'PARTNER', lessonContext: string) => void
}

const SESSION_OPTIONS: {
  persona: 'COACH' | 'PARTNER'
  title: string
  description: string
  emoji: string
}[] = [
  {
    persona: 'COACH',
    title: 'Träna med Axel',
    description: 'Få vägledning och förklaring från din coach',
    emoji: '🎓',
  },
  {
    persona: 'PARTNER',
    title: 'Öva med Sophia',
    description: 'Öva scenariot med en realistisk övningspartner',
    emoji: '🤝',
  },
]

export function LearnLessonScreen({
  moduleId,
  lessonId,
  onBack,
  onStartSession,
}: LearnLessonScreenProps) {
  const { module, isLoading, startLesson } = useLearnModule(moduleId)
  const [startingPersona, setStartingPersona] = useState<'COACH' | 'PARTNER' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const lesson = module?.lessons.find((l) => l.id === lessonId) ?? null

  async function handleStartSession(persona: 'COACH' | 'PARTNER') {
    if (!lesson) return
    setStartingPersona(persona)
    setError(null)
    try {
      await startLesson(lessonId)
      onStartSession(persona, lesson.title)
    } catch {
      setError('Kunde inte starta sessionen. Försök igen.')
    } finally {
      setStartingPersona(null)
    }
  }

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner />
      </YStack>
    )
  }

  if (!module || !lesson) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" paddingHorizontal="$4">
        <Text fontSize={16} color="$gray10">
          Lektionen hittades inte.
        </Text>
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text fontSize={16} color="$pink10">
            ← Tillbaka
          </Text>
        </TouchableOpacity>
      </XStack>

      <ScrollView flex={1}>
        <YStack paddingHorizontal="$4" paddingTop="$4" paddingBottom="$6" gap="$5">
          <YStack gap="$2">
            <XStack
              backgroundColor="$gray4"
              borderRadius="$2"
              paddingHorizontal="$2"
              paddingVertical={2}
              alignSelf="flex-start"
            >
              <Text fontSize={11} color="$gray11">
                Lektion {lesson.order}
              </Text>
            </XStack>
            <Text fontSize={22} fontWeight="700" color="$color">
              {lesson.title}
            </Text>
          </YStack>

          {lesson.progress?.passed && (
            <XStack
              backgroundColor="$green2"
              borderRadius="$4"
              padding="$3"
              alignItems="center"
              gap="$2"
              borderWidth={1}
              borderColor="$green6"
            >
              <Text fontSize={16}>✓</Text>
              <Text fontSize={13} fontWeight="600" color="$green10">
                Genomfört
              </Text>
            </XStack>
          )}

          <YStack gap="$3">
            <Text fontSize={17} fontWeight="600" color="$color">
              Starta session
            </Text>

            {SESSION_OPTIONS.map((option) => {
              const isStarting = startingPersona === option.persona
              return (
                <TouchableOpacity
                  key={option.persona}
                  onPress={() => !startingPersona && handleStartSession(option.persona)}
                  activeOpacity={startingPersona ? 1 : 0.7}
                >
                  <XStack
                    backgroundColor="$gray2"
                    borderRadius="$4"
                    borderWidth={2}
                    borderColor={isStarting ? '$pink9' : '$gray4'}
                    padding="$4"
                    alignItems="flex-start"
                    gap="$3"
                    opacity={startingPersona && !isStarting ? 0.5 : 1}
                  >
                    <YStack
                      width={48}
                      height={48}
                      borderRadius={24}
                      backgroundColor={isStarting ? '$pink8' : '$gray6'}
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Text fontSize={22}>{option.emoji}</Text>
                    </YStack>

                    <YStack flex={1} gap="$1">
                      <Text fontSize={16} fontWeight="600" color="$color">
                        {option.title}
                      </Text>
                      <Text fontSize={13} color="$gray10">
                        {option.description}
                      </Text>
                    </YStack>

                    {isStarting && <Spinner color="$pink10" />}
                  </XStack>
                </TouchableOpacity>
              )
            })}
          </YStack>

          {error && (
            <Text fontSize={13} color="$red10" textAlign="center">
              {error}
            </Text>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
