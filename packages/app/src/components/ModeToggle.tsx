import { XStack, YStack, Text } from 'tamagui'
import { TouchableOpacity, ActivityIndicator } from 'react-native'
import { useMode } from '../hooks/useMode'

export function ModeToggle() {
  const { mode, setMode, isLoading } = useMode()

  return (
    <XStack
      backgroundColor="$gray2"
      borderRadius="$5"
      padding={4}
      gap={4}
    >
      <TouchableOpacity
        onPress={() => setMode('vanilla')}
        disabled={isLoading}
        style={{ flex: 1 }}
      >
        <YStack
          backgroundColor={mode === 'vanilla' ? '$green8' : 'transparent'}
          borderRadius="$4"
          paddingVertical="$xs"
          paddingHorizontal="$3"
          alignItems="center"
        >
          <Text
            fontSize={13}
            fontWeight={mode === 'vanilla' ? '700' : '400'}
            color={mode === 'vanilla' ? 'white' : '$gray10'}
          >
            🌿 Vanilla
          </Text>
        </YStack>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setMode('spicy')}
        disabled={isLoading}
        style={{ flex: 1 }}
      >
        <YStack
          backgroundColor={mode === 'spicy' ? '$pink8' : 'transparent'}
          borderRadius="$4"
          paddingVertical="$xs"
          paddingHorizontal="$3"
          alignItems="center"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text
              fontSize={13}
              fontWeight={mode === 'spicy' ? '700' : '400'}
              color={mode === 'spicy' ? 'white' : '$gray10'}
            >
              🌶️ Spicy
            </Text>
          )}
        </YStack>
      </TouchableOpacity>
    </XStack>
  )
}
