import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { AdFrequencyManager } from '../ads/AdFrequencyManager';
import { GameOverModal } from './GameOverModal';
import { PauseMenu } from './PauseMenu';
import { ScoreDisplay } from './ScoreDisplay';
import type { GameState, GameControls, GameWrapperConfig } from '../types/game';
import type { FrequencyConfig } from '../types/ads';
import { colors } from '../theme/colors';

interface Props {
  config: GameWrapperConfig;
  children: (controls: GameControls) => React.ReactNode;
  highScore?: number;
  onHighScoreUpdate?: (gameId: string, score: number) => void;
  onShowInterstitial?: () => Promise<boolean>;
  onShowRewarded?: () => Promise<boolean>;
  rewardReady?: boolean;
  isEarned?: boolean;
}

export function GameWrapper({
  config,
  children,
  highScore = 0,
  onHighScoreUpdate,
  onShowInterstitial,
  onShowRewarded,
  rewardReady = false,
  isEarned = false,
}: Props) {
  const [gameState, setGameState] = useState<GameState>('playing');
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentHighScore, setCurrentHighScore] = useState(highScore);

  const frequencyManager = useRef(
    new AdFrequencyManager(config.frequencyConfig),
  ).current;

  const handleGameOver = useCallback(
    async (finalScore: number) => {
      setScore(finalScore);
      setGameState('gameover');

      if (finalScore > currentHighScore) {
        setCurrentHighScore(finalScore);
        onHighScoreUpdate?.(config.gameId, finalScore);
      }

      frequencyManager.recordPlay();

      if (frequencyManager.shouldShowInterstitial()) {
        const shown = await onShowInterstitial?.();
        if (shown) frequencyManager.recordShow();
      }
    },
    [config.gameId, frequencyManager, onShowInterstitial, onHighScoreUpdate, currentHighScore],
  );

  const handleReward = useCallback(async (): Promise<boolean> => {
    if (!onShowRewarded) return false;
    return onShowRewarded();
  }, [onShowRewarded]);

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
    <View style={styles.container}>
      <StatusBar hidden />

      <ScoreDisplay
        score={score}
        highScore={currentHighScore}
        onPause={() => setIsPaused(true)}
      />

      <View style={styles.gameArea}>{children(controls)}</View>

      {isPaused && (
        <PauseMenu
          onResume={() => setIsPaused(false)}
          onRestart={handleRestart}
        />
      )}

      {gameState === 'gameover' && (
        <GameOverModal
          score={score}
          highScore={currentHighScore}
          rewardType={config.rewardType}
          rewardLabel={config.rewardLabel}
          rewardReady={rewardReady}
          onReward={handleReward}
          isEarned={isEarned}
          onRestart={handleRestart}
          crossPromoApps={config.crossPromoApps}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  gameArea: { flex: 1 },
});
