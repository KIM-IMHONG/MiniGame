export interface AdAppConfig {
  androidAppId: string;
  iosAppId: string;
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  rewardedAdUnitId: string;
  testMode: boolean;
}

let mobileAdsModule: any = null;
let initialized = false;

export function setMobileAdsModule(mod: any): void {
  mobileAdsModule = mod;
}

export class AdManager {
  static async initialize(_config: AdAppConfig): Promise<void> {
    if (initialized) return;
    if (!mobileAdsModule) {
      console.warn('[AdManager] mobileAds module not set');
      return;
    }

    await mobileAdsModule().initialize();
    initialized = true;
  }

  static isInitialized(): boolean {
    return initialized;
  }

  static reset(): void {
    initialized = false;
  }
}
