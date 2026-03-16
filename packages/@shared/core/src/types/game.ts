export type GameState = 'ready' | 'playing' | 'paused' | 'gameover';

export type RewardType = 'hint' | 'revive' | 'bonus';

export interface GameControls {
  reportScore: (score: number) => void;
  reportGameOver: (finalScore: number) => void;
  requestReward: () => Promise<boolean>;
  isPaused: boolean;
}

export interface CrossPromoApp {
  name: string;
  tagline: string;
  iconSource: any;
  androidUrl: string;
  iosUrl: string;
}

export interface GameWrapperConfig {
  gameId: string;
  gameName: string;
  adUnitIds: {
    interstitial: string;
    rewarded: string;
    banner: string;
  };
  frequencyConfig?: Partial<import('./ads').FrequencyConfig>;
  rewardType?: RewardType;
  rewardLabel?: string;
  showTimer?: boolean;
  crossPromoApps?: CrossPromoApp[];
}
