import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInterstitialAdOptions {
  adUnitId: string;
  testMode?: boolean;
}

interface UseInterstitialAdReturn {
  showInterstitial: () => Promise<boolean>;
  isLoaded: boolean;
}

// 실제 RN 환경에서만 동작, 웹/테스트에서는 noop
let adModules: any = null;

export function setInterstitialAdModules(modules: any): void {
  adModules = modules;
}

export function useInterstitialAd({
  adUnitId,
  testMode,
}: UseInterstitialAdOptions): UseInterstitialAdReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const adRef = useRef<any>(null);
  const cleanupRef = useRef<Array<() => void>>([]);

  const loadAd = useCallback(() => {
    if (!adModules) return;

    cleanupRef.current.forEach((fn) => fn());
    cleanupRef.current = [];

    const { InterstitialAd, AdEventType, TestIds } = adModules;
    const unitId = testMode ? TestIds.INTERSTITIAL : adUnitId;

    const interstitial = InterstitialAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubs = [
      interstitial.addAdEventListener(AdEventType.LOADED, () =>
        setIsLoaded(true),
      ),
      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        setIsLoaded(false);
        setTimeout(() => loadAd(), 1000);
      }),
      interstitial.addAdEventListener(AdEventType.ERROR, () => {
        setIsLoaded(false);
        setTimeout(() => loadAd(), 30_000);
      }),
    ];

    cleanupRef.current = unsubs;
    interstitial.load();
    adRef.current = interstitial;
  }, [adUnitId, testMode]);

  useEffect(() => {
    loadAd();
    return () => cleanupRef.current.forEach((fn) => fn());
  }, [loadAd]);

  const showInterstitial = useCallback(async (): Promise<boolean> => {
    if (!adRef.current || !isLoaded) return false;
    try {
      await adRef.current.show();
      return true;
    } catch {
      return false;
    }
  }, [isLoaded]);

  return { showInterstitial, isLoaded };
}
