import {
  addAnalyticsHandler,
  trackEvent,
  setAnalyticsEnabled,
  resetAnalytics,
  GameEvents,
} from '../analytics';
import type { AnalyticsEvent } from '../analytics';

describe('analytics', () => {
  beforeEach(() => {
    resetAnalytics();
  });

  it('핸들러에 이벤트 전달', () => {
    const events: AnalyticsEvent[] = [];
    addAnalyticsHandler((e) => events.push(e));

    trackEvent('test_event', { key: 'value' });

    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('test_event');
    expect(events[0].params).toEqual({ key: 'value' });
    expect(events[0].timestamp).toBeGreaterThan(0);
  });

  it('비활성화 시 이벤트 무시', () => {
    const events: AnalyticsEvent[] = [];
    addAnalyticsHandler((e) => events.push(e));

    setAnalyticsEnabled(false);
    trackEvent('ignored');

    expect(events).toHaveLength(0);
  });

  it('핸들러 제거', () => {
    const events: AnalyticsEvent[] = [];
    const remove = addAnalyticsHandler((e) => events.push(e));

    trackEvent('before');
    remove();
    trackEvent('after');

    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('before');
  });

  it('핸들러 에러가 다른 핸들러에 영향 안 줌', () => {
    const events: AnalyticsEvent[] = [];
    addAnalyticsHandler(() => { throw new Error('fail'); });
    addAnalyticsHandler((e) => events.push(e));

    const spy = jest.spyOn(console, 'warn').mockImplementation();
    trackEvent('still_works');
    spy.mockRestore();

    expect(events).toHaveLength(1);
  });

  it('GameEvents 헬퍼', () => {
    const events: AnalyticsEvent[] = [];
    addAnalyticsHandler((e) => events.push(e));

    GameEvents.gameStart('bubble');
    GameEvents.gameOver('bubble', 1500);
    GameEvents.highScore('bubble', 3000);
    GameEvents.adShown('rewarded');

    expect(events).toHaveLength(4);
    expect(events[0].name).toBe('game_start');
    expect(events[1].params).toEqual({ game_id: 'bubble', score: 1500 });
  });
});
