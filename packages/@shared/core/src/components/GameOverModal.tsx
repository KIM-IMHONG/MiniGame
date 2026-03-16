import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/fonts';
import { spacing, borderRadius } from '../theme/spacing';
import type { RewardType, CrossPromoApp } from '../types/game';

interface GameOverModalProps {
  score: number;
  highScore: number;
  rewardType?: RewardType;
  rewardLabel?: string;
  rewardReady?: boolean;
  onReward?: () => Promise<boolean>;
  isEarned?: boolean;
  onRestart: () => void;
  crossPromoApps?: CrossPromoApp[];
}

export function GameOverModal({
  score,
  highScore,
  rewardType,
  rewardLabel = 'Watch Ad',
  rewardReady = false,
  onReward,
  isEarned = false,
  onRestart,
  crossPromoApps,
}: GameOverModalProps) {
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>GAME OVER</Text>

        {isNewHighScore && (
          <Text style={styles.newHighScore}>NEW BEST!</Text>
        )}

        <View style={styles.scoreRow}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>BEST</Text>
            <Text style={styles.bestValue}>{highScore.toLocaleString()}</Text>
          </View>
        </View>

        {rewardType && !isEarned && rewardReady && onReward && (
          <TouchableOpacity
            style={styles.rewardButton}
            onPress={onReward}
            testID="reward-button"
          >
            <Text style={styles.rewardText}>{rewardLabel}</Text>
          </TouchableOpacity>
        )}

        {isEarned && (
          <Text style={styles.earnedText}>Reward earned!</Text>
        )}

        <TouchableOpacity
          style={styles.restartButton}
          onPress={onRestart}
          testID="gameover-restart-button"
        >
          <Text style={styles.restartText}>PLAY AGAIN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    minWidth: 280,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.extrabold,
    color: colors.text.primary,
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
  newHighScore: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text.accent,
    marginBottom: spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.xl,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  scoreValue: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  bestValue: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.text.accent,
  },
  rewardButton: {
    backgroundColor: colors.button.reward,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rewardText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.background.primary,
  },
  earnedText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ui.success,
    marginBottom: spacing.md,
  },
  restartButton: {
    backgroundColor: colors.button.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    width: '100%',
    alignItems: 'center',
  },
  restartText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
});
