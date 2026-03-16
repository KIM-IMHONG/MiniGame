import {
  calculateSurvivalScore,
  calculateStarBonus,
  calculateComboBonus,
  calculateTotalScore,
} from '../scoring';

describe('calculateSurvivalScore', () => {
  it('should return 0 for 0 seconds', () => {
    expect(calculateSurvivalScore(0)).toBe(0);
  });

  it('should return 10 per second', () => {
    expect(calculateSurvivalScore(10)).toBe(100);
    expect(calculateSurvivalScore(30)).toBe(300);
  });
});

describe('calculateStarBonus', () => {
  it('should return 0 for no stars', () => {
    expect(calculateStarBonus(0)).toBe(0);
  });

  it('should return 50 per star', () => {
    expect(calculateStarBonus(5)).toBe(250);
  });
});

describe('calculateComboBonus', () => {
  it('should return 0 for combo < 2', () => {
    expect(calculateComboBonus(0)).toBe(0);
    expect(calculateComboBonus(1)).toBe(0);
  });

  it('should return quadratic bonus for higher combos', () => {
    expect(calculateComboBonus(2)).toBe(40);
    expect(calculateComboBonus(5)).toBe(250);
  });
});

describe('calculateTotalScore', () => {
  it('should combine all components', () => {
    const total = calculateTotalScore(10, 3, 3);
    expect(total).toBe(100 + 150 + 90); // survival + stars + combo
  });

  it('should return only survival for no stars or combo', () => {
    expect(calculateTotalScore(20, 0, 0)).toBe(200);
  });
});
