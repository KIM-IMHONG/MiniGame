import { AdFrequencyManager } from '../AdFrequencyManager';

describe('AdFrequencyManager', () => {
  let manager: AdFrequencyManager;

  beforeEach(() => {
    manager = new AdFrequencyManager({
      interstitialEveryN: 3,
      gracePlayCount: 2,
      minIntervalMs: 60_000,
      maxPerSession: 10,
    });
  });

  it('그레이스 기간에는 광고 안 보여줌', () => {
    manager.recordPlay(); // 1판
    expect(manager.shouldShowInterstitial()).toBe(false);
    manager.recordPlay(); // 2판
    expect(manager.shouldShowInterstitial()).toBe(false);
  });

  it('그레이스 후 N판마다 광고 보여줌', () => {
    for (let i = 0; i < 3; i++) manager.recordPlay();
    expect(manager.shouldShowInterstitial()).toBe(true);
  });

  it('N판 아닐 때는 안 보여줌', () => {
    for (let i = 0; i < 4; i++) manager.recordPlay();
    expect(manager.shouldShowInterstitial()).toBe(false);
  });

  it('광고 후 최소 간격 체크', () => {
    for (let i = 0; i < 3; i++) manager.recordPlay();
    manager.recordShow();
    for (let i = 0; i < 3; i++) manager.recordPlay(); // 6판
    expect(manager.shouldShowInterstitial()).toBe(false); // 60초 안 됨
  });

  it('세션 최대 횟수 초과 시 안 보여줌', () => {
    const maxManager = new AdFrequencyManager({
      interstitialEveryN: 1,
      gracePlayCount: 0,
      minIntervalMs: 0,
      maxPerSession: 2,
    });

    maxManager.recordPlay();
    maxManager.recordShow();
    maxManager.recordPlay();
    maxManager.recordShow();
    maxManager.recordPlay();
    expect(maxManager.shouldShowInterstitial()).toBe(false);
  });

  it('reset 후 초기화', () => {
    for (let i = 0; i < 5; i++) manager.recordPlay();
    manager.reset();
    manager.recordPlay();
    expect(manager.shouldShowInterstitial()).toBe(false);
    expect(manager.getPlayCount()).toBe(1);
    expect(manager.getShowCount()).toBe(0);
  });

  it('기본 설정 사용', () => {
    const defaultManager = new AdFrequencyManager();
    for (let i = 0; i < 3; i++) defaultManager.recordPlay();
    expect(defaultManager.shouldShowInterstitial()).toBe(true);
  });

  it('playCount와 showCount 추적', () => {
    manager.recordPlay();
    manager.recordPlay();
    expect(manager.getPlayCount()).toBe(2);

    for (let i = 0; i < 1; i++) manager.recordPlay();
    manager.recordShow();
    expect(manager.getShowCount()).toBe(1);
  });
});
