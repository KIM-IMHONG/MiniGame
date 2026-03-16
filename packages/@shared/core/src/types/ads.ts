export interface AdAppConfig {
  androidAppId: string;
  iosAppId: string;
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  rewardedAdUnitId: string;
  testMode: boolean;
}

export interface FrequencyConfig {
  interstitialEveryN: number;
  minIntervalMs: number;
  gracePlayCount: number;
  maxPerSession: number;
}
