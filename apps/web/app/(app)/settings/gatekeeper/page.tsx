'use client'

import { YStack, XStack, Text, ScrollView, Switch, Label, Button, Input } from 'tamagui'
import { useState, useEffect } from 'react'
import { useGatekeeper } from '@lustre/app'

export default function GatekeeperSettingsPage() {
  const { config, isLoading, updateConfig, toggle, isUpdating } = useGatekeeper()
  const [customQuestions, setCustomQuestions] = useState<string[]>([])
  const [dealbreakers, setDealbreakers] = useState<string[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [newDealbreaker, setNewDealbreaker] = useState('')

  useEffect(() => {
    if (config) {
      setCustomQuestions(config.customQuestions)
      setDealbreakers(config.dealbreakers)
    }
  }, [config])

  if (isLoading) {
    return (
      <YStack padding="$4" alignItems="center">
        <Text>Loading...</Text>
      </YStack>
    )
  }

  const handleToggle = async () => {
    await toggle()
  }

  const handleStrictnessChange = async (value: string) => {
    await updateConfig({ strictness: value as 'MILD' | 'STANDARD' | 'STRICT' })
  }

  const handleToneChange = async (value: string) => {
    await updateConfig({ aiTone: value as 'FORMAL' | 'CASUAL' | 'FLIRTY' })
  }

  const addQuestion = async () => {
    if (newQuestion.trim() && customQuestions.length < 10) {
      const updated = [...customQuestions, newQuestion.trim()]
      setCustomQuestions(updated)
      setNewQuestion('')
      await updateConfig({ customQuestions: updated })
    }
  }

  const removeQuestion = async (index: number) => {
    const updated = customQuestions.filter((_, i) => i !== index)
    setCustomQuestions(updated)
    await updateConfig({ customQuestions: updated })
  }

  const addDealbreaker = async () => {
    if (newDealbreaker.trim() && dealbreakers.length < 10) {
      const updated = [...dealbreakers, newDealbreaker.trim()]
      setDealbreakers(updated)
      setNewDealbreaker('')
      await updateConfig({ dealbreakers: updated })
    }
  }

  const removeDealbreaker = async (index: number) => {
    const updated = dealbreakers.filter((_, i) => i !== index)
    setDealbreakers(updated)
    await updateConfig({ dealbreakers: updated })
  }

  return (
    <ScrollView>
      <YStack padding="$4" gap="$6">
        <YStack gap="$2">
          <Text fontSize="$6" fontWeight="700" color="$text">
            Gatekeeper
          </Text>
          <Text color="$textSecondary" fontSize="$3">
            AI Gatekeeper qualifies people who want to contact you based on your preferences.
          </Text>
        </YStack>

        <XStack justifyContent="space-between" alignItems="center">
          <Label htmlFor="gk-toggle" color="$text">
            Enabled
          </Label>
          <Switch
            id="gk-toggle"
            checked={config?.enabled ?? false}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
          >
            <Switch.Thumb animation="quick" />
          </Switch>
        </XStack>

        <YStack gap="$2">
          <Label color="$text">Level</Label>
          <XStack gap="$2">
            {(['MILD', 'STANDARD', 'STRICT'] as const).map((level) => (
              <Button
                key={level}
                size="$3"
                backgroundColor={config?.strictness === level ? '$primary' : '$background'}
                color={config?.strictness === level ? 'white' : '$text'}
                onPress={() => handleStrictnessChange(level)}
                disabled={isUpdating}
                flex={1}
              >
                {level === 'MILD' ? 'Mild' : level === 'STANDARD' ? 'Standard' : 'Strict'}
              </Button>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Label color="$text">AI Tone</Label>
          <XStack gap="$2">
            {(['FORMAL', 'CASUAL', 'FLIRTY'] as const).map((tone) => (
              <Button
                key={tone}
                size="$3"
                backgroundColor={config?.aiTone === tone ? '$primary' : '$background'}
                color={config?.aiTone === tone ? 'white' : '$text'}
                onPress={() => handleToneChange(tone)}
                disabled={isUpdating}
                flex={1}
              >
                {tone === 'FORMAL' ? 'Formal' : tone === 'CASUAL' ? 'Casual' : 'Flirty'}
              </Button>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Label color="$text">Custom Questions ({customQuestions.length}/10)</Label>
          {customQuestions.map((q, i) => (
            <XStack key={i} justifyContent="space-between" alignItems="center" gap="$2">
              <Text color="$text" flex={1}>
                {q}
              </Text>
              <Button size="$2" onPress={() => removeQuestion(i)} chromeless>
                <Text color="$red10">Remove</Text>
              </Button>
            </XStack>
          ))}
          {customQuestions.length < 10 && (
            <XStack gap="$2">
              <Input
                flex={1}
                value={newQuestion}
                onChangeText={setNewQuestion}
                placeholder="Add question..."
                maxLength={500}
              />
              <Button
                size="$3"
                onPress={addQuestion}
                backgroundColor="$primary"
                color="white"
              >
                +
              </Button>
            </XStack>
          )}
        </YStack>

        <YStack gap="$2">
          <Label color="$text">Dealbreakers ({dealbreakers.length}/10)</Label>
          {dealbreakers.map((d, i) => (
            <XStack key={i} justifyContent="space-between" alignItems="center" gap="$2">
              <Text color="$text" flex={1}>
                {d}
              </Text>
              <Button size="$2" onPress={() => removeDealbreaker(i)} chromeless>
                <Text color="$red10">Remove</Text>
              </Button>
            </XStack>
          ))}
          {dealbreakers.length < 10 && (
            <XStack gap="$2">
              <Input
                flex={1}
                value={newDealbreaker}
                onChangeText={setNewDealbreaker}
                placeholder="Add dealbreaker..."
                maxLength={200}
              />
              <Button
                size="$3"
                onPress={addDealbreaker}
                backgroundColor="$primary"
                color="white"
              >
                +
              </Button>
            </XStack>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
