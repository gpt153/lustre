'use client';

class SoundManager {
  private context: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private enabled = false;
  private isInitializing = false;

  async init(): Promise<void> {
    if (this.context || this.isInitializing) return;
    this.isInitializing = true;

    try {
      this.context = new AudioContext();
      await Promise.all([
        this.load('like', '/sounds/like.mp3'),
        this.load('match', '/sounds/match.mp3'),
        this.load('message', '/sounds/message.mp3'),
        this.load('send', '/sounds/send.mp3'),
      ]);
      this.enabled = true;
    } catch (error) {
      console.error('SoundManager initialization failed:', error);
      this.isInitializing = false;
    }
  }

  private async load(name: string, url: string): Promise<void> {
    if (!this.context) return;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to fetch sound ${name}: ${response.statusText}`);
        return;
      }

      const buffer = await response.arrayBuffer();
      const decoded = await this.context.decodeAudioData(buffer);
      this.buffers.set(name, decoded);
    } catch (error) {
      console.warn(`Failed to load sound ${name}:`, error);
    }
  }

  play(name: string, volume = 0.5): void {
    if (!this.context || !this.enabled || !this.buffers.has(name)) return;

    try {
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();

      source.buffer = this.buffers.get(name)!;
      gain.gain.value = Math.max(0, Math.min(1, volume));

      source.connect(gain).connect(this.context.destination);
      source.start(0);
    } catch (error) {
      console.error(`Failed to play sound ${name}:`, error);
    }
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async resume(): Promise<void> {
    if (this.context && this.context.state === 'suspended') {
      try {
        await this.context.resume();
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
      }
    }
  }
}

export const soundManager = new SoundManager();

// Initialize on first user interaction
if (typeof window !== 'undefined') {
  const initSoundManager = async () => {
    await soundManager.init();
    await soundManager.resume();
    document.removeEventListener('click', initSoundManager);
    document.removeEventListener('keydown', initSoundManager);
    document.removeEventListener('touchstart', initSoundManager);
  };

  document.addEventListener('click', initSoundManager, { once: true });
  document.addEventListener('keydown', initSoundManager, { once: true });
  document.addEventListener('touchstart', initSoundManager, { once: true });
}
