/**
 * 화면 크기 유틸리티
 * React Native의 Dimensions를 래핑하여 일관된 API 제공
 */

export interface ScreenDimensions {
  width: number;
  height: number;
}

export interface GameArea {
  width: number;
  height: number;
  offsetTop: number;
  offsetBottom: number;
}

/**
 * 게임 영역 계산 (배너 광고, 상태바 등 제외)
 */
export function calculateGameArea(
  screen: ScreenDimensions,
  options: {
    topInset?: number;
    bottomInset?: number;
    bannerHeight?: number;
    scoreBarHeight?: number;
  } = {},
): GameArea {
  const {
    topInset = 0,
    bottomInset = 0,
    bannerHeight = 50,
    scoreBarHeight = 60,
  } = options;

  const offsetTop = topInset + scoreBarHeight;
  const offsetBottom = bottomInset + bannerHeight;

  return {
    width: screen.width,
    height: screen.height - offsetTop - offsetBottom,
    offsetTop,
    offsetBottom,
  };
}

/**
 * 비율 기반 크기 계산 (다양한 화면 대응)
 */
export function scaleSize(
  baseSize: number,
  screenWidth: number,
  designWidth: number = 375,
): number {
  return (baseSize * screenWidth) / designWidth;
}
