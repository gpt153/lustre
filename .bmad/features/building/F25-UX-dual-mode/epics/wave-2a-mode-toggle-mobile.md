# Epic: wave-2a-mode-toggle-mobile

**Wave:** 2
**Model:** haiku
**Status:** NOT_STARTED
**Depends on:** Wave 1 complete

## Goal
Add a vanilla/spicy mode toggle to the mobile app: a reusable `ModeToggle` component, a `ModeWrapper` for conditional spicy content rendering, mode toggle button in the profile tab header, and updated spicy-settings screen.

## Context

### Existing mobile structure
- Tab layout: `apps/mobile/app/(tabs)/_layout.tsx`
- Profile tab: `apps/mobile/app/(tabs)/profile.tsx`
- Spicy settings: `apps/mobile/app/(tabs)/profile/spicy-settings.tsx` (already exists from F17)
- Shared components: `packages/app/src/components/` (16 files)
- `useMode` hook: `packages/app/src/hooks/useMode.ts` (created in wave-1a)
- Tamagui components: `XStack`, `YStack`, `Text`, `Switch` from 'tamagui'

### Spicy settings screen (already exists)
The existing `spicy-settings.tsx` uses `profile.toggleSpicyMode`. Update it to use `useMode().setMode()` instead for consistency.

### Mode toggle placement
Put the toggle in the settings area (profile tab → spicy-settings or a new mode screen). Do NOT add it to the tab bar itself — too much clutter. The profile header is acceptable.

## Acceptance Criteria
1. `packages/app/src/components/ModeToggle.tsx` — reusable toggle component that shows "Vanilla 🌿" / "Spicy 🌶️" pill toggle, calls `useMode().setMode()` on tap
2. `packages/app/src/components/ModeWrapper.tsx` — wrapper component that accepts `mode: 'spicy' | 'vanilla'` and `children`, renders children only when `useMode().mode === mode`; accepts optional `fallback?: ReactNode`
3. `apps/mobile/app/(tabs)/profile/spicy-settings.tsx` — updated to use `useMode` hook instead of `profile.toggleSpicyMode` directly; displays current mode clearly
4. `packages/app/src/index.ts` — exports `ModeToggle` and `ModeWrapper`
5. Mode toggle visually distinguishes vanilla (neutral/green tones) from spicy (pink/red tones)
6. Toggle is disabled (loading spinner) while `setMode` mutation is in flight

## File Paths
1. `packages/app/src/components/ModeToggle.tsx` — CREATE
2. `packages/app/src/components/ModeWrapper.tsx` — CREATE
3. `apps/mobile/app/(tabs)/profile/spicy-settings.tsx` — EDIT
4. `packages/app/src/index.ts` — EDIT (add exports)

## Implementation Notes

### ModeToggle.tsx
```typescript
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
          paddingVertical="$2"
          paddingHorizontal="$3"
          alignItems="center"
        >
          <Text fontSize={13} fontWeight={mode === 'vanilla' ? '700' : '400'} color={mode === 'vanilla' ? 'white' : '$gray10'}>
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
          paddingVertical="$2"
          paddingHorizontal="$3"
          alignItems="center"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text fontSize={13} fontWeight={mode === 'spicy' ? '700' : '400'} color={mode === 'spicy' ? 'white' : '$gray10'}>
              🌶️ Spicy
            </Text>
          )}
        </YStack>
      </TouchableOpacity>
    </XStack>
  )
}
```

### ModeWrapper.tsx
```typescript
import { ReactNode } from 'react'
import { useMode } from '../hooks/useMode'

interface ModeWrapperProps {
  mode: 'vanilla' | 'spicy'
  children: ReactNode
  fallback?: ReactNode
}

export function ModeWrapper({ mode, children, fallback = null }: ModeWrapperProps) {
  const { mode: currentMode } = useMode()
  return currentMode === mode ? <>{children}</> : <>{fallback}</>
}
```

### spicy-settings.tsx update
Read the existing file first. Replace `trpc.profile.toggleSpicyMode.useMutation()` usage with `useMode()` from `@lustre/app`. Keep the existing UI structure but use `setMode('vanilla')` / `setMode('spicy')` instead. Import `ModeToggle` from `@lustre/app` and use it for the toggle UI.

IMPORTANT: Read the actual current content of `apps/mobile/app/(tabs)/profile/spicy-settings.tsx` before editing.
