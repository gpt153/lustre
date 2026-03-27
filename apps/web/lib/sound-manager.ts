// Lazy AudioContext — created on first user gesture
let ctx: AudioContext | null = null
const bufferCache = new Map<string, AudioBuffer>()

function getContext(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// Sound names and their paths
const SOUNDS = {
  like: '/sounds/like.mp3',
  match: '/sounds/match.mp3',
  'message-receive': '/sounds/message-receive.mp3',
  'message-send': '/sounds/message-send.mp3',
  'mode-switch': '/sounds/mode-switch.mp3',
} as const

type SoundName = keyof typeof SOUNDS

// Tone definitions used as fallback when file fetch fails
const TONE_FALLBACKS: Record<SoundName, { frequency: number; duration: number }> = {
  like: { frequency: 523, duration: 0.2 },           // C5
  match: { frequency: 659, duration: 0.4 },           // E5
  'message-receive': { frequency: 440, duration: 0.15 }, // A4
  'message-send': { frequency: 392, duration: 0.1 },  // G4
  'mode-switch': { frequency: 349, duration: 0.25 },  // F4
}

function generateTone(
  frequency: number,
  duration: number,
  volume: number,
): AudioBuffer {
  const audioCtx = getContext()
  const sampleRate = audioCtx.sampleRate
  const length = Math.floor(sampleRate * duration)
  const buffer = audioCtx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate
    const envelope = Math.exp((-3 * t) / duration) // decay envelope
    data[i] = Math.sin(2 * Math.PI * frequency * t) * volume * envelope
  }
  return buffer
}

async function loadSound(name: SoundName): Promise<AudioBuffer> {
  if (bufferCache.has(name)) return bufferCache.get(name)!

  try {
    const response = await fetch(SOUNDS[name])
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await getContext().decodeAudioData(arrayBuffer)
    bufferCache.set(name, audioBuffer)
    return audioBuffer
  } catch {
    // Fall back to programmatic tone generation
    const { frequency, duration } = TONE_FALLBACKS[name]
    const audioBuffer = generateTone(frequency, duration, 0.8)
    bufferCache.set(name, audioBuffer)
    return audioBuffer
  }
}

export async function playSound(name: SoundName, volume = 0.4): Promise<void> {
  try {
    const audioCtx = getContext()
    const buffer = await loadSound(name)
    const source = audioCtx.createBufferSource()
    const gain = audioCtx.createGain()
    gain.gain.value = volume
    source.buffer = buffer
    source.connect(gain).connect(audioCtx.destination)
    source.start()
  } catch {
    // Silently fail — sound is non-critical
  }
}
