import { calculatePopScore, calculateDropScore, calculateComboMultiplier, calculateTotalScore } from '../scoring';

describe('scoring', () => {
  describe('calculatePopScore', () => {
    it('3개 미만은 0점', () => {
      expect(calculatePopScore(0)).toBe(0);
      expect(calculatePopScore(2)).toBe(0);
    });

    it('3개는 30점', () => {
      expect(calculatePopScore(3)).toBe(30);
    });

    it('4개는 50점 (30 + 20)', () => {
      expect(calculatePopScore(4)).toBe(50);
    });

    it('6개는 90점 (30 + 60)', () => {
      expect(calculatePopScore(6)).toBe(90);
    });
  });

  describe('calculateDropScore', () => {
    it('낙하 방울당 50점', () => {
      expect(calculateDropScore(0)).toBe(0);
      expect(calculateDropScore(3)).toBe(150);
      expect(calculateDropScore(5)).toBe(250);
    });
  });

  describe('calculateComboMultiplier', () => {
    it('1콤보는 1배', () => {
      expect(calculateComboMultiplier(1)).toBe(1);
    });

    it('2콤보는 1.5배', () => {
      expect(calculateComboMultiplier(2)).toBe(1.5);
    });

    it('3콤보는 2배', () => {
      expect(calculateComboMultiplier(3)).toBe(2);
    });

    it('4콤보 이상은 점증', () => {
      expect(calculateComboMultiplier(4)).toBe(2.5);
    });
  });

  describe('calculateTotalScore', () => {
    it('3개 터뜨리기 + 낙하 없음 + 1콤보', () => {
      expect(calculateTotalScore(3, 0, 1)).toBe(30);
    });

    it('5개 터뜨리기 + 2개 낙하 + 2콤보', () => {
      // pop: 30 + 40 = 70, drop: 100, total: 170 * 1.5 = 255
      expect(calculateTotalScore(5, 2, 2)).toBe(255);
    });
  });
});
