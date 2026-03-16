import { isValid, getCandidates, solve, countSolutions, cloneGrid, isComplete, isBoardValid } from '../solver';
import type { Grid, CellValue } from '../types';

function emptyGrid(): Grid {
  return Array.from({ length: 9 }, () => Array(9).fill(0) as CellValue[]);
}

// 유효한 완성 그리드
const VALID_GRID: Grid = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
] as Grid;

describe('isValid', () => {
  it('should return true for valid placement', () => {
    const grid = emptyGrid();
    expect(isValid(grid, 0, 0, 1)).toBe(true);
  });

  it('should return false for row conflict', () => {
    const grid = emptyGrid();
    grid[0][0] = 1;
    expect(isValid(grid, 0, 5, 1)).toBe(false);
  });

  it('should return false for column conflict', () => {
    const grid = emptyGrid();
    grid[0][0] = 1;
    expect(isValid(grid, 5, 0, 1)).toBe(false);
  });

  it('should return false for box conflict', () => {
    const grid = emptyGrid();
    grid[0][0] = 1;
    expect(isValid(grid, 1, 1, 1)).toBe(false);
  });
});

describe('getCandidates', () => {
  it('should return all numbers for empty grid cell', () => {
    const grid = emptyGrid();
    expect(getCandidates(grid, 0, 0)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should exclude row/col/box numbers', () => {
    const grid = emptyGrid();
    grid[0][1] = 1;
    grid[1][0] = 2;
    grid[1][1] = 3;
    const candidates = getCandidates(grid, 0, 0);
    expect(candidates).not.toContain(1);
    expect(candidates).not.toContain(2);
    expect(candidates).not.toContain(3);
  });

  it('should return empty for filled cell', () => {
    const grid = emptyGrid();
    grid[0][0] = 5;
    expect(getCandidates(grid, 0, 0)).toEqual([]);
  });
});

describe('solve', () => {
  it('should solve an empty grid', () => {
    const grid = emptyGrid();
    expect(solve(grid)).toBe(true);
    expect(isComplete(grid)).toBe(true);
  });

  it('should solve a partial grid', () => {
    const grid = cloneGrid(VALID_GRID);
    // Remove some values
    grid[0][0] = 0;
    grid[4][4] = 0;
    grid[8][8] = 0;
    expect(solve(grid)).toBe(true);
    expect(grid[0][0]).toBe(5);
    expect(grid[4][4]).toBe(5);
    expect(grid[8][8]).toBe(9);
  });
});

describe('countSolutions', () => {
  it('should return 1 for grid with one empty cell', () => {
    const grid = cloneGrid(VALID_GRID);
    grid[0][0] = 0;
    expect(countSolutions(grid)).toBe(1);
  });

  it('should return multiple for grid with many empty cells', () => {
    const grid = emptyGrid();
    // Leave mostly empty - should have many solutions
    grid[0][0] = 1;
    expect(countSolutions(grid, 2)).toBe(2);
  });
});

describe('isComplete', () => {
  it('should return true for valid complete grid', () => {
    expect(isComplete(VALID_GRID)).toBe(true);
  });

  it('should return false for grid with empty cells', () => {
    const grid = cloneGrid(VALID_GRID);
    grid[0][0] = 0;
    expect(isComplete(grid)).toBe(false);
  });
});

describe('isBoardValid', () => {
  it('should return true for valid grid', () => {
    expect(isBoardValid(VALID_GRID)).toBe(true);
  });

  it('should return false for invalid grid (row duplicate)', () => {
    const grid = cloneGrid(VALID_GRID);
    grid[0][1] = grid[0][0]; // Duplicate in row
    expect(isBoardValid(grid)).toBe(false);
  });

  it('should return true for partial valid grid', () => {
    const grid = emptyGrid();
    grid[0][0] = 1;
    grid[0][1] = 2;
    expect(isBoardValid(grid)).toBe(true);
  });
});
