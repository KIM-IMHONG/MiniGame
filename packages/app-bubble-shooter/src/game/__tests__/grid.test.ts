import {
  getGridPosition,
  getHexNeighbors,
  findConnectedSameColor,
  findFloatingBubbles,
  findNearestEmptySlot,
  getMaxCol,
  checkGameOver,
  screenToGrid,
  getActiveColors,
  createBubbleId,
  resetBubbleIdCounter,
} from '../grid';
import type { BubbleGrid, Bubble, GameConfig } from '../types';
import { DEFAULT_CONFIG } from '../types';

function makeBubble(color: string): Bubble {
  return { color: color as any, id: createBubbleId() };
}

function makeGrid(rows: number, cols: number): BubbleGrid {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

describe('grid', () => {
  beforeEach(() => resetBubbleIdCounter());

  describe('getGridPosition', () => {
    it('짝수 행 좌표 계산', () => {
      const pos = getGridPosition(0, 0);
      expect(pos.x).toBe(DEFAULT_CONFIG.bubbleRadius);
      expect(pos.y).toBe(DEFAULT_CONFIG.bubbleRadius);
    });

    it('홀수 행 오프셋 적용', () => {
      const pos0 = getGridPosition(0, 0);
      const pos1 = getGridPosition(1, 0);
      // 홀수 행은 반칸 오프셋
      expect(pos1.x).toBe(pos0.x + DEFAULT_CONFIG.bubbleRadius);
    });
  });

  describe('getHexNeighbors', () => {
    it('짝수 행 6방향', () => {
      const neighbors = getHexNeighbors(2, 3);
      expect(neighbors).toHaveLength(6);
      expect(neighbors).toContainEqual({ row: 1, col: 2 }); // 왼쪽 위
      expect(neighbors).toContainEqual({ row: 1, col: 3 }); // 오른쪽 위
      expect(neighbors).toContainEqual({ row: 2, col: 2 }); // 왼쪽
      expect(neighbors).toContainEqual({ row: 2, col: 4 }); // 오른쪽
    });

    it('홀수 행 6방향', () => {
      const neighbors = getHexNeighbors(1, 2);
      expect(neighbors).toHaveLength(6);
      expect(neighbors).toContainEqual({ row: 0, col: 2 }); // 왼쪽 위
      expect(neighbors).toContainEqual({ row: 0, col: 3 }); // 오른쪽 위
    });
  });

  describe('findConnectedSameColor', () => {
    it('3개 연결 감지', () => {
      const grid = makeGrid(5, 8);
      grid[0][0] = makeBubble('red');
      grid[0][1] = makeBubble('red');
      grid[0][2] = makeBubble('red');

      const connected = findConnectedSameColor(grid, 0, 0);
      expect(connected.length).toBe(3);
    });

    it('다른 색은 연결 안 됨', () => {
      const grid = makeGrid(5, 8);
      grid[0][0] = makeBubble('red');
      grid[0][1] = makeBubble('blue');
      grid[0][2] = makeBubble('red');

      const connected = findConnectedSameColor(grid, 0, 0);
      expect(connected.length).toBe(1);
    });

    it('빈 셀은 빈 배열', () => {
      const grid = makeGrid(5, 8);
      const connected = findConnectedSameColor(grid, 0, 0);
      expect(connected.length).toBe(0);
    });

    it('L자 형태 연결', () => {
      const grid = makeGrid(5, 8);
      grid[0][0] = makeBubble('green');
      grid[0][1] = makeBubble('green');
      grid[1][0] = makeBubble('green'); // 홀수행 인접
      grid[1][1] = makeBubble('green');

      const connected = findConnectedSameColor(grid, 0, 0);
      expect(connected.length).toBe(4);
    });
  });

  describe('findFloatingBubbles', () => {
    it('천장에 연결된 방울은 떠있지 않음', () => {
      const grid = makeGrid(5, 8);
      grid[0][0] = makeBubble('red');
      grid[0][1] = makeBubble('blue');

      const floating = findFloatingBubbles(grid);
      expect(floating.length).toBe(0);
    });

    it('천장과 연결 안 된 방울은 고립', () => {
      const grid = makeGrid(5, 8);
      grid[0][0] = makeBubble('red');
      grid[3][3] = makeBubble('blue'); // 고립

      const floating = findFloatingBubbles(grid);
      expect(floating.length).toBe(1);
      expect(floating[0]).toEqual({ row: 3, col: 3 });
    });

    it('체인으로 연결되면 고립 아님', () => {
      const grid = makeGrid(5, 8);
      grid[0][0] = makeBubble('red');
      grid[1][0] = makeBubble('blue'); // 0,0과 인접
      grid[2][0] = makeBubble('green'); // 1,0과 인접 (체인)

      const floating = findFloatingBubbles(grid);
      expect(floating.length).toBe(0);
    });
  });

  describe('getMaxCol', () => {
    it('짝수 행은 cols-1', () => {
      expect(getMaxCol(0)).toBe(7);
    });

    it('홀수 행은 cols-2', () => {
      expect(getMaxCol(1)).toBe(6);
    });
  });

  describe('checkGameOver', () => {
    it('데드라인 아래에 방울 없으면 false', () => {
      const grid = makeGrid(15, 8);
      grid[0][0] = makeBubble('red');
      expect(checkGameOver(grid)).toBe(false);
    });

    it('데드라인에 방울 있으면 true', () => {
      const grid = makeGrid(15, 8);
      grid[12][0] = makeBubble('red');
      expect(checkGameOver(grid)).toBe(true);
    });
  });

  describe('screenToGrid', () => {
    it('정확한 위치를 격자로 변환', () => {
      const pos = getGridPosition(2, 3);
      const gridPos = screenToGrid(pos.x, pos.y);
      expect(gridPos.row).toBe(2);
      expect(gridPos.col).toBe(3);
    });
  });

  describe('getActiveColors', () => {
    it('사용 중인 색상만 반환', () => {
      const grid = makeGrid(5, 8);
      grid[0][0] = makeBubble('red');
      grid[0][1] = makeBubble('blue');
      grid[1][0] = makeBubble('red');

      const colors = getActiveColors(grid);
      expect(colors).toHaveLength(2);
      expect(colors).toContain('red');
      expect(colors).toContain('blue');
    });
  });
});
