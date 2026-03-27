# Epic: Wave 3e — Sound Design (expo-av)

**Feature:** F32 UX Design Excellence (Native Mobile)
**Wave:** 3 (Polish & Delight)
**Model:** haiku
**Estimate:** 2 days
**Dependencies:** Wave 2 complete

---

## Summary

Add a subtle, optional sound palette to key moments using expo-av with preloaded Audio.Sound instances. Match chime, message sent whoosh, badge ding, Copper Pick ambient swell, and consent bell. All sounds off by default (opt-in via settings). Sounds synchronized with Expo Haptics for combined tactile+audio feedback. Sound design evokes warmth — wooden chimes, soft metallic resonance, warm tones in the 200-500Hz range.

## Acceptance Criteria

1. useSound hook: plays named sounds with volume control, respects system mute and in-app toggle — API: `const { play } = useSound()`, call `play('match')` — fire-and-forget, no await needed for callers
2. Sound registry with 5 named sounds: match (warm chime ~0.8s), messageSent (soft whoosh ~0.3s), badgeEarned (metallic ding ~0.5s), copperPickReveal (ambient swell ~1.2s), consentConfirm (gentle bell ~0.6s)
3. Sound files in AAC format (iOS native, Android supported), 20-50KB each, total <250KB — bundled in `apps/mobile/assets/sounds/`
4. Preloading via `Audio.Sound.createAsync` on first settings enable — sounds cached in memory Map after first load, subsequent plays use `setPositionAsync(0)` + `playAsync()` (instant, no load delay)
5. In-app sound toggle in Settings: "Appljud" switch, default OFF for new installs, persisted in Zustand preferences + AsyncStorage
6. System mute respected: `Audio.setAudioModeAsync({ playsInSilentModeIOS: false })` — sounds only play when device is not in silent mode
7. Volume: 60% of system media via `sound.setVolumeAsync(0.6)` — subtle enhancement, not jarring notification-level
8. Sounds integrated at trigger points synchronized with haptics: match ceremony (after particle burst at t=0, synced with haptic sequence start), chat send (on press, synced with `impactLight`), badge unlock (on reveal animation start, synced with triple-tap haptic), Copper Pick (on entrance complete at t=800ms, synced with `impactLight`), consent confirm (on gold fill animation, synced with `notificationSuccess`)
9. Reduced motion does NOT affect sounds — sounds are audio, not motion. Only the in-app sound toggle controls playback.
10. Sound playback errors handled gracefully: `try/catch` around all play calls, silent failure (no error toast for sound issues)

## File Paths

1. `apps/mobile/hooks/useSound.ts`
2. `apps/mobile/constants/sounds.ts`
3. `apps/mobile/assets/sounds/match.aac`
4. `apps/mobile/assets/sounds/message-sent.aac`
5. `apps/mobile/assets/sounds/badge-earned.aac`
6. `apps/mobile/assets/sounds/copper-pick.aac`
7. `apps/mobile/assets/sounds/consent-confirm.aac`
8. `apps/mobile/app/(tabs)/profile/settings.tsx`

## Implementation Notes

- Sound registry:
  ```typescript
  // apps/mobile/constants/sounds.ts
  export const SOUNDS = {
    match: require('@/assets/sounds/match.aac'),
    messageSent: require('@/assets/sounds/message-sent.aac'),
    badgeEarned: require('@/assets/sounds/badge-earned.aac'),
    copperPickReveal: require('@/assets/sounds/copper-pick.aac'),
    consentConfirm: require('@/assets/sounds/consent-confirm.aac'),
  } as const

  export type SoundName = keyof typeof SOUNDS
  ```

- useSound hook with preloading and caching:
  ```typescript
  import { Audio } from 'expo-av'
  import { SOUNDS, SoundName } from '@/constants/sounds'

  const soundCache = new Map<SoundName, Audio.Sound>()
  let audioModeConfigured = false

  async function configureAudioMode() {
    if (audioModeConfigured) return
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    })
    audioModeConfigured = true
  }

  async function preloadAll() {
    await configureAudioMode()
    for (const [name, source] of Object.entries(SOUNDS)) {
      if (!soundCache.has(name as SoundName)) {
        const { sound } = await Audio.Sound.createAsync(source)
        await sound.setVolumeAsync(0.6)
        soundCache.set(name as SoundName, sound)
      }
    }
  }

  export function useSound() {
    const soundEnabled = usePreferencesStore(s => s.soundEnabled)

    // Preload on first enable
    useEffect(() => {
      if (soundEnabled) preloadAll()
    }, [soundEnabled])

    const play = useCallback(async (name: SoundName) => {
      if (!soundEnabled) return
      try {
        let sound = soundCache.get(name)
        if (!sound) {
          const { sound: loaded } = await Audio.Sound.createAsync(SOUNDS[name])
          await loaded.setVolumeAsync(0.6)
          soundCache.set(name, loaded)
          sound = loaded
        }
        await sound.setPositionAsync(0)
        await sound.playAsync()
      } catch {
        // Silent failure — don't disrupt UX for sound issues
      }
    }, [soundEnabled])

    return { play }
  }
  ```

- Sound+Haptic synchronization pattern:
  ```typescript
  // In match ceremony:
  const { play } = useSound()
  const haptics = useLustreHaptics()

  const startCeremony = () => {
    // t=0: particles + sound + haptic start together
    play('match')
    haptics.match()  // async haptic sequence runs in parallel with sound
    startParticleBurst()
  }
  ```

- Sound file specifications:
  - Match: tubular bell or wind chime, pitched C4-E4 (warm register), gentle attack, 0.8s natural decay
  - Message sent: soft "whoosh" with slight reverb, 0.3s, high-pass filtered (no bass rumble)
  - Badge earned: metallic ding, EQ boost 200-500Hz, cut above 4kHz (warm, not sharp), 0.5s
  - Copper Pick: ambient pad swell in A3, gentle crescendo, 1.2s with reverb tail
  - Consent confirm: temple bell single strike, gentle decay, 0.6s, warm resonance

- Source sounds: royalty-free from freesound.org (CC0 license) or AI-generated, processed with EQ for warm register
- Clean up on unmount: `soundCache.forEach(s => s.unloadAsync())` in app cleanup
