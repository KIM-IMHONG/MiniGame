import type { Grid, CellValue } from './types';

/**
 * 특정 위치에 숫자를 놓을 수 있는지 확인
 */
export function isValid(grid: Grid, row: number, col: number, num: number): boolean {
  // 행 검사
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }

  // 열 검사
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }

  // 3×3 박스 검사
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }

  return true;
}

/**
 * 빈 칸의 후보 숫자 집합 반환
 */
export function getCandidates(grid: Grid, row: number, col: number): number[] {
  if (grid[row][col] !== 0) return [];
  const candidates: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (isValid(grid, row, col, num)) {
      candidates.push(num);
    }
  }
  return candidates;
}

/**
 * 다음 빈 칸 찾기 (MRV 휴리스틱: 후보가 가장 적은 셀 우선)
 */
function findNextEmpty(grid: Grid): { row: number; col: number } | null {
  let bestPos: { row: number; col: number } | null = null;
  let minCandidates = 10;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        const count = getCandidates(grid, r, c).length;
        if (count < minCandidates) {
          minCandidates = count;
          bestPos = { row: r, col: c };
          if (count === 1) return bestPos; // 최적
        }
      }
    }
  }

  return bestPos;
}

/**
 * 백트래킹 솔버
 * @returns 풀이 가능하면 true (grid가 수정됨)
 */
export function solve(grid: Grid): boolean {
  const pos = findNextEmpty(grid);
  if (!pos) return true; // 모든 칸 채워짐

  const { row, col } = pos;
  const candidates = getCandidates(grid, row, col);

  for (const num of candidates) {
    grid[row][col] = num as CellValue;
    if (solve(grid)) return true;
    grid[row][col] = 0;
  }

  return false;
}

/**
 * 해가 유일한지 확인 (최대 2개까지만 찾음)
 */
export function countSolutions(grid: Grid, limit: number = 2): number {
  const pos = findNextEmpty(grid);
  if (!pos) return 1;

  const { row, col } = pos;
  const candidates = getCandidates(grid, row, col);
  let count = 0;

  for (const num of candidates) {
    grid[row][col] = num as CellValue;
    count += countSolutions(grid, limit - count);
    grid[row][col] = 0;
    if (count >= limit) return count;
  }

  return count;
}

/**
 * 그리드 복사
 */
export function cloneGrid(grid: Grid): Grid {
  return grid.map(row => [...row]);
}

/**
 * 그리드가 완전히 채워져 있고 유효한지 확인
 */
export function isComplete(grid: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) return false;
    }
  }
  return isBoardValid(grid);
}

/**
 * 현재 보드가 규칙을 위반하지 않는지 확인
 */
export function isBoardValid(grid: Grid): boolean {
  // 행 검사
  for (let r = 0; r < 9; r++) {
    const seen = new Set<number>();
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      if (v === 0) continue;
      if (seen.has(v)) return false;
      seen.add(v);
    }
  }

  // 열 검사
  for (let c = 0; c < 9; c++) {
    const seen = new Set<number>();
    for (let r = 0; r < 9; r++) {
      const v = grid[r][c];
      if (v === 0) continue;
      if (seen.has(v)) return false;
      seen.add(v);
    }
  }

  // 3×3 박스 검사
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const seen = new Set<number>();
      for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) {
          const v = grid[r][c];
          if (v === 0) continue;
          if (seen.has(v)) return false;
          seen.add(v);
        }
      }
    }
  }

  return true;
}
