# 🎮 미니게임 아케이드 — 마스터 설계 문서 v2

## 모노레포 + 공통 모듈 우선 개발 + 개별 앱 배포 전략

---

## 목차

1. [전략 요약](#1-전략-요약)
2. [모노레포 구조](#2-모노레포-구조)
3. [Phase 0: 공통 모듈 개발 & 테스트](#3-phase-0-공통-모듈-개발--테스트)
4. [Phase 1: 첫 번째 앱 — 버블 슈터](#4-phase-1-버블-슈터)
5. [Phase 2: 두 번째 앱 — 스도쿠](#5-phase-2-스도쿠)
6. [Phase 3: 세 번째 앱 — 똥 피하기](#6-phase-3-똥-피하기)
7. [디자인 & 에셋 파이프라인](#7-디자인--에셋-파이프라인)
8. [MCP 구성](#8-mcp-구성)
9. [AdMob 수익 전략](#9-admob-수익-전략)
10. [배포 & 크로스 프로모션](#10-배포--크로스-프로모션)

---

## 1. 전략 요약

```
핵심 원칙:
  1. 공통 모듈 먼저 만들고 → 독립 테스트 완료 → 템플릿화
  2. 게임은 개별 앱으로 배포 (ASO + AdMob 최적화)
  3. 코드는 모노레포에서 공유 (개발 효율)
  4. 에셋은 AI MCP + 무료 팩 조합 (이모지 안 씀)

개발 순서:
  Phase 0 → 공통 모듈 개발 + 테스트 + 템플릿 앱
  Phase 1 → 버블 슈터 (첫 번째 앱 출시)
  Phase 2 → 스도쿠 (두 번째 앱 출시)
  Phase 3 → 똥 피하기 (세 번째 앱 출시)
```

---

## 2. 모노레포 구조

### 기술 스택

| 레이어 | 기술 | 이유 |
|--------|------|------|
| 모노레포 | Yarn Workspaces + Turborepo | 패키지 간 의존성 관리, 병렬 빌드 |
| 프레임워크 | Expo SDK 53+ | 크로스 플랫폼, EAS Build |
| 언어 | TypeScript (strict) | Claude Code 타입 추론 정확도 |
| 물리 엔진 | react-native-game-engine + matter-js | 검증된 2D 물리 |
| 그래픽 | @shopify/react-native-skia | 60fps 커스텀 렌더링 |
| 애니메이션 | react-native-reanimated | UI 스레드 애니메이션 |
| 광고 | react-native-google-mobile-ads | AdMob 공식 |
| 상태관리 | zustand | 가볍고 빠름 |
| 네비게이션 | expo-router | 파일 기반 라우팅 |
| 로컬 저장 | @react-native-async-storage | 점수, 설정 |
| 테스트 | jest + @testing-library/react-native | 단위 + 통합 |

### 폴더 구조

```
mini-game-monorepo/
│
├── packages/
│   │
│   ├── @shared/core/                    ← 📦 공통 핵심 모듈
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── ads/
│   │   │   │   ├── AdManager.ts          ← 광고 초기화/라이프사이클
│   │   │   │   ├── useRewardedAd.ts      ← 보상형 광고 훅
│   │   │   │   ├── useInterstitialAd.ts  ← 전면 광고 훅
│   │   │   │   ├── BannerAdView.tsx      ← 배너 컴포넌트
│   │   │   │   ├── AdFrequencyManager.ts ← 광고 빈도 제어
│   │   │   │   ├── adConfig.ts           ← 설정 타입 정의
│   │   │   │   └── __tests__/
│   │   │   │       ├── useRewardedAd.test.ts
│   │   │   │       ├── useInterstitialAd.test.ts
│   │   │   │       └── AdFrequencyManager.test.ts
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── GameWrapper.tsx        ← 모든 게임의 공통 래퍼
│   │   │   │   ├── GameOverModal.tsx      ← 게임오버 + 광고 트리거
│   │   │   │   ├── PauseMenu.tsx          ← 일시정지 메뉴
│   │   │   │   ├── ScoreDisplay.tsx       ← 점수 표시 (애니메이션)
│   │   │   │   ├── CountdownTimer.tsx     ← 카운트다운
│   │   │   │   ├── CrossPromotion.tsx     ← 다른 게임 홍보 배너
│   │   │   │   └── __tests__/
│   │   │   │       ├── GameWrapper.test.tsx
│   │   │   │       └── GameOverModal.test.tsx
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   ├── useScoreStore.ts       ← 하이스코어 (AsyncStorage)
│   │   │   │   ├── useSettingsStore.ts    ← 소리, 진동 설정
│   │   │   │   ├── useAdStore.ts          ← 광고 상태 추적
│   │   │   │   └── __tests__/
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useHaptics.ts          ← 진동 피드백
│   │   │   │   ├── useSound.ts            ← 효과음 재생
│   │   │   │   ├── useAppState.ts         ← 앱 포/백그라운드
│   │   │   │   └── useOrientation.ts      ← 화면 방향 잠금
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── analytics.ts           ← 이벤트 추적
│   │   │   │   ├── storage.ts             ← AsyncStorage 래퍼
│   │   │   │   ├── random.ts              ← 시드 기반 랜덤
│   │   │   │   └── screen.ts              ← 화면 크기 유틸
│   │   │   │
│   │   │   ├── theme/
│   │   │   │   ├── colors.ts              ← 공통 팔레트
│   │   │   │   ├── fonts.ts               ← 폰트 설정
│   │   │   │   ├── spacing.ts             ← 간격 시스템
│   │   │   │   └── shadows.ts             ← 그림자 프리셋
│   │   │   │
│   │   │   └── types/
│   │   │       ├── game.ts                ← GameProps, GameState 등
│   │   │       └── ads.ts                 ← AdConfig 타입
│   │   │
│   │   └── jest.config.js
│   │
│   ├── @shared/ui/                       ← 📦 공통 UI 컴포넌트
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── IconButton.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── AnimatedNumber.tsx
│   │   │   └── __tests__/
│   │   └── jest.config.js
│   │
│   ├── @shared/game-engine/              ← 📦 게임 엔진 래퍼
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── GameLoop.tsx              ← RNGE 래퍼 (에러 바운더리)
│   │   │   ├── PhysicsWorld.ts           ← matter-js 초기화 헬퍼
│   │   │   ├── CollisionManager.ts       ← 충돌 감지 유틸
│   │   │   ├── SkiaRenderer.tsx          ← Skia 렌더링 베이스
│   │   │   └── __tests__/
│   │   └── jest.config.js
│   │
│   ├── app-template/                     ← 📋 앱 템플릿 (복사용)
│   │   ├── app/
│   │   │   ├── _layout.tsx               ← AdMob 초기화 + 설정
│   │   │   ├── index.tsx                 ← 메인 화면
│   │   │   ├── game.tsx                  ← 게임 화면
│   │   │   └── settings.tsx              ← 설정 화면
│   │   ├── app.json.template             ← 앱별 값 치환용
│   │   ├── eas.json
│   │   └── package.json.template
│   │
│   ├── app-bubble-shooter/               ← 🫧 버블 슈터 앱
│   │   ├── app/
│   │   ├── src/
│   │   │   ├── game/
│   │   │   │   ├── BubbleShooterGame.tsx
│   │   │   │   ├── entities.ts
│   │   │   │   ├── systems.ts
│   │   │   │   ├── physics.ts
│   │   │   │   ├── grid.ts              ← 벌집 격자 로직
│   │   │   │   ├── aiming.ts            ← 조준/발사 로직
│   │   │   │   └── renderers/
│   │   │   │       ├── BubbleRenderer.tsx
│   │   │   │       ├── AimLineRenderer.tsx
│   │   │   │       └── CeilingRenderer.tsx
│   │   │   └── assets/
│   │   ├── app.json
│   │   └── package.json
│   │
│   ├── app-sudoku/                       ← 🔢 스도쿠 앱
│   │   ├── app/
│   │   ├── src/
│   │   │   ├── game/
│   │   │   │   ├── SudokuGame.tsx
│   │   │   │   ├── logic.ts
│   │   │   │   ├── generator.ts
│   │   │   │   └── components/
│   │   │   └── assets/
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── app-dodge-poop/                   ← 💩 똥 피하기 앱
│       ├── app/
│       ├── src/
│       │   ├── game/
│       │   │   ├── DodgePoopGame.tsx
│       │   │   ├── entities.ts
│       │   │   ├── systems.ts
│       │   │   └── renderers/
│       │   └── assets/
│       ├── app.json
│       └── package.json
│
├── scripts/
│   ├── create-app.sh                    ← 템플릿에서 새 앱 생성
│   └── deploy-all.sh                    ← 전체 앱 EAS 빌드
│
├── package.json                          ← workspaces 설정
├── turbo.json                            ← Turborepo 파이프라인
├── tsconfig.base.json                    ← 공통 TS 설정
├── CLAUDE.md                             ← Claude Code 프로젝트 설정
└── jest.config.base.js                   ← 공통 Jest 설정
```

### 루트 package.json

```json
{
  "name": "mini-game-monorepo",
  "private": true,
  "workspaces": [
    "packages/@shared/*",
    "packages/app-*"
  ],
  "scripts": {
    "test:shared": "turbo run test --filter='@shared/*'",
    "test:all": "turbo run test",
    "lint": "turbo run lint",
    "build:shared": "turbo run build --filter='@shared/*'",
    "create-app": "bash scripts/create-app.sh"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.3.0"
  }
}
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    }
  }
}
```

---

## 3. Phase 0: 공통 모듈 개발 & 테스트

### 개발 원칙

```
⚠️ 핵심 규칙:
1. 공통 모듈은 어떤 게임도 import하지 않는다 (의존성 단방향)
2. 공통 모듈만으로 "데모 앱"이 돌아가야 한다
3. 모든 공통 모듈은 unit test 커버리지 80% 이상
4. 게임별 커스터마이징은 "설정 객체"로 주입한다 (하드코딩 금지)
5. Phase 0 완료 기준: 테스트 전체 통과 + 데모 앱 실행 확인
```

### 3.1 @shared/core — 핵심 모듈 상세

#### AdManager (광고 초기화)

```typescript
// packages/@shared/core/src/ads/AdManager.ts

import mobileAds from 'react-native-google-mobile-ads';

export interface AdAppConfig {
  androidAppId: string;
  iosAppId: string;
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  rewardedAdUnitId: string;
  testMode: boolean;
}

export class AdManager {
  private static initialized = false;

  static async initialize(config: AdAppConfig): Promise<void> {
    if (this.initialized) return;

    await mobileAds().initialize();
    this.initialized = true;
  }

  static isInitialized(): boolean {
    return this.initialized;
  }
}
```

#### AdFrequencyManager (광고 빈도 제어 — 가장 중요)

```typescript
// packages/@shared/core/src/ads/AdFrequencyManager.ts

export interface FrequencyConfig {
  interstitialEveryN: number;     // N판마다 전면 광고
  minIntervalMs: number;          // 최소 간격 (밀리초)
  gracePlayCount: number;         // 처음 N판은 광고 없음
  maxPerSession: number;          // 세션당 최대 횟수
}

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
    // 규칙 1: 그레이스 기간
    if (this.playCount <= this.config.gracePlayCount) return false;

    // 규칙 2: 세션 최대
    if (this.showCount >= this.config.maxPerSession) return false;

    // 규칙 3: 최소 간격
    const now = Date.now();
    if (now - this.lastShowTime < this.config.minIntervalMs) return false;

    // 규칙 4: N판마다
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
}
```

#### useRewardedAd (보상형 광고 훅)

```typescript
// packages/@shared/core/src/ads/useRewardedAd.ts

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

interface UseRewardedAdOptions {
  adUnitId: string;
  testMode?: boolean;
}

interface UseRewardedAdReturn {
  showAd: () => Promise<boolean>;
  isLoaded: boolean;
  isEarned: boolean;
  resetEarned: () => void;
}

export function useRewardedAd({
  adUnitId,
  testMode = __DEV__,
}: UseRewardedAdOptions): UseRewardedAdReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEarned, setIsEarned] = useState(false);
  const adRef = useRef<RewardedAd | null>(null);
  const cleanupRef = useRef<(() => void)[]>([]);

  const unitId = testMode ? TestIds.REWARDED : adUnitId;

  const loadAd = useCallback(() => {
    // 이전 리스너 정리
    cleanupRef.current.forEach(fn => fn());
    cleanupRef.current = [];

    const rewarded = RewardedAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubs = [
      rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        setIsLoaded(true);
      }),
      rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        setIsEarned(true);
      }),
      rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        setIsLoaded(false);
        // 닫힌 후 자동 리로드 (약간 딜레이)
        setTimeout(() => loadAd(), 1000);
      }),
      rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
        console.warn('[RewardedAd] Error:', error);
        setIsLoaded(false);
        // 에러 시 재시도 (30초 후)
        setTimeout(() => loadAd(), 30_000);
      }),
    ];

    cleanupRef.current = unsubs;
    rewarded.load();
    adRef.current = rewarded;
  }, [unitId]);

  useEffect(() => {
    loadAd();
    return () => {
      cleanupRef.current.forEach(fn => fn());
    };
  }, [loadAd]);

  const showAd = useCallback(async (): Promise<boolean> => {
    if (!adRef.current || !isLoaded) return false;
    try {
      setIsEarned(false);
      await adRef.current.show();
      return true;
    } catch {
      return false;
    }
  }, [isLoaded]);

  const resetEarned = useCallback(() => setIsEarned(false), []);

  return { showAd, isLoaded, isEarned, resetEarned };
}
```

#### GameWrapper (게임 공통 래퍼)

```typescript
// packages/@shared/core/src/components/GameWrapper.tsx

import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInterstitialAd } from '../ads/useInterstitialAd';
import { useRewardedAd } from '../ads/useRewardedAd';
import { AdFrequencyManager, FrequencyConfig } from '../ads/AdFrequencyManager';
import { useScoreStore } from '../stores/useScoreStore';
import { GameOverModal } from './GameOverModal';
import { PauseMenu } from './PauseMenu';
import { ScoreDisplay } from './ScoreDisplay';
import type { GameState, RewardType } from '../types/game';

export interface GameWrapperConfig {
  gameId: string;
  gameName: string;
  adUnitIds: {
    interstitial: string;
    rewarded: string;
    banner: string;
  };
  frequencyConfig?: Partial<FrequencyConfig>;
  rewardType?: RewardType;          // 'hint' | 'revive' | 'bonus'
  rewardLabel?: string;             // "힌트 받기" | "부활하기"
  showTimer?: boolean;
  crossPromoApps?: CrossPromoApp[]; // 다른 게임 홍보
}

interface Props {
  config: GameWrapperConfig;
  children: (controls: GameControls) => React.ReactNode;
}

export interface GameControls {
  reportScore: (score: number) => void;
  reportGameOver: (finalScore: number) => void;
  requestReward: () => Promise<boolean>;
  isPaused: boolean;
}

export function GameWrapper({ config, children }: Props) {
  const [gameState, setGameState] = useState<GameState>('playing');
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const frequencyManager = useRef(
    new AdFrequencyManager(config.frequencyConfig)
  ).current;

  const { showInterstitial } = useInterstitialAd({
    adUnitId: config.adUnitIds.interstitial,
  });

  const { showAd: showRewarded, isLoaded: rewardReady, isEarned } =
    useRewardedAd({ adUnitId: config.adUnitIds.rewarded });

  const { updateHighScore, getHighScore } = useScoreStore();

  const handleGameOver = useCallback(
    async (finalScore: number) => {
      setScore(finalScore);
      setGameState('gameover');
      updateHighScore(config.gameId, finalScore);
      frequencyManager.recordPlay();

      if (frequencyManager.shouldShowInterstitial()) {
        await showInterstitial();
        frequencyManager.recordShow();
      }
    },
    [config.gameId, frequencyManager, showInterstitial, updateHighScore]
  );

  const handleReward = useCallback(async (): Promise<boolean> => {
    if (!rewardReady) return false;
    return showRewarded();
  }, [rewardReady, showRewarded]);

  const handleRestart = useCallback(() => {
    setGameState('playing');
    setScore(0);
  }, []);

  const controls: GameControls = {
    reportScore: setScore,
    reportGameOver: handleGameOver,
    requestReward: handleReward,
    isPaused,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      {/* 점수 표시 */}
      <ScoreDisplay
        score={score}
        highScore={getHighScore(config.gameId)}
        onPause={() => setIsPaused(true)}
      />

      {/* 게임 영역 */}
      <View style={styles.gameArea}>
        {children(controls)}
      </View>

      {/* 일시정지 */}
      {isPaused && (
        <PauseMenu
          onResume={() => setIsPaused(false)}
          onRestart={handleRestart}
        />
      )}

      {/* 게임오버 */}
      {gameState === 'gameover' && (
        <GameOverModal
          score={score}
          highScore={getHighScore(config.gameId)}
          rewardType={config.rewardType}
          rewardLabel={config.rewardLabel}
          rewardReady={rewardReady}
          onReward={handleReward}
          isEarned={isEarned}
          onRestart={handleRestart}
          crossPromoApps={config.crossPromoApps}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1E' },
  gameArea: { flex: 1 },
});
```

#### 테스트 코드 예시

```typescript
// packages/@shared/core/src/ads/__tests__/AdFrequencyManager.test.ts

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

  it('광고 후 최소 간격 체크', () => {
    for (let i = 0; i < 3; i++) manager.recordPlay();
    manager.recordShow(); // 방금 보여줌
    manager.recordPlay();
    manager.recordPlay();
    manager.recordPlay(); // 6판째지만 60초 안 됨
    expect(manager.shouldShowInterstitial()).toBe(false);
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
    maxManager.recordPlay(); // 3번째
    expect(maxManager.shouldShowInterstitial()).toBe(false);
  });

  it('reset 후 초기화', () => {
    for (let i = 0; i < 5; i++) manager.recordPlay();
    manager.reset();
    manager.recordPlay();
    expect(manager.shouldShowInterstitial()).toBe(false); // 다시 그레이스
  });
});
```

### 3.2 Phase 0 완료 체크리스트

```
@shared/core:
  [  ] AdManager — 초기화/상태 확인
  [  ] AdFrequencyManager — 빈도 제어 (테스트 완료)
  [  ] useRewardedAd — 보상형 광고 훅 (테스트 완료)
  [  ] useInterstitialAd — 전면 광고 훅 (테스트 완료)
  [  ] BannerAdView — 배너 컴포넌트
  [  ] GameWrapper — 게임 래퍼 (테스트 완료)
  [  ] GameOverModal — 게임오버 (테스트 완료)
  [  ] PauseMenu — 일시정지
  [  ] ScoreDisplay — 점수 표시
  [  ] useScoreStore — 하이스코어 (테스트 완료)
  [  ] useSettingsStore — 설정 (테스트 완료)
  [  ] useHaptics — 진동
  [  ] useSound — 효과음
  [  ] CrossPromotion — 크로스 프로모션 배너
  [  ] theme/ — 색상, 폰트, 간격
  [  ] types/ — 타입 정의

@shared/ui:
  [  ] Button, Card, Modal, IconButton
  [  ] ProgressBar, AnimatedNumber
  [  ] 각 컴포넌트 테스트

@shared/game-engine:
  [  ] GameLoop 래퍼 (에러 바운더리 포함)
  [  ] PhysicsWorld 헬퍼
  [  ] CollisionManager
  [  ] SkiaRenderer 베이스

app-template:
  [  ] 데모 앱으로 공통 모듈 전체 통합 테스트
  [  ] AdMob 테스트 광고 동작 확인
  [  ] GameWrapper 플로우 확인 (게임→게임오버→광고→재시작)

모든 테스트 통과: yarn test:shared → 0 failures
```

### 3.3 Claude Code 프롬프트 순서 (Phase 0)

```
프롬프트 1: 모노레포 초기화
"Yarn Workspaces + Turborepo 기반 모노레포를 초기화해줘.
packages/@shared/core, @shared/ui, @shared/game-engine,
app-template 폴더를 만들고 tsconfig, jest, turbo 설정을 잡아줘.
CLAUDE.md의 구조를 참고해."

프롬프트 2: 타입 정의
"@shared/core/src/types/에 game.ts와 ads.ts를 만들어줘.
GameState, GameProps, GameControls, RewardType, 
AdAppConfig, FrequencyConfig 타입을 정의해."

프롬프트 3: 광고 모듈
"@shared/core/src/ads/에 AdFrequencyManager, useRewardedAd,
useInterstitialAd, BannerAdView, adConfig를 구현해줘.
테스트 코드도 함께 작성해. jest로 바로 돌릴 수 있게."

프롬프트 4: 스토어
"@shared/core/src/stores/에 zustand 기반
useScoreStore, useSettingsStore, useAdStore를 만들어줘.
AsyncStorage 영속화 포함. 테스트도."

프롬프트 5: 공통 컴포넌트
"@shared/core/src/components/에 GameWrapper, GameOverModal,
PauseMenu, ScoreDisplay, CrossPromotion을 구현해줘.
GameWrapper는 children render prop 패턴으로."

프롬프트 6: 훅
"@shared/core/src/hooks/에 useHaptics, useSound,
useAppState, useOrientation을 만들어줘."

프롬프트 7: UI 컴포넌트
"@shared/ui/src/에 Button, Card, Modal, IconButton,
ProgressBar, AnimatedNumber를 만들어줘.
react-native-reanimated 기반 애니메이션 포함."

프롬프트 8: 게임 엔진 래퍼
"@shared/game-engine/src/에 GameLoop, PhysicsWorld,
CollisionManager, SkiaRenderer를 만들어줘.
react-native-game-engine과 matter-js 래퍼."

프롬프트 9: 데모 앱
"app-template에 Expo 프로젝트를 만들고
@shared 모듈 전체를 import해서 통합 테스트 앱을 만들어줘.
간단한 터치 게임(화면 터치 → 점수 증가 → 게임오버 → 광고)으로
GameWrapper 전체 플로우를 검증해줘."

프롬프트 10: 전체 테스트
"yarn test:shared를 실행해서 실패하는 테스트를 모두 수정해줘.
커버리지 리포트도 확인하고 80% 이하인 모듈은 테스트를 추가해."
```

---

## 4. Phase 1: 버블 슈터

### 게임 메카닉 상세

```
┌─────────────────────────────────────┐
│  🏆 12,450    ⭐ Best: 28,300      │  ← 점수 / 최고기록
├─────────────────────────────────────┤
│ 🔵🔴🟢🔵🟡🔴🟢🔵 │← Row 0 (천장)  │
│  🔴🟢🔵🟡🔴🟢🔵  │← Row 1 (오프셋) │  벌집 배치
│ 🟢🔵🔴🟢🔵🟡🔴🟢 │← Row 2          │  (홀수 줄 반칸 오프셋)
│  🔵🟡🟢🔴🟢🔵🟡  │← Row 3          │
│ 🔴🟢🔵  🔵🟡🔴🟢 │← Row 4 (빈칸)  │
│  🟡  🔴🟢  🔵🟡  │← Row 5          │
│                                     │
│             빈 공간                  │
│                                     │
│                                     │
│                                     │
│  - - - - - - - - - - - - - - - - -  │ ← 데드라인 (여기 닿으면 게임오버)
│                                     │
│           ╲  ┃  ╱                   │ ← 조준선 (터치 드래그로 각도 조절)
│            ╲ ┃ ╱                    │
│             ╲┃╱                     │
│              🔴                      │ ← 발사할 방울
│         다음: 🟢                     │ ← 다음 방울 미리보기
├─────────────────────────────────────┤
│            [배너 광고]               │
└─────────────────────────────────────┘

조작법:
- 화면 터치 & 드래그 → 조준선 각도 조절
- 손 떼기 → 방울 발사
- 발사된 방울이 천장/다른 방울에 닿으면 붙음
- 같은 색 3개 이상 연결 → 터짐!
- 연결 끊긴 고립 방울 → 낙하 (보너스 점수)
```

### 벌집 격자 (Hex Grid) 로직

```typescript
// packages/app-bubble-shooter/src/game/grid.ts

export const BUBBLE_RADIUS = 18;
export const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
export const COLS = 8;

// 벌집 좌표 계산
export function getGridPosition(row: number, col: number): { x: number; y: number } {
  const isOddRow = row % 2 === 1;
  const xOffset = isOddRow ? BUBBLE_RADIUS : 0;  // 홀수 줄 반칸 오프셋
  
  return {
    x: col * BUBBLE_DIAMETER + BUBBLE_RADIUS + xOffset,
    y: row * (BUBBLE_DIAMETER * 0.866) + BUBBLE_RADIUS,  // 0.866 = √3/2
  };
}

// 가장 가까운 빈 격자 위치 찾기
export function findNearestEmptySlot(
  grid: BubbleGrid,
  x: number,
  y: number,
): GridPosition | null {
  // 충돌 지점 근처의 6개 인접 슬롯 검사
  // 가장 가까운 빈 슬롯 반환
}

// 같은 색 연결 체크 (BFS)
export function findConnectedSameColor(
  grid: BubbleGrid,
  startRow: number,
  startCol: number,
): GridPosition[] {
  const color = grid[startRow][startCol]?.color;
  if (!color) return [];

  const visited = new Set<string>();
  const queue: GridPosition[] = [{ row: startRow, col: startCol }];
  const connected: GridPosition[] = [];

  while (queue.length > 0) {
    const pos = queue.shift()!;
    const key = `${pos.row},${pos.col}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const bubble = grid[pos.row]?.[pos.col];
    if (!bubble || bubble.color !== color) continue;

    connected.push(pos);

    // 6방향 인접 셀 (벌집 기준)
    const neighbors = getHexNeighbors(pos.row, pos.col);
    neighbors.forEach(n => queue.push(n));
  }

  return connected;
}

// 벌집 6방향 인접 셀
export function getHexNeighbors(row: number, col: number): GridPosition[] {
  const isOddRow = row % 2 === 1;

  if (isOddRow) {
    return [
      { row: row - 1, col },      // 왼쪽 위
      { row: row - 1, col: col + 1 }, // 오른쪽 위
      { row, col: col - 1 },      // 왼쪽
      { row, col: col + 1 },      // 오른쪽
      { row: row + 1, col },      // 왼쪽 아래
      { row: row + 1, col: col + 1 }, // 오른쪽 아래
    ];
  } else {
    return [
      { row: row - 1, col: col - 1 }, // 왼쪽 위
      { row: row - 1, col },      // 오른쪽 위
      { row, col: col - 1 },      // 왼쪽
      { row, col: col + 1 },      // 오른쪽
      { row: row + 1, col: col - 1 }, // 왼쪽 아래
      { row: row + 1, col },      // 오른쪽 아래
    ];
  }
}

// 고립된 방울 찾기 (천장에서 연결 안 된 방울)
export function findFloatingBubbles(grid: BubbleGrid): GridPosition[] {
  // BFS: 0번 줄(천장)에서 시작, 연결된 모든 방울 탐색
  // 연결 안 된 방울 = 고립 → 낙하 대상
  const connectedToTop = new Set<string>();
  const queue: GridPosition[] = [];

  // 천장 줄의 모든 방울에서 시작
  for (let col = 0; col < COLS; col++) {
    if (grid[0][col]) {
      queue.push({ row: 0, col });
    }
  }

  // BFS
  while (queue.length > 0) {
    const pos = queue.shift()!;
    const key = `${pos.row},${pos.col}`;
    if (connectedToTop.has(key)) continue;
    if (!grid[pos.row]?.[pos.col]) continue;
    connectedToTop.add(key);
    getHexNeighbors(pos.row, pos.col).forEach(n => queue.push(n));
  }

  // 연결 안 된 것 = 고립
  const floating: GridPosition[] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] && !connectedToTop.has(`${r},${c}`)) {
        floating.push({ row: r, col: c });
      }
    }
  }
  return floating;
}
```

### 조준 & 발사 로직

```typescript
// packages/app-bubble-shooter/src/game/aiming.ts

export interface AimState {
  angle: number;           // 라디안 (0 = 위, -PI/2 = 왼쪽, PI/2 = 오른쪽)
  dotPositions: Point[];   // 조준선 점 위치들
  isAiming: boolean;
}

// 터치 → 각도 계산
export function calculateAngle(
  touchX: number,
  touchY: number,
  launcherX: number,
  launcherY: number,
): number {
  const dx = touchX - launcherX;
  const dy = touchY - launcherY;  // 위로 발사하므로 음수
  let angle = Math.atan2(dx, -dy);

  // 각도 제한 (너무 옆으로 쏘면 안 됨)
  const MAX_ANGLE = Math.PI * 0.42;  // 약 75도
  angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, angle));

  return angle;
}

// 발사 경로 시뮬레이션 (벽 반사 포함)
export function simulateTrajectory(
  startX: number,
  startY: number,
  angle: number,
  screenWidth: number,
): Point[] {
  const speed = 12;
  let vx = Math.sin(angle) * speed;
  let vy = -Math.cos(angle) * speed;

  const points: Point[] = [];
  let x = startX;
  let y = startY;

  for (let i = 0; i < 50; i++) {
    x += vx;
    y += vy;

    // 좌우 벽 반사
    if (x < BUBBLE_RADIUS || x > screenWidth - BUBBLE_RADIUS) {
      vx *= -1;
      x = Math.max(BUBBLE_RADIUS, Math.min(screenWidth - BUBBLE_RADIUS, x));
    }

    points.push({ x, y });

    // 천장 도달
    if (y < BUBBLE_RADIUS) break;
  }

  return points;
}
```

### Skia 렌더링

```typescript
// packages/app-bubble-shooter/src/game/renderers/BubbleRenderer.tsx

import { Circle, Group, RadialGradient, vec } from '@shopify/react-native-skia';

const COLORS: Record<BubbleColor, { main: string; light: string; dark: string }> = {
  red:    { main: '#FF4757', light: '#FF6B7A', dark: '#CC3945' },
  blue:   { main: '#3742FA', light: '#5B63FB', dark: '#2C35C8' },
  green:  { main: '#2ED573', light: '#58DE91', dark: '#25AA5C' },
  yellow: { main: '#FFA502', light: '#FFB733', dark: '#CC8402' },
  purple: { main: '#A55EEA', light: '#B97AEE', dark: '#843EBB' },
  orange: { main: '#FF6348', light: '#FF856D', dark: '#CC4F3A' },
};

export function BubbleRenderer({ x, y, color, radius }: BubbleRenderProps) {
  const c = COLORS[color];

  return (
    <Group>
      {/* 그림자 */}
      <Circle cx={x + 2} cy={y + 3} r={radius} color="rgba(0,0,0,0.2)" />

      {/* 메인 방울 */}
      <Circle cx={x} cy={y} r={radius}>
        <RadialGradient
          c={vec(x - radius * 0.3, y - radius * 0.3)}
          r={radius * 1.2}
          colors={[c.light, c.main, c.dark]}
        />
      </Circle>

      {/* 하이라이트 (빛 반사) */}
      <Circle cx={x - radius * 0.25} cy={y - radius * 0.3} r={radius * 0.22}>
        <RadialGradient
          c={vec(x - radius * 0.25, y - radius * 0.3)}
          r={radius * 0.22}
          colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0)']}
        />
      </Circle>
    </Group>
  );
}
```

### AdMob 연동 포인트

```
[보상형 광고]
→ 게임오버 시 "5발 추가하기 (광고 보기)" 버튼
→ 1회만 사용 가능
→ 5발 추가 + 현재 상태에서 계속 플레이

[전면 광고]
→ 3판마다 (첫 2판은 스킵)
→ 게임오버 → 결과 확인 → 전면 광고 → 재시작

[배너 광고]
→ 게임 화면 하단 (발사대 아래)
→ 게임 플레이 영역은 침범하지 않음
```

---

## 5. Phase 2: 스도쿠

(이전 설계 문서와 동일 — GameWrapper 연동만 변경)

```typescript
// 핵심 변경점: GameWrapper 설정 주입

const SUDOKU_CONFIG: GameWrapperConfig = {
  gameId: 'sudoku',
  gameName: '스도쿠 마스터',
  adUnitIds: {
    interstitial: 'ca-app-pub-XXX/YYY',
    rewarded: 'ca-app-pub-XXX/YYY',
    banner: 'ca-app-pub-XXX/YYY',
  },
  frequencyConfig: {
    interstitialEveryN: 3,
    gracePlayCount: 2,
  },
  rewardType: 'hint',
  rewardLabel: '힌트 받기',
  crossPromoApps: [
    { name: '버블 슈터', icon: '🫧', storeUrl: '...' },
    { name: '똥 피하기', icon: '💩', storeUrl: '...' },
  ],
};
```

---

## 6. Phase 3: 똥 피하기

(이전 설계 문서와 동일 — GameWrapper 연동만 변경)

---

## 7. 디자인 & 에셋 파이프라인

### MCP 구성 (에셋 생성)

```bash
# 메인: 캐릭터, 아이템, 배경
claude mcp add-json "game-asset-gen" '{
  "command": "node",
  "args": ["/path/to/mcp-game-asset-gen/dist/index.js"],
  "env": {
    "GOOGLE_GENERATIVE_AI_API_KEY": "your-gemini-key"
  }
}'

