import React, { useEffect, useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { GameWrapper } from '@shared/core/src/components/GameWrapper';
import { setStorageAdapter } from '@shared/core/src/utils/storage';
import { createScoreStore } from '@shared/core/src/stores/useScoreStore';
import { colors } from '@shared/core/src/theme/colors';
import { fontSizes, fontWeights } from '@shared/core/src/theme/fonts';
import type { GameControls, GameWrapperConfig } from '@shared/core/src/types/game';

// 메모리 기반 스토리지 (데모용)
const memoryStorage: Record<string, string> = {};
setStorageAdapter({
  getItem: async (key) => memoryStorage[key] ?? null,
  setItem: async (key, value) => { memoryStorage[key] = value; },
  removeItem: async (key) => { delete memoryStorage[key]; },
});

const DEMO_CONFIG: GameWrapperConfig = {
  gameId: 'demo-tap',
  gameName: 'Tap Demo',
  adUnitIds: {
    interstitial: 'test',
    rewarded: 'test',
    banner: 'test',
  },
  frequencyConfig: {
    interstitialEveryN: 3,
    gracePlayCount: 1,
    minIntervalMs: 0,
    maxPerSession: 5,
  },
  rewardType: 'bonus',
  rewardLabel: 'Get Bonus Points!',
};

const GAME_OVER_SCORE = 10;

function TapGame({ controls }: { controls: GameControls }) {
  const scoreRef = useRef(0);

  const handleTap = () => {
    if (controls.isPaused) return;
    scoreRef.current += 1;
    controls.reportScore(scoreRef.current);

    if (scoreRef.current >= GAME_OVER_SCORE) {
      controls.reportGameOver(scoreRef.current);
      scoreRef.current = 0;
    }
  };

  return (
    <TouchableOpacity
      style={styles.tapArea}
      onPress={handleTap}
      activeOpacity={0.7}
      testID="tap-area"
    >
      <Text style={styles.tapText}>TAP HERE!</Text>
      <Text style={styles.tapSub}>
        Tap {GAME_OVER_SCORE} times to trigger Game Over
      </Text>
    </TouchableOpacity>
  );
}

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
      config={DEMO_CONFIG}
      highScore={storeRef.current.getState().getHighScore(DEMO_CONFIG.gameId)}
      onHighScoreUpdate={handleHighScoreUpdate}
    >
      {(controls) => <TapGame controls={controls} />}
    </GameWrapper>
  );
}

const styles = StyleSheet.create({
  tapArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  tapText: {
    fontSize: fontSizes.hero,
    fontWeight: fontWeights.extrabold,
    color: colors.ui.primary,
  },
  tapSub: {
    fontSize: fontSizes.md,
    color: colors.text.muted,
    marginTop: 12,
  },
});
