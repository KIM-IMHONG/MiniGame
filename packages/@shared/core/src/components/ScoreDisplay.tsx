import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/fonts';
import { spacing } from '../theme/spacing';

interface ScoreDisplayProps {
  score: number;
  highScore: number;
  onPause: () => void;
}

export function ScoreDisplay({ score, highScore, onPause }: ScoreDisplayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.scoreSection}>
        <Text style={styles.label}>SCORE</Text>
        <Text style={styles.score}>{score.toLocaleString()}</Text>
      </View>
      <TouchableOpacity
        style={styles.pauseButton}
        onPress={onPause}
        accessibilityLabel="Pause"
        testID="pause-button"
      >
        <Text style={styles.pauseIcon}>||</Text>
      </TouchableOpacity>
      <View style={styles.scoreSection}>
        <Text style={styles.label}>BEST</Text>
        <Text style={styles.highScore}>{highScore.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
  },
  scoreSection: {
    alignItems: 'center',
    minWidth: 80,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  score: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  highScore: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text.accent,
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIcon: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
    letterSpacing: -2,
  },
});