# 보조: HuggingFace LoRA 기반
claude mcp add-json "game-asset-hf" '{
  "command": "node",
  "args": ["/path/to/game-asset-mcp/src/index.js"],
  "env": { "HF_TOKEN": "your-hf-token" }
}'

# UI: Figma → 코드 변환
claude plugin install figma@claude-plugins-official
```

### 게임별 에셋 전략

```
버블 슈터:
├── 방울 → Skia (Circle + RadialGradient) — 코드로 렌더링
├── 배경 → AI 생성 "dark gradient game background, abstract"
├── 발사대 → AI 생성 "cartoon cannon launcher, game asset"
├── 터짐 효과 → Lottie 또는 Skia 파티클
├── UI → Figma 게임 UI 킷 → MCP 변환
└── 사운드 → kenney.nl / freesound.org

스도쿠:
├── 숫자 → 커스텀 폰트 (Pretendard + Press Start 2P)
├── 그리드 → 순수 RN View + border
├── 배경 → 단색 또는 LinearGradient
├── 선택 효과 → Reanimated 애니메이션
├── UI → Figma → MCP 변환
└── 사운드 → kenney.nl

똥 피하기:
├── 플레이어 → AI MCP "cute chibi character, 64x64 sprite sheet"
├── 똥 → AI MCP "cartoon poop with face, 32x32, game item"
├── 아이템 → Kenney Game Icons (CC0)
├── 배경 → AI 생성 "pixel art sky, seamless"
├── 효과 → Skia 파티클 (충돌 시 별)
└── 사운드 → kenney.nl / freesound.org
```

---

## 8. MCP 전체 구성

```bash
# ── 코딩 지원 ──
claude mcp add context7 --transport http https://mcp.context7.com/mcp

