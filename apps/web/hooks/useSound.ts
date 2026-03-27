'use client';

import { useEffect, useCallback, useRef } from 'react';
import { soundManager } from '@/lib/sound-manager';

type SoundType = 'like' | 'match' | 'message' | 'send';

export function useSound() {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      soundManager.init();
    }
  }, []);

  const play = useCallback((soundType: SoundType, volume?: number) => {
    soundManager.play(soundType, volume);
  }, []);

  const enable = useCallback(() => {
    soundManager.setEnabled(true);
  }, []);

  const disable = useCallback(() => {
    soundManager.setEnabled(false);
  }, []);

  const isEnabled = useCallback(() => {
    return soundManager.isEnabled();
  }, []);

  return {
    play,
    enable,
    disable,
    isEnabled,
  };
}
