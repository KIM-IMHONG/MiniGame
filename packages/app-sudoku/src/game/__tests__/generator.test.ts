import { generateFullGrid, generatePuzzle, countEmpty } from '../generator';
import { isComplete, isBoardValid, countSolutions, cloneGrid } from '../solver';
import type { Difficulty } from '../types';
import { DIFFICULTY_CLUES } from '../types';

describe('generateFullGrid', () => {
  it('should generate a complete valid grid', () => {
    const grid = generateFullGrid();
    expect(isComplete(grid)).toBe(true);
  });

  it('should generate different grids', () => {
    const g1 = generateFullGrid();
    const g2 = generateFullGrid();
    // Very unlikely to be identical
    const same = g1.every((row, r) => row.every((v, c) => v === g2[r][c]));
    expect(same).toBe(false);
  });
});

describe('generatePuzzle', () => {
  const difficulties: Difficulty[] = ['easy', 'medium'];

  difficulties.forEach((diff) => {
    it(`should generate a valid ${diff} puzzle with unique solution`, () => {
      const { puzzle, solution } = generatePuzzle(diff);

      // Solution should be complete and valid
      expect(isComplete(solution)).toBe(true);

      // Puzzle should have correct number of clues
      const empty = countEmpty(puzzle);
      const clues = 81 - empty;
      const { min, max } = DIFFICULTY_CLUES[diff];
      expect(clues).toBeGreaterThanOrEqual(min);
      expect(clues).toBeLessThanOrEqual(max);

      // Puzzle should have unique solution
      const test = cloneGrid(puzzle);
      expect(countSolutions(test, 2)).toBe(1);
    });
  });

  it('should generate puzzle where empty cells match solution', () => {
    const { puzzle, solution } = generatePuzzle('easy');

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle[r][c] !== 0) {
          expect(puzzle[r][c]).toBe(solution[r][c]);
        }
      }
    }
  });
});

describe('countEmpty', () => {
  it('should count empty cells correctly', () => {
    const { puzzle } = generatePuzzle('easy');
    const empty = countEmpty(puzzle);
    expect(empty).toBeGreaterThan(0);
    expect(empty).toBeLessThan(81);
  });
});