# ── 게임 에셋 AI ──
claude mcp add-json "game-asset-gen" '{...}'   # Gemini/OpenAI
claude mcp add-json "game-asset-hf" '{...}'    # HuggingFace

# ── UI 디자인 ──
claude plugin install figma@claude-plugins-official

# ── 기타 ──
claude mcp add filesystem -- npx -y @anthropic/mcp-filesystem .
claude mcp add brave -- npx -y @anthropic/mcp-brave-search
```

### CLAUDE.md (최종)

```markdown
# Mini Game Monorepo

## Architecture
- Monorepo: Yarn Workspaces + Turborepo
- Shared packages: @shared/core, @shared/ui, @shared/game-engine
- Apps: app-bubble-shooter, app-sudoku, app-dodge-poop
- Each app is deployed independently to app stores

## Rules
- @shared/* packages NEVER import from app-* packages
- All shared modules must have 80%+ test coverage
- Game-specific customization via config objects, NOT hardcoding
- TypeScript strict mode everywhere

## Tech Stack
- Expo SDK 53+, TypeScript, expo-router
- react-native-game-engine + matter-js (physics)
- @shopify/react-native-skia (rendering)
- react-native-reanimated (animation)
- react-native-google-mobile-ads (AdMob)
- zustand + AsyncStorage (state)

## Asset Pipeline
- AI MCP: mcp-game-asset-gen (primary), game-asset-hf (secondary)
- Free packs: Kenney.nl (CC0), itch.io (check license)
- UI: Figma MCP → React Native components
- Bubbles: Skia programmatic (NOT images)
- NO EMOJI for game assets

## AdMob Rules
- Banner: bottom of non-game screens only
- Interstitial: after game over, frequency-controlled
- Rewarded: user-initiated only (hint/revive/bonus)
- Grace period: first 2 plays NO ads
- Min interval: 60 seconds between interstitials

## Development Order
1. @shared/core → test → verify
2. @shared/ui → test → verify
3. @shared/game-engine → test → verify
4. app-template (integration test)
5. app-bubble-shooter
6. app-sudoku
7. app-dodge-poop
```

---

## 9. AdMob 수익 전략

### 앱별 AdMob 설정

```
앱 3개 = AdMob 앱 3개 = 광고 단위 각각 독립

app-bubble-shooter:
  ├── Banner: ca-app-pub-XXX/bubble-banner
  ├── Interstitial: ca-app-pub-XXX/bubble-interstitial
  └── Rewarded: ca-app-pub-XXX/bubble-rewarded

app-sudoku:
  ├── Banner: ca-app-pub-XXX/sudoku-banner
  ├── Interstitial: ca-app-pub-XXX/sudoku-interstitial
  └── Rewarded: ca-app-pub-XXX/sudoku-rewarded

app-dodge-poop:
  ├── Banner: ca-app-pub-XXX/dodge-banner
  ├── Interstitial: ca-app-pub-XXX/dodge-interstitial
  └── Rewarded: ca-app-pub-XXX/dodge-rewarded
```

### 예상 수익 (앱 3개 합산)

```
보수적 시나리오 (출시 후 1개월):
  앱당 DAU 500 × 3개 = 1,500 DAU
  월 수익: ~$1,500

목표 시나리오 (출시 후 3개월):
  앱당 DAU 2,000 × 3개 = 6,000 DAU
  월 수익: ~$6,000

낙관적 시나리오 (출시 후 6개월 + ASO 최적화):
  앱당 DAU 5,000 × 3개 = 15,000 DAU
  월 수익: ~$15,000
```

---

## 10. 배포 & 크로스 프로모션

### 크로스 프로모션 전략

```typescript
// @shared/core/src/components/CrossPromotion.tsx

// 게임오버 모달에 다른 게임 추천 카드 표시
// "이 게임도 해보세요!" → 스토어 링크로 이동
// 광고비 0원으로 앱 간 유저 순환

export const CROSS_PROMO_APPS = {
  'bubble-shooter': {
    name: '버블 슈터',
    tagline: '방울을 쏴서 터뜨려요!',
    icon: require('./assets/icon-bubble.png'),
    android: 'https://play.google.com/store/apps/details?id=com.yourname.bubbleshooter',
    ios: 'https://apps.apple.com/app/idXXXXX',
  },
  'sudoku': {
    name: '스도쿠 마스터',
    tagline: '두뇌를 깨우는 숫자 퍼즐',
    icon: require('./assets/icon-sudoku.png'),
    android: '...',
    ios: '...',
  },
  'dodge-poop': {
    name: '똥 피하기',
    tagline: '하늘에서 떨어지는 똥을 피해요!',
    icon: require('./assets/icon-dodge.png'),
    android: '...',
    ios: '...',
  },
};
```

### 배포 명령어

```bash
# 개별 앱 빌드
cd packages/app-bubble-shooter && eas build --profile production --platform all
cd packages/app-sudoku && eas build --profile production --platform all
cd packages/app-dodge-poop && eas build --profile production --platform all

# 또는 스크립트로 한번에
yarn deploy:all  # scripts/deploy-all.sh
```

### 앱 스토어 ASO (검색 최적화)

```
app-bubble-shooter:
  이름: "버블 슈터 - 방울 터뜨리기 퍼즐"
  키워드: 버블슈터, 방울게임, 퍼즐게임, 캐주얼, 무료게임
  카테고리: 퍼즐

app-sudoku:
  이름: "스도쿠 마스터 - 매일 숫자 퍼즐"  
  키워드: 스도쿠, 숫자퍼즐, 두뇌게임, 논리퍼즐
  카테고리: 퍼즐

app-dodge-poop:
  이름: "똥 피하기 - 캐주얼 아케이드"
  키워드: 피하기게임, 캐주얼, 아케이드, 미니게임
  카테고리: 아케이드
```

---

## 전체 타임라인

```
Phase 0: 공통 모듈 (5~7일)
  ├── Day 1-2: 모노레포 셋업 + 타입 + 광고 모듈
  ├── Day 3-4: 컴포넌트 + 스토어 + 훅
  ├── Day 5-6: UI + 게임 엔진 래퍼
  └── Day 7: 데모 앱 통합 테스트 + 수정

Phase 1: 버블 슈터 (7~10일)
  ├── Day 1-2: 벌집 격자 + 발사 로직
  ├── Day 3-4: Skia 렌더링 + 물리
  ├── Day 5-6: 게임플레이 완성 + AdMob 연동
  ├── Day 7-8: 에셋 생성 (AI MCP) + 사운드
  └── Day 9-10: 폴리싱 + 빌드 + 배포

Phase 2: 스도쿠 (5~7일)
  ├── Day 1-2: 퍼즐 생성기 + UI
  ├── Day 3-4: 게임플레이 + AdMob 연동
  └── Day 5-7: 폴리싱 + 배포

Phase 3: 똥 피하기 (5~7일)
  ├── Day 1-2: 물리 + 캐릭터
  ├── Day 3-4: 게임플레이 + AdMob 연동
  └── Day 5-7: 폴리싱 + 배포

총 예상: 22~31일 (약 1개월)
```