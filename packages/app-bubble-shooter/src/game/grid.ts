import type { BubbleGrid, GridPosition, Bubble, BubbleColor, GameConfig } from './types';
import { BUBBLE_COLORS, DEFAULT_CONFIG } from './types';

const SQRT3_HALF = Math.sqrt(3) / 2; // ≈ 0.866

/**
 * 벌집 격자에서 실제 화면 좌표 계산
 */
export function getGridPosition(
  row: number,
  col: number,
  config: GameConfig = DEFAULT_CONFIG,
): { x: number; y: number } {
  const d = config.bubbleRadius * 2;
  const isOddRow = row % 2 === 1;
  const xOffset = isOddRow ? config.bubbleRadius : 0;

  return {
    x: col * d + config.bubbleRadius + xOffset,
    y: row * (d * SQRT3_HALF) + config.bubbleRadius,
  };
}

/**
 * 화면 좌표에서 가장 가까운 격자 위치 찾기
 */
export function screenToGrid(
  x: number,
  y: number,
  config: GameConfig = DEFAULT_CONFIG,
): GridPosition {
  const d = config.bubbleRadius * 2;
  const rowHeight = d * SQRT3_HALF;

  const row = Math.round((y - config.bubbleRadius) / rowHeight);
  const isOddRow = row % 2 === 1;
  const xOffset = isOddRow ? config.bubbleRadius : 0;
  const col = Math.round((x - config.bubbleRadius - xOffset) / d);

  return {
    row: Math.max(0, row),
    col: Math.max(0, Math.min(col, getMaxCol(row, config))),
  };
}

/**
 * 해당 행의 최대 열 인덱스
 */
export function getMaxCol(row: number, config: GameConfig = DEFAULT_CONFIG): number {
  return row % 2 === 1 ? config.cols - 2 : config.cols - 1;
}

/**
 * 벌집 6방향 인접 셀
 */
export function getHexNeighbors(row: number, col: number): GridPosition[] {
  const isOddRow = row % 2 === 1;

  if (isOddRow) {
    return [
      { row: row - 1, col },
      { row: row - 1, col: col + 1 },
      { row, col: col - 1 },
      { row, col: col + 1 },
      { row: row + 1, col },
      { row: row + 1, col: col + 1 },
    ];
  } else {
    return [
      { row: row - 1, col: col - 1 },
      { row: row - 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
      { row: row + 1, col: col - 1 },
      { row: row + 1, col },
    ];
  }
}

/**
 * 같은 색 연결 체크 (BFS)
 */
export function findConnectedSameColor(
  grid: BubbleGrid,
  startRow: number,
  startCol: number,
): GridPosition[] {
  const bubble = grid[startRow]?.[startCol];
  if (!bubble) return [];

  const color = bubble.color;
  const visited = new Set<string>();
  const queue: GridPosition[] = [{ row: startRow, col: startCol }];
  const connected: GridPosition[] = [];

  while (queue.length > 0) {
    const pos = queue.shift()!;
    const key = `${pos.row},${pos.col}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const b = grid[pos.row]?.[pos.col];
    if (!b || b.color !== color) continue;

    connected.push(pos);

    const neighbors = getHexNeighbors(pos.row, pos.col);
    for (const n of neighbors) {
      if (n.row >= 0 && n.row < grid.length) {
        queue.push(n);
      }
    }
  }

  return connected;
}

/**
 * 고립된 방울 찾기 (천장에서 연결 안 된 방울)
 */
export function findFloatingBubbles(
  grid: BubbleGrid,
  config: GameConfig = DEFAULT_CONFIG,
): GridPosition[] {
  const connectedToTop = new Set<string>();
  const queue: GridPosition[] = [];

  // 천장 줄의 모든 방울에서 시작
  if (grid.length > 0) {
    for (let col = 0; col < config.cols; col++) {
      if (grid[0]?.[col]) {
        queue.push({ row: 0, col });
      }
    }
  }

  // BFS
  while (queue.length > 0) {
    const pos = queue.shift()!;
    const key = `${pos.row},${pos.col}`;
    if (connectedToTop.has(key)) continue;
    if (!grid[pos.row]?.[pos.col]) continue;
    connectedToTop.add(key);
    const neighbors = getHexNeighbors(pos.row, pos.col);
    for (const n of neighbors) {
      if (n.row >= 0 && n.row < grid.length) {
        queue.push(n);
      }
    }
  }

  // 연결 안 된 것 = 고립
  const floating: GridPosition[] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < config.cols; c++) {
      if (grid[r]?.[c] && !connectedToTop.has(`${r},${c}`)) {
        floating.push({ row: r, col: c });
      }
    }
  }
  return floating;
}

/**
 * 가장 가까운 빈 격자 위치 찾기
 */
export function findNearestEmptySlot(
  grid: BubbleGrid,
  x: number,
  y: number,
  config: GameConfig = DEFAULT_CONFIG,
): GridPosition | null {
  const nearest = screenToGrid(x, y, config);

  // 이미 비어있으면 그대로
  if (!grid[nearest.row]?.[nearest.col]) {
    return nearest;
  }

  // 주변 빈 슬롯 탐색
  const neighbors = getHexNeighbors(nearest.row, nearest.col);
  let bestSlot: GridPosition | null = null;
  let bestDist = Infinity;

  for (const n of neighbors) {
    if (n.row < 0 || n.row >= grid.length) continue;
    if (n.col < 0 || n.col > getMaxCol(n.row, config)) continue;
    if (grid[n.row]?.[n.col]) continue;

    const pos = getGridPosition(n.row, n.col, config);
    const dist = Math.hypot(pos.x - x, pos.y - y);
    if (dist < bestDist) {
      bestDist = dist;
      bestSlot = n;
    }
  }

  return bestSlot;
}

/**
 * 초기 그리드 생성
 */
let bubbleIdCounter = 0;
export function resetBubbleIdCounter(): void {
  bubbleIdCounter = 0;
}

export function createBubbleId(): string {
  return `b${bubbleIdCounter++}`;
}

export function createInitialGrid(
  config: GameConfig = DEFAULT_CONFIG,
  colorCount: number = 5,
): BubbleGrid {
  const colors = BUBBLE_COLORS.slice(0, colorCount);
  const grid: BubbleGrid = [];

  for (let row = 0; row < config.rows; row++) {
    const maxCol = getMaxCol(row, config);
    const rowArr: (Bubble | null)[] = [];
    for (let col = 0; col <= maxCol; col++) {
      if (row < config.initialRows) {
        rowArr.push({
          color: colors[Math.floor(Math.random() * colors.length)],
          id: createBubbleId(),
        });
      } else {
        rowArr.push(null);
      }
    }
    grid.push(rowArr);
  }

  return grid;
}

/**
 * 그리드에서 사용 중인 색상 목록
 */
export function getActiveColors(grid: BubbleGrid): BubbleColor[] {
  const colorSet = new Set<BubbleColor>();
  for (const row of grid) {
    for (const cell of row) {
      if (cell) colorSet.add(cell.color);
    }
  }
  return Array.from(colorSet);
}

/**
 * 게임오버 체크 (방울이 데드라인 아래로 내려왔는지)
 */
export function checkGameOver(
  grid: BubbleGrid,
  config: GameConfig = DEFAULT_CONFIG,
): boolean {
  for (let col = 0; col < config.cols; col++) {
    if (grid[config.gameOverRow]?.[col]) {
      return true;
    }
  }
  return false;
}
