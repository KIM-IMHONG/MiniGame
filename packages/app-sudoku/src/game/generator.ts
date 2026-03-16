import type { Grid, CellValue, Difficulty } from './types';
import { DIFFICULTY_CLUES } from './types';
import { solve, cloneGrid, countSolutions } from './solver';

/**
 * Fisher-Yates 셔플
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 빈 그리드에서 랜덤 완성된 스도쿠 생성
 */
export function generateFullGrid(): Grid {
  const grid: Grid = Array.from({ length: 9 }, () =>
    Array(9).fill(0) as CellValue[]
  );

  fillGrid(grid);
  return grid;
}

function fillGrid(grid: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) continue;

      const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      for (const num of nums) {
        if (isValidPlacement(grid, r, c, num)) {
          grid[r][c] = num as CellValue;
          if (fillGrid(grid)) return true;
          grid[r][c] = 0;
        }
      }
      return false;
    }
  }
  return true;
}

function isValidPlacement(grid: Grid, row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

/**
 * 완성된 그리드에서 셀을 제거하여 퍼즐 생성
 * 유일해 보장
 */
export function generatePuzzle(difficulty: Difficulty): { puzzle: Grid; solution: Grid } {
  const solution = generateFullGrid();
  const puzzle = cloneGrid(solution);

  const { min, max } = DIFFICULTY_CLUES[difficulty];
  const targetClues = min + Math.floor(Math.random() * (max - min + 1));
  const targetRemove = 81 - targetClues;

  // 랜덤 순서로 셀 제거 시도
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => ({
      row: Math.floor(i / 9),
      col: i % 9,
    }))
  );

  let removed = 0;
  for (const { row, col } of positions) {
    if (removed >= targetRemove) break;

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    // 유일해 확인
    const test = cloneGrid(puzzle);
    if (countSolutions(test, 2) === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup; // 복원
    }
  }

  return { puzzle, solution };
}

/**
 * 퍼즐의 빈 칸 수 계산
 */
export function countEmpty(grid: Grid): number {
  let count = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) count++;
    }
  }
  return count;
}
