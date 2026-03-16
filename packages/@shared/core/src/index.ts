// Types
export type { GameState, RewardType, GameControls, CrossPromoApp, GameWrapperConfig } from './types/game';
export type { AdAppConfig, FrequencyConfig } from './types/ads';

// Ads
export { AdFrequencyManager } from './ads/AdFrequencyManager';

// Utils
export { SeededRandom, createTimeSeed } from './utils/random';
export { calculateGameArea, scaleSize } from './utils/screen';
export { setStorageAdapter, getItem, setItem, removeItem } from './utils/storage';
export { trackEvent, addAnalyticsHandler, setAnalyticsEnabled, resetAnalytics, GameEvents } from './utils/analytics';

// Stores
export { createScoreStore } from './stores/useScoreStore';
export type { ScoreStore, ScoreState, ScoreActions } from './stores/useScoreStore';
export { createSettingsStore } from './stores/useSettingsStore';
export type { SettingsStore, SettingsState, SettingsActions } from './stores/useSettingsStore';

// Theme
export { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } from './theme';
