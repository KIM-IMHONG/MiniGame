import { useCallback } from 'react';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

let hapticsModule: any = null;
let hapticsEnabled = true;

export function setHapticsModule(mod: any): void {
  hapticsModule = mod;
}

export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
}

export function useHaptics() {
  const trigger = useCallback(async (type: HapticType = 'light') => {
    if (!hapticsEnabled || !hapticsModule) return;

    try {
      switch (type) {
        case 'light':
          await hapticsModule.impactAsync(hapticsModule.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await hapticsModule.impactAsync(hapticsModule.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await hapticsModule.impactAsync(hapticsModule.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await hapticsModule.notificationAsync(hapticsModule.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await hapticsModule.notificationAsync(hapticsModule.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await hapticsModule.notificationAsync(hapticsModule.NotificationFeedbackType.Error);
          break;
      }
    } catch {
      // 진동 실패는 무시 (시뮬레이터 등)
    }
  }, []);

  return { trigger };
}
