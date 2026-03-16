import React, { useEffect, useRef } from 'react';
import { GameWrapper } from '@shared/core/src/components/GameWrapper';
import { setStorageAdapter } from '@shared/core/src/utils/storage';
import { createScoreStore } from '@shared/core/src/stores/useScoreStore';
import type { GameWrapperConfig } from '@shared/core/src/types/game';
import { BubbleShooterGame } from './src/game/BubbleShooterGame';

// 메모리 기반 스토리지 (웹 데모용)
const memoryStorage: Record<string, string> = {};
setStorageAdapter({
  getItem: async (key) => memoryStorage[key] ?? null,
  setItem: async (key, value) => { memoryStorage[key] = value; },
  removeItem: async (key) => { delete memoryStorage[key]; },
});

const BUBBLE_SHOOTER_CONFIG: GameWrapperConfig = {
  gameId: 'bubble-shooter',
  gameName: 'Bubble Shooter',
  adUnitIds: {
    interstitial: 'test',
    rewarded: 'test',
    banner: 'test',
  },
  frequencyConfig: {
    interstitialEveryN: 3,
    gracePlayCount: 2,
    minIntervalMs: 60000,
    maxPerSession: 5,
  },
  rewardType: 'revive',
  rewardLabel: 'Continue Playing!',
};

export default function App() {
  const storeRef = useRef(createScoreStore());

  useEffect(() => {
    storeRef.current.getState().loadScores();
  }, []);

  const handleHighScoreUpdate = async (gameId: string, score: number) => {
    await storeRef.current.getState().updateHighScore(gameId, score);
  };

  return (
    <GameWrapper
      config={BUBBLE_SHOOTER_CONFIG}
      highScore={storeRef.current.getState().getHighScore(BUBBLE_SHOOTER_CONFIG.gameId)}
      onHighScoreUpdate={handleHighScoreUpdate}
    >
      {(controls) => <BubbleShooterGame controls={controls} />}
    </GameWrapper>
  );
}
