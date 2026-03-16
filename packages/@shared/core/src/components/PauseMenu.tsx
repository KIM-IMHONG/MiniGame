import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/fonts';
import { spacing, borderRadius } from '../theme/spacing';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
}

export function PauseMenu({ onResume, onRestart }: PauseMenuProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>PAUSED</Text>

        <TouchableOpacity
          style={styles.resumeButton}
          onPress={onResume}
          testID="resume-button"
        >
          <Text style={styles.resumeText}>RESUME</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restartButton}
          onPress={onRestart}
          testID="restart-button"
        >
          <Text style={styles.restartText}>RESTART</Text>
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
    minWidth: 250,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.extrabold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
    letterSpacing: 4,
  },
  resumeButton: {
    backgroundColor: colors.button.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resumeText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  restartButton: {
    backgroundColor: colors.button.secondary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    width: '100%',
    alignItems: 'center',
  },
  restartText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text.secondary,
  },
});
