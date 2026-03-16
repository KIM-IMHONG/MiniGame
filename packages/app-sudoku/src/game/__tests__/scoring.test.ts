import {
  calculateCompletionScore,
  calculateTimeBonus,
  calculateMistakePenalty,
  calculateHintPenalty,
  calculateTotalScore,
} from '../scoring';

describe('calculateCompletionScore', () => {
  it('should return 1000 for easy', () => {
    expect(calculateCompletionScore('easy')).toBe(1000);
  });

  it('should return higher for harder difficulties', () => {
    expect(calculateCompletionScore('medium')).toBe(1500);
    expect(calculateCompletionScore('hard')).toBe(2000);
    expect(calculateCompletionScore('expert')).toBe(3000);
  });
});

describe('calculateTimeBonus', () => {
  it('should return max bonus for instant completion', () => {
    expect(calculateTimeBonus(0, 'easy')).toBe(500);
  });

  it('should return 0 for very slow completion', () => {
    expect(calculateTimeBonus(999999, 'easy')).toBe(0);
  });

  it('should return partial bonus for moderate time', () => {
    const bonus = calculateTimeBonus(300, 'easy');
    expect(bonus).toBeGreaterThan(0);
    expect(bonus).toBeLessThan(500);
  });
});

describe('calculateMistakePenalty', () => {
  it('should return 0 for no mistakes', () => {
    expect(calculateMistakePenalty(0)).toBe(0);
  });

  it('should return 100 per mistake', () => {
    expect(calculateMistakePenalty(3)).toBe(300);
  });
});

describe('calculateHintPenalty', () => {
  it('should return 0 for no hints', () => {
    expect(calculateHintPenalty(0)).toBe(0);
  });

  it('should return 50 per hint', () => {
    expect(calculateHintPenalty(5)).toBe(250);
  });
});

describe('calculateTotalScore', () => {
  it('should return positive score for clean completion', () => {
    const score = calculateTotalScore('easy', 120, 0, 0);
    expect(score).toBeGreaterThan(1000);
  });

  it('should subtract penalties', () => {
    const clean = calculateTotalScore('easy', 120, 0, 0);
    const withMistakes = calculateTotalScore('easy', 120, 2, 0);
    expect(withMistakes).toBe(clean - 200);
  });

  it('should never return negative', () => {
    const score = calculateTotalScore('easy', 999999, 3, 20);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});
