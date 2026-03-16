import { useCallback, useRef, useEffect } from 'react';

export interface SoundAssets {
  [key: string]: any; // require() 또는 URI
}

let audioModule: any = null;
let soundEnabled = true;

export function setAudioModule(mod: any): void {
  audioModule = mod;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

export function useSound(assets: SoundAssets) {
  const soundsRef = useRef<Map<string, any>>(new Map());
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!audioModule || loadedRef.current) return;

    const loadSounds = async () => {
      for (const [key, source] of Object.entries(assets)) {
        try {
          const { sound } = await audioModule.Sound.createAsync(source);
          soundsRef.current.set(key, sound);
        } catch {
          // 로드 실패 무시
        }
      }
      loadedRef.current = true;
    };

    loadSounds();

    return () => {
      soundsRef.current.forEach((sound) => {
        try {
          sound.unloadAsync();
        } catch {
          // 정리 실패 무시
        }
      });
      soundsRef.current.clear();
      loadedRef.current = false;
    };
  }, []);

  const play = useCallback(async (key: string) => {
    if (!soundEnabled) return;
    const sound = soundsRef.current.get(key);
    if (!sound) return;

    try {
      await sound.replayAsync();
    } catch {
      // 재생 실패 무시
    }
  }, []);

  return { play };
}
