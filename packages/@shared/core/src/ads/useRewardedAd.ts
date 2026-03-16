import { useCallback, useEffect, useRef, useState } from 'react';

interface UseRewardedAdOptions {
  adUnitId: string;
  testMode?: boolean;
}

interface UseRewardedAdReturn {
  showAd: () => Promise<boolean>;
  isLoaded: boolean;
  isEarned: boolean;
  resetEarned: () => void;
}

let adModules: any = null;

export function setRewardedAdModules(modules: any): void {
  adModules = modules;
}

export function useRewardedAd({
  adUnitId,
  testMode,
}: UseRewardedAdOptions): UseRewardedAdReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEarned, setIsEarned] = useState(false);
  const adRef = useRef<any>(null);
  const cleanupRef = useRef<Array<() => void>>([]);

  const loadAd = useCallback(() => {
    if (!adModules) return;

    cleanupRef.current.forEach((fn) => fn());
    cleanupRef.current = [];

    const { RewardedAd, RewardedAdEventType, AdEventType, TestIds } = adModules;
    const unitId = testMode ? TestIds.REWARDED : adUnitId;

    const rewarded = RewardedAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubs = [
      rewarded.addAdEventListener(RewardedAdEventType.LOADED, () =>
        setIsLoaded(true),
      ),
      rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () =>
        setIsEarned(true),
      ),
      rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        setIsLoaded(false);
        setTimeout(() => loadAd(), 1000);
      }),
      rewarded.addAdEventListener(AdEventType.ERROR, () => {
        setIsLoaded(false);
        setTimeout(() => loadAd(), 30_000);
      }),
    ];

    cleanupRef.current = unsubs;
    rewarded.load();
    adRef.current = rewarded;
  }, [adUnitId, testMode]);

  useEffect(() => {
    loadAd();
    return () => cleanupRef.current.forEach((fn) => fn());
  }, [loadAd]);

  const showAd = useCallback(async (): Promise<boolean> => {
    if (!adRef.current || !isLoaded) return false;
    try {
      setIsEarned(false);
      await adRef.current.show();
      return true;
    } catch {
      return false;
    }
  }, [isLoaded]);

  const resetEarned = useCallback(() => setIsEarned(false), []);

  return { showAd, isLoaded, isEarned, resetEarned };
}
