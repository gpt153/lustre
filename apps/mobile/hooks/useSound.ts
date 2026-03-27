/**
 * useSound — Sound playback hook for Lustre
 *
 * - Respects system mute (iOS silent switch, Android DND)
 * - Audio.setAudioModeAsync with playsInSilentModeIOS: false (respect mute switch)
 * - Sounds are loaded lazily on first play
 * - Unloaded on unmount
 * - Provides a soundEnabled ref that can be toggled (for settings screen)
 */

import { useCallback, useEffect, useRef } from 'react'
import { Audio } from 'expo-av'
import type { AVPlaybackSource } from 'expo-av'
import { SOUND_CONFIGS, type SoundKey } from '@/constants/sounds'

/**
 * Dynamically retrieve sound asset for a given key.
 * Returns null if the asset file doesn't exist yet.
 *
 * Uses require() to load audio files from assets/sounds/ directory.
 * This is necessary for Expo/React Native asset bundling.
 */
function getSoundAsset(key: SoundKey): AVPlaybackSource | null {
  try {
    switch (key) {
      case 'match':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('@/assets/sounds/match.aac')
      case 'like':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('@/assets/sounds/like.aac')
      case 'message':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('@/assets/sounds/message.aac')
      case 'modeSwitch':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('@/assets/sounds/modeSwitch.aac')
      case 'ceremony':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('@/assets/sounds/ceremony.aac')
      default:
        return null
    }
  } catch {
    // File doesn't exist yet — gracefully return null
    return null
  }
}

interface SoundPlaybackHookState {
  /** User preference — sounds can be enabled/disabled */
  soundEnabled: boolean
  /** Cache of loaded Audio.Sound instances */
  loadedSounds: Map<SoundKey, Audio.Sound>
}

export interface UseSoundReturn {
  /** Play a sound by key. Handles missing files gracefully. */
  play: (key: SoundKey) => Promise<void>
  /** Toggle sound playback on/off */
  setSoundEnabled: (enabled: boolean) => void
  /** Current sound enabled state */
  soundEnabled: boolean
}

/**
 * Hook for sound playback in Lustre.
 *
 * Example usage:
 *   const { play, setSoundEnabled, soundEnabled } = useSound()
 *   await play('match')
 *   setSoundEnabled(false)  // Mute all sounds
 */
export function useSound(): UseSoundReturn {
  const stateRef = useRef<SoundPlaybackHookState>({
    soundEnabled: true,
    loadedSounds: new Map(),
  })

  // Configure audio mode on mount
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: false, // Respect iOS mute switch
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch((error) => {
      console.warn('[useSound] Failed to set audio mode:', error)
    })

    return () => {
      // Cleanup: unload all sounds on unmount
      stateRef.current.loadedSounds.forEach((sound) => {
        sound.unloadAsync().catch(() => {
          // Ignore errors during cleanup
        })
      })
      stateRef.current.loadedSounds.clear()
    }
  }, [])

  const play = useCallback(async (key: SoundKey): Promise<void> => {
    // Check if sounds are enabled
    if (!stateRef.current.soundEnabled) {
      return
    }

    const config = SOUND_CONFIGS[key]
    const loadedSounds = stateRef.current.loadedSounds

    try {
      // Try to get cached sound, or create if missing
      let sound = loadedSounds.get(key)

      if (!sound) {
        // Attempt to load the sound file
        // This will fail gracefully if the file doesn't exist
        const soundAsset = getSoundAsset(key)

        if (!soundAsset) {
          // File doesn't exist yet — skip playback silently
          return
        }

        // Create a new Audio.Sound instance
        sound = new Audio.Sound()
        await sound.loadAsync(soundAsset)
        loadedSounds.set(key, sound)
      }

      // If this sound doesn't allow overlap, stop any existing playback
      if (!config.allowOverlap) {
        try {
          const status = await sound.getStatusAsync()
          if (status.isLoaded && status.isPlaying) {
            await sound.stopAsync()
          }
        } catch {
          // Ignore status check errors
        }
      }

      // Set volume and play
      await sound.setVolumeAsync(config.volume)
      await sound.playAsync()
    } catch (error) {
      // Gracefully handle any playback errors
      console.warn(`[useSound] Failed to play sound "${key}":`, error)
    }
  }, [])

  const setSoundEnabled = useCallback((enabled: boolean): void => {
    stateRef.current.soundEnabled = enabled
  }, [])

  return {
    play,
    setSoundEnabled,
    soundEnabled: stateRef.current.soundEnabled,
  }
}
