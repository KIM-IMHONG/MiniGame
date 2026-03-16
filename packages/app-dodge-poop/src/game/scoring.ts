/**
 * 생존 시간 기반 점수 (초당 10점)
 */
export function calculateSurvivalScore(elapsedSeconds: number): number {
  return Math.floor(elapsedSeconds * 10);
}

/**
 * 별 수집 보너스
 */
export function calculateStarBonus(starsCollected: number): number {
  return starsCollected * 50;
}

/**
 * 콤보 보너스 (연속 별 수집)
 */
export function calculateComboBonus(combo: number): number {
  if (combo < 2) return 0;
  return Math.floor(combo * combo * 10);
}

/**
 * 최종 점수 계산
 */
export function calculateTotalScore(
  elapsedSeconds: number,
  starsCollected: number,
  maxCombo: number,
): number {
  return (
    calculateSurvivalScore(elapsedSeconds) +
    calculateStarBonus(starsCollected) +
    calculateComboBonus(maxCombo)
  );
}
