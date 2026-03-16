import type { Difficulty } from './types';

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2,
  expert: 3,
};

/**
 * 기본 완료 보너스
 */
export function calculateCompletionScore(difficulty: Difficulty): number {
  return Math.floor(1000 * DIFFICULTY_MULTIPLIER[difficulty]);
}

/**
 * 시간 보너스 (빠를수록 높은 점수)
 */
export function calculateTimeBonus(elapsedSeconds: number, difficulty: Difficulty): number {
  const targets: Record<Difficulty, number> = {
    easy: 300,    // 5분
    medium: 600,  // 10분
    hard: 900,    // 15분
    expert: 1200, // 20분
  };

  const target = targets[difficulty];
  if (elapsedSeconds >= target * 2) return 0;

  const ratio = Math.max(0, 1 - elapsedSeconds / (target * 2));
  return Math.floor(500 * ratio * DIFFICULTY_MULTIPLIER[difficulty]);
}

/**
 * 실수 감점 (-100 per mistake)
 */
export function calculateMistakePenalty(mistakes: number): number {
  return mistakes * 100;
}

/**
 * 힌트 감점 (-50 per hint)
 */
export function calculateHintPenalty(hintsUsed: number): number {
  return hintsUsed * 50;
}

/**
 * 최종 점수 계산
 */
export function calculateTotalScore(
  difficulty: Difficulty,
  elapsedSeconds: number,
  mistakes: number,
  hintsUsed: number,
): number {
  const base = calculateCompletionScore(difficulty);
  const timeBonus = calculateTimeBonus(elapsedSeconds, difficulty);
  const mistakePenalty = calculateMistakePenalty(mistakes);
  const hintPenalty = calculateHintPenalty(hintsUsed);

  return Math.max(0, base + timeBonus - mistakePenalty - hintPenalty);
}
