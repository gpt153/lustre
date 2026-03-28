import { ScrollView, YStack, XStack, Text, Spinner } from 'tamagui'
import { TouchableOpacity } from 'react-native'
import { trpc } from '@lustre/api'
import { useState } from 'react'

interface EducationQuizScreenProps {
  quizId: string
  onComplete: (score: number) => void
  onBack: () => void
}

export function EducationQuizScreen({ quizId, onComplete, onBack }: EducationQuizScreenProps) {
  const quizQuery = trpc.education.getQuiz.useQuery({ quizId }, { enabled: !!quizId })
  const submitMutation = trpc.education.submitQuiz.useMutation()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [score, setScore] = useState(0)

  const quiz = quizQuery.data
  const currentQuestion = quiz?.questions[currentIndex]

  const handleAnswerPress = async (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentIndex] = answerIndex
    setSelectedAnswers(newAnswers)
    setShowFeedback(true)
  }

  const handleNextQuestion = async () => {
    if (currentIndex === quiz!.questions.length - 1) {
      // Submit quiz
      try {
        const result = await submitMutation.mutateAsync({
          quizId,
          answers: selectedAnswers,
        })
        setScore(result.score)
        setIsComplete(true)
        onComplete(result.score)
      } catch (error) {
        console.error('Quiz submission error:', error)
      }
    } else {
      setCurrentIndex(currentIndex + 1)
      setShowFeedback(false)
    }
  }

  if (quizQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner />
      </YStack>
    )
  }

  if (!quiz) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text color="$gray10">Quizen kunde inte hittas</Text>
      </YStack>
    )
  }

  if (isComplete) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <XStack
          paddingHorizontal="$md"
          paddingVertical="$sm"
          alignItems="center"
          gap="$sm"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
            <Text fontSize={20}>←</Text>
          </TouchableOpacity>
          <Text fontSize={16} fontWeight="600" color="$color" flex={1}>
            Quiz slutfört
          </Text>
        </XStack>

        <YStack flex={1} alignItems="center" justifyContent="center" gap="$md" paddingHorizontal="$md">
          <YStack alignItems="center" gap="$xs">
            <Text fontSize={48} fontWeight="700" color="$pink8">
              {score}/{quiz.questions.length}
            </Text>
            <Text fontSize={16} color="$color" fontWeight="600">
              rätt
            </Text>
          </YStack>

          <YStack alignItems="center" gap="$xs">
            <Text fontSize={20} fontWeight="700" color="$color">
              {Math.round((score / quiz.questions.length) * 100)}%
            </Text>
          </YStack>

          <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
            <YStack
              backgroundColor="$pink8"
              borderRadius="$3"
              paddingHorizontal="$md"
              paddingVertical="$sm"
              minWidth={200}
              alignItems="center"
            >
              <Text fontSize={15} fontWeight="600" color="white">
                Klar
              </Text>
            </YStack>
          </TouchableOpacity>
        </YStack>
      </YStack>
    )
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack
        paddingHorizontal="$md"
        paddingVertical="$sm"
        alignItems="center"
        gap="$sm"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Text fontSize={20}>←</Text>
        </TouchableOpacity>
        <Text fontSize={14} color="$gray10" flex={1}>
          Fråga {currentIndex + 1} av {quiz.questions.length}
        </Text>
      </XStack>

      <ScrollView flex={1}>
        <YStack paddingHorizontal="$md" paddingVertical="$md" gap="$md" paddingBottom="$lg">
          {currentQuestion && (
            <>
              <YStack gap="$sm">
                <Text fontSize={16} fontWeight="600" color="$color" lineHeight="$1.5">
                  {currentQuestion.question}
                </Text>
              </YStack>

              <YStack gap="$xs">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentIndex] === idx
                  const isCorrect = idx === currentQuestion.correctIndex
                  const showCorrect = showFeedback && isCorrect

                  let backgroundColor = '$gray2'
                  if (showFeedback) {
                    if (isSelected && isCorrect) backgroundColor = '$green3'
                    if (isSelected && !isCorrect) backgroundColor = '$red3'
                    if (!isSelected && isCorrect) backgroundColor = '$green3'
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => !showFeedback && handleAnswerPress(idx)}
                      activeOpacity={0.7}
                      disabled={showFeedback}
                    >
                      <YStack
                        backgroundColor={backgroundColor}
                        borderRadius="$3"
                        padding="$sm"
                        borderWidth={isSelected ? 2 : 0}
                        borderColor={showFeedback && isSelected ? (isCorrect ? '$green8' : '$red8') : undefined}
                      >
                        <Text
                          fontSize={14}
                          color={
                            showFeedback && isSelected
                              ? isCorrect
                                ? '$green11'
                                : '$red11'
                              : '$color'
                          }
                          fontWeight={isSelected ? '600' : '500'}
                        >
                          {option}
                        </Text>
                      </YStack>
                    </TouchableOpacity>
                  )
                })}
              </YStack>

              {showFeedback && currentQuestion.explanation && (
                <YStack
                  backgroundColor="$blue3"
                  borderRadius="$3"
                  padding="$sm"
                  borderLeftWidth={3}
                  borderLeftColor="$blue8"
                >
                  <Text fontSize={12} color="$blue11" fontWeight="600" marginBottom="$1">
                    Förklaring
                  </Text>
                  <Text fontSize={12} color="$blue11" lineHeight="$1.4">
                    {currentQuestion.explanation}
                  </Text>
                </YStack>
              )}

              {showFeedback && (
                <TouchableOpacity onPress={handleNextQuestion} activeOpacity={0.7}>
                  <YStack
                    backgroundColor="$pink8"
                    borderRadius="$3"
                    paddingHorizontal="$md"
                    paddingVertical="$sm"
                    alignItems="center"
                    marginTop="$2"
                  >
                    <Text fontSize={15} fontWeight="600" color="white">
                      {currentIndex === quiz.questions.length - 1 ? 'Slutför' : 'Nästa fråga'}
                    </Text>
                  </YStack>
                </TouchableOpacity>
              )}
            </>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
