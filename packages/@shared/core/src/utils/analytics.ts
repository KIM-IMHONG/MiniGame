/**
 * 간단한 이벤트 추적 시스템
 * 실제 애널리틱스 서비스(Firebase 등)와의 연동 포인트
 */

export interface AnalyticsEvent {
  name: string;
  params?: Record<string, string | number | boolean>;
  timestamp: number;
}

export type AnalyticsHandler = (event: AnalyticsEvent) => void;

let handlers: AnalyticsHandler[] = [];
let enabled = true;

export function addAnalyticsHandler(handler: AnalyticsHandler): () => void {
  handlers.push(handler);
  return () => {
    handlers = handlers.filter((h) => h !== handler);
  };
}

export function setAnalyticsEnabled(value: boolean): void {
  enabled = value;
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!enabled) return;

  const event: AnalyticsEvent = {
    name,
    params,
    timestamp: Date.now(),
  };

  handlers.forEach((handler) => {
    try {
      handler(event);
    } catch (e) {
      // 애널리틱스 에러가 게임에 영향 주면 안 됨
      console.warn('[Analytics] Handler error:', e);
    }
  });
}

export function resetAnalytics(): void {
  handlers = [];
  enabled = true;
}

// 미리 정의된 이벤트 헬퍼
export const GameEvents = {
  gameStart: (gameId: string) =>
    trackEvent('game_start', { game_id: gameId }),

  gameOver: (gameId: string, score: number) =>
    trackEvent('game_over', { game_id: gameId, score }),

  highScore: (gameId: string, score: number) =>
    trackEvent('high_score', { game_id: gameId, score }),

  adShown: (type: 'banner' | 'interstitial' | 'rewarded') =>
    trackEvent('ad_shown', { ad_type: type }),

  adClicked: (type: 'banner' | 'interstitial' | 'rewarded') =>
    trackEvent('ad_clicked', { ad_type: type }),

  rewardEarned: (gameId: string, rewardType: string) =>
    trackEvent('reward_earned', { game_id: gameId, reward_type: rewardType }),
};
