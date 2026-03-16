/**
 * 점수 계산 시스템
 */

// 기본 터뜨리기: 3개면 30점, 이후 개당 +20점
export function calculatePopScore(bubbleCount: number): number {
  if (bubbleCount < 3) return 0;
  const base = 30;
  const extra = (bubbleCount - 3) * 20;
  return base + extra;
}

// 낙하 보너스: 고립 방울 개수 × 50점
export function calculateDropScore(droppedCount: number): number {
  return droppedCount * 50;
}

// 콤보 보너스: 연속 터뜨리기
export function calculateComboMultiplier(comboCount: number): number {
  if (comboCount <= 1) return 1;
  if (comboCount === 2) return 1.5;
  if (comboCount === 3) return 2;
  return 2 + (comboCount - 3) * 0.5;
}

// 총 점수 계산
export function calculateTotalScore(
  poppedCount: number,
  droppedCount: number,
  comboCount: number,
): number {
  const popScore = calculatePopScore(poppedCount);
  const dropScore = calculateDropScore(droppedCount);
  const multiplier = calculateComboMultiplier(comboCount);
  return Math.floor((popScore + dropScore) * multiplier);
}
