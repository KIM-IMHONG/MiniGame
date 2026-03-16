import { useEffect } from 'react';

let screenOrientationModule: any = null;

export function setScreenOrientationModule(mod: any): void {
  screenOrientationModule = mod;
}

export type OrientationLock = 'portrait' | 'landscape' | 'default';

export function useOrientation(lock: OrientationLock = 'portrait') {
  useEffect(() => {
    if (!screenOrientationModule) return;

    const lockOrientation = async () => {
      try {
        switch (lock) {
          case 'portrait':
            await screenOrientationModule.lockAsync(
              screenOrientationModule.OrientationLock.PORTRAIT_UP,
            );
            break;
          case 'landscape':
            await screenOrientationModule.lockAsync(
              screenOrientationModule.OrientationLock.LANDSCAPE,
            );
            break;
          case 'default':
            await screenOrientationModule.unlockAsync();
            break;
        }
      } catch {
        // 방향 잠금 실패 무시
      }
    };

    lockOrientation();

    return () => {
      screenOrientationModule?.unlockAsync?.().catch(() => {});
    };
  }, [lock]);
}
