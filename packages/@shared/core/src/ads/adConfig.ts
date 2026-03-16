import type { AdAppConfig } from '../types/ads';

const TEST_AD_CONFIG: AdAppConfig = {
  androidAppId: 'ca-app-pub-3940256099942544~3347511713',
  iosAppId: 'ca-app-pub-3940256099942544~1458002511',
  bannerAdUnitId: 'ca-app-pub-3940256099942544/6300978111',
  interstitialAdUnitId: 'ca-app-pub-3940256099942544/1033173712',
  rewardedAdUnitId: 'ca-app-pub-3940256099942544/5224354917',
  testMode: true,
};

export function getAdConfig(
  productionConfig?: Partial<AdAppConfig>,
  isTestMode: boolean = __DEV__,
): AdAppConfig {
  if (isTestMode) {
    return TEST_AD_CONFIG;
  }

  if (!productionConfig) {
    console.warn('[AdConfig] Production config not provided, using test config');
    return TEST_AD_CONFIG;
  }

  return {
    ...TEST_AD_CONFIG,
    ...productionConfig,
    testMode: false,
  };
}

declare const __DEV__: boolean;
