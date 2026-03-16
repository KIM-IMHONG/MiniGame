import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/fonts';
import { spacing, borderRadius } from '../theme/spacing';
import type { CrossPromoApp } from '../types/game';

interface CrossPromotionProps {
  apps: CrossPromoApp[];
  currentGameId?: string;
}

export function CrossPromotion({ apps }: CrossPromotionProps) {
  const handlePress = (app: CrossPromoApp) => {
    const url = Platform.OS === 'ios' ? app.iosUrl : app.androidUrl;
    if (url) {
      Linking.openURL(url).catch(() => {});
    }
  };

  if (apps.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Try our other games!</Text>
      <View style={styles.appsRow}>
        {apps.map((app, index) => (
          <TouchableOpacity
            key={index}
            style={styles.appCard}
            onPress={() => handlePress(app)}
            testID={`cross-promo-${index}`}
          >
            <Text style={styles.appName}>{app.name}</Text>
            <Text style={styles.appTagline}>{app.tagline}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    width: '100%',
  },
  title: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  appsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  appCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    minWidth: 100,
  },
  appName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  appTagline: {
    fontSize: fontSizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
});
