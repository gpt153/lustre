/**
 * Sound registry for Lustre.
 *
 * Sound files will be added as compressed AAC files in assets/sounds/.
 * For now, we define the registry with require() paths that will resolve
 * once the actual audio files are added.
 *
 * Until real audio files exist, all sounds use placeholder requires
 * that gracefully fail (the hook handles missing files).
 */

export const SOUND_KEYS = [
  'match',        // Match ceremony — warm chime
  'like',         // Like action — subtle pop
  'message',      // New message received — soft ding
  'modeSwitch',   // Vanilla ↔ Spicy toggle — whoosh
  'ceremony',     // Consent ceremony complete — gentle bells
] as const

export type SoundKey = typeof SOUND_KEYS[number]

export interface SoundConfig {
  /** Volume 0-1 (default 0.6) */
  volume: number
  /** Whether this sound can overlap with itself (default false) */
  allowOverlap: boolean
}

export const SOUND_CONFIGS: Record<SoundKey, SoundConfig> = {
  match:      { volume: 0.7, allowOverlap: false },
  like:       { volume: 0.4, allowOverlap: true },
  message:    { volume: 0.5, allowOverlap: false },
  modeSwitch: { volume: 0.5, allowOverlap: false },
  ceremony:   { volume: 0.6, allowOverlap: false },
} as const
