'use client'

import { use, useState } from 'react'
import { YStack, XStack, Text, Spinner } from 'tamagui'
import { trpc } from '@lustre/api'
import Link from 'next/link'
import { TouchableOpacity } from 'react-native'

export default function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params)
  const quizQuery = trpc.education.getQuiz.useQuery({ quizId })
  const submitMutation = trpc.education.submitQuiz.useMutation()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [quizResult, setQuizResult] = useState<{
    score: number
    correctCount: number
    totalQuestions: number
  } | null>(null)

  if (quizQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  const quiz = quizQuery.data
  if (!quiz) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="80vh">
        <Text color="$textSecondary" fontSize="$4">
          Quizet hittades inte.
        </Text>
      </YStack>
    )
  }

  const currentQuestion = quiz.questions[currentIndex]
  const isLastQuestion = currentIndex === quiz.questions.length - 1
  const hasAnswered = selectedAnswers[currentIndex] !== undefined
  const isCorrect = hasAnswered && selectedAnswers[currentIndex] === currentQuestion.correctAnswerIndex

  const handleAnswer = (answerIndex: number) => {
    if (!hasAnswered) {
      const newAnswers = [...selectedAnswers]
      newAnswers[currentIndex] = answerIndex
      setSelectedAnswers(newAnswers)
      setShowFeedback(true)
    }
  }

  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      submitMutation.mutate(
        { quizId, answers: selectedAnswers },
        {
          onSuccess: (result) => {
            setIsComplete(true)
            setQuizResult({
              score: Math.round((result.correctCount / result.totalQuestions) * 100),
              correctCount: result.correctCount,
              totalQuestions: result.totalQuestions,
            })
          },
        }
      )
    } else {
      setCurrentIndex(currentIndex + 1)
      setShowFeedback(false)
    }
  }

  if (isComplete && quizResult) {
    return (
      <YStack flex={1} alignItems="center" padding="$4">
        <YStack width="100%" maxWidth={600} gap="$6" justifyContent="center" minHeight="80vh">
          <Link href="/learn/sexual-health" style={{ textDecoration: 'none' }}>
            <Text fontSize="$3" color="$primary">
              ← Tillbaka
            </Text>
          </Link>

          <YStack alignItems="center" gap="$4">
            <Text fontSize="$8" fontWeight="700">
              🎉
            </Text>

            <YStack alignItems="center" gap="$2">
              <Text fontSize="$6" fontWeight="700" color="$text">
                Quiz slutfört!
              </Text>
              <Text fontSize="$4" color="$textSecondary">
                Du svarade rätt på {quizResult.correctCount} av {quizResult.totalQuestions} frågor
              </Text>
            </YStack>

            <YStack
              width="100%"
              backgroundColor="$primary"
              borderRadius="$4"
              padding="$6"
              alignItems="center"
              gap="$2"
            >
              <Text fontSize="$7" fontWeight="700" color="white">
                {quizResult.score}%
              </Text>
              <Text fontSize="$4" color="white" fontWeight="600">
                {quizResult.score >= 80
                  ? 'Utmärkt!'
                  : quizResult.score >= 60
                    ? 'Bra jobbat!'
                    : 'Försök igen'}
              </Text>
            </YStack>

            <Link href="/learn/sexual-health" style={{ textDecoration: 'none', width: '100%' }}>
              <YStack
                width="100%"
                backgroundColor="$primary"
                borderRadius="$3"
                paddingVertical="$3"
                alignItems="center"
                cursor="pointer"
                hoverStyle={{ opacity: 0.9 }}
              >
                <Text fontSize="$4" fontWeight="700" color="white">
                  Tillbaka till ämnen
                </Text>
              </YStack>
            </Link>
          </YStack>
        </YStack>
      </YStack>
    )
  }

  return (
    <YStack flex={1} alignItems="center" padding="$4">
      <YStack width="100%" maxWidth={800} gap="$5">
        <Link href="/learn/sexual-health" style={{ textDecoration: 'none' }}>
          <Text fontSize="$3" color="$primary">
            ← Tillbaka
          </Text>
        </Link>

        <YStack gap="$2">
          <Text fontSize="$5" fontWeight="700" color="$text">
            {quiz.title}
          </Text>

          <YStack
            width="100%"
            height={8}
            backgroundColor="$borderColor"
            borderRadius="$4"
            overflow="hidden"
          >
            <YStack
              width={`${((currentIndex + 1) / quiz.questions.length) * 100}%`}
              height="100%"
              backgroundColor="$primary"
            />
          </YStack>

          <Text fontSize="$2" color="$textSecondary">
            Fråga {currentIndex + 1} av {quiz.questions.length}
          </Text>
        </YStack>

        <YStack
          backgroundColor="$background"
          borderRadius="$4"
          borderWidth={1}
          borderColor="$borderColor"
          padding="$5"
          gap="$5"
        >
          <Text fontSize="$5" fontWeight="600" color="$text" lineHeight={28}>
            {currentQuestion.question}
          </Text>

          <YStack gap="$3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentIndex] === index
              const isAnswered = hasAnswered

              let backgroundColor = '$backgroundHover'
              let borderColor = '$borderColor'
              let textColor = '$text'

              if (isAnswered) {
                if (index === currentQuestion.correctAnswerIndex) {
                  backgroundColor = '#E6F9EC'
                  borderColor = '#1A7F37'
                  textColor = '#1A7F37'
                } else if (isSelected && !isCorrect) {
                  backgroundColor = '#FEE2E2'
                  borderColor = '#DC2626'
                  textColor = '#DC2626'
                }
              } else if (isSelected) {
                backgroundColor = '$primary'
                borderColor = '$primary'
                textColor = 'white'
              }

              return (
                <TouchableOpacity
                  key={index}
                  disabled={isAnswered}
                  onPress={() => handleAnswer(index)}
                  style={{ cursor: isAnswered ? 'default' : 'pointer' }}
                >
                  <XStack
                    backgroundColor={backgroundColor}
                    borderRadius="$3"
                    borderWidth={2}
                    borderColor={borderColor}
                    padding="$4"
                    gap="$3"
                    alignItems="center"
                    opacity={isAnswered && index !== currentQuestion.correctAnswerIndex && !isSelected ? 0.5 : 1}
                  >
                    <YStack
                      width={24}
                      height={24}
                      borderRadius={12}
                      backgroundColor={isSelected ? textColor : borderColor}
                      alignItems="center"
                      justifyContent="center"
                    >
                      {isAnswered && index === currentQuestion.correctAnswerIndex && (
                        <Text fontSize="$3" color="white" fontWeight="700">
                          ✓
                        </Text>
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <Text fontSize="$3" color="white" fontWeight="700">
                          ✗
                        </Text>
                      )}
                    </YStack>
                    <Text fontSize="$4" color={textColor} fontWeight={isSelected ? '700' : '500'} flex={1}>
                      {option}
                    </Text>
                  </XStack>
                </TouchableOpacity>
              )
            })}
          </YStack>

          {hasAnswered && (
            <YStack
              backgroundColor={isCorrect ? '#E6F9EC' : '#FEE2E2'}
              borderRadius="$3"
              borderLeftWidth={4}
              borderColor={isCorrect ? '#1A7F37' : '#DC2626'}
              padding="$4"
              gap="$2"
            >
              <Text
                fontSize="$3"
                fontWeight="700"
                color={isCorrect ? '#1A7F37' : '#DC2626'}
              >
                {isCorrect ? '✓ Rätt svar!' : '✗ Fel svar'}
              </Text>
              <Text fontSize="$3" color={isCorrect ? '#1A7F37' : '#DC2626'} lineHeight={20}>
                {currentQuestion.explanation}
              </Text>
            </YStack>
          )}

          {hasAnswered && (
            <TouchableOpacity onPress={handleNextQuestion} disabled={submitMutation.isPending}>
              <YStack
                backgroundColor="$primary"
                borderRadius="$3"
                paddingVertical="$3"
                alignItems="center"
                cursor="pointer"
                opacity={submitMutation.isPending ? 0.6 : 1}
                hoverStyle={{ opacity: 0.9 }}
              >
                <Text fontSize="$4" fontWeight="700" color="white">
                  {isLastQuestion ? 'Slutför quiz' : 'Nästa fråga'}
                </Text>
              </YStack>
            </TouchableOpacity>
          )}
        </YStack>
      </YStack>
    </YStack>
  )
}
