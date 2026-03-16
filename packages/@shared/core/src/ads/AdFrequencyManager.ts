import type { FrequencyConfig } from '../types/ads';

const DEFAULT_CONFIG: FrequencyConfig = {
  interstitialEveryN: 3,
  minIntervalMs: 60_000,
  gracePlayCount: 2,
  maxPerSession: 10,
};

export class AdFrequencyManager {
  private playCount = 0;
  private showCount = 0;
  private lastShowTime = 0;
  private config: FrequencyConfig;

  constructor(config: Partial<FrequencyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  recordPlay(): void {
    this.playCount++;
  }

  shouldShowInterstitial(): boolean {
    if (this.playCount <= this.config.gracePlayCount) return false;
    if (this.showCount >= this.config.maxPerSession) return false;

    const now = Date.now();
    if (now - this.lastShowTime < this.config.minIntervalMs) return false;

    if (this.playCount % this.config.interstitialEveryN !== 0) return false;

    return true;
  }

  recordShow(): void {
    this.showCount++;
    this.lastShowTime = Date.now();
  }

  reset(): void {
    this.playCount = 0;
    this.showCount = 0;
    this.lastShowTime = 0;
  }

  getPlayCount(): number {
    return this.playCount;
  }

  getShowCount(): number {
    return this.showCount;
  }
}
