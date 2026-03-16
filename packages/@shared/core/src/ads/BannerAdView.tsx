import React from 'react';
import { View, StyleSheet } from 'react-native';

interface BannerAdViewProps {
  adUnitId: string;
  testMode?: boolean;
  size?: 'banner' | 'largeBanner' | 'mediumRectangle';
}

let BannerAdComponent: any = null;
let adConstants: any = null;

export function setBannerAdModule(component: any, constants: any): void {
  BannerAdComponent = component;
  adConstants = constants;
}

export function BannerAdView({
  adUnitId,
  testMode,
  size = 'banner',
}: BannerAdViewProps) {
  if (!BannerAdComponent || !adConstants) {
    return <View style={styles.placeholder} />;
  }

  const unitId = testMode ? adConstants.TestIds.BANNER : adUnitId;

  const sizeMap: Record<string, any> = {
    banner: adConstants.BannerAdSize.BANNER,
    largeBanner: adConstants.BannerAdSize.LARGE_BANNER,
    mediumRectangle: adConstants.BannerAdSize.MEDIUM_RECTANGLE,
  };

  return (
    <View style={styles.container}>
      <BannerAdComponent
        unitId={unitId}
        size={sizeMap[size]}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    height: 50,
    backgroundColor: 'transparent',
  },
});
