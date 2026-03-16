import type { BubbleGrid, BubbleColor, GridPosition, Point, GameConfig } from './types';
import { DEFAULT_CONFIG, BUBBLE_COLORS } from './types';
import {
  createInitialGrid,
  findConnectedSameColor,
  findFloatingBubbles,
  findNearestEmptySlot,
  getGridPosition,
  getActiveColors,
  checkGameOver,
  createBubbleId,
  resetBubbleIdCounter,
} from './grid';
import { findCollisionPoint } from './aiming';
import { calculateTotalScore } from './scoring';

export type GamePhase = 'ready' | 'aiming' | 'shooting' | 'popping' | 'gameover';

export interface BubbleShooterState {
  grid: BubbleGrid;
  currentBubble: BubbleColor;
  nextBubble: BubbleColor;
  score: number;
  combo: number;
  phase: GamePhase;
  shootingBubble: { x: number; y: number; color: BubbleColor } | null;
  poppingPositions: GridPosition[];
  droppingPositions: GridPosition[];
  shotsRemaining: number;
}

export class BubbleShooterEngine {
  private state: BubbleShooterState;
  private config: GameConfig;
  private screenWidth: number;
  private onStateChange?: (state: BubbleShooterState) => void;

  constructor(
    screenWidth: number,
    config: GameConfig = DEFAULT_CONFIG,
    onStateChange?: (state: BubbleShooterState) => void,
  ) {
    this.screenWidth = screenWidth;
    this.config = config;
    this.onStateChange = onStateChange;
    resetBubbleIdCounter();
    this.state = this.createInitialState();
  }

  private createInitialState(): BubbleShooterState {
    const grid = createInitialGrid(this.config, this.config.colorsCount);
    const colors = getActiveColors(grid);

    return {
      grid,
      currentBubble: this.randomColor(colors),
      nextBubble: this.randomColor(colors),
      score: 0,
      combo: 0,
      phase: 'ready',
      shootingBubble: null,
      poppingPositions: [],
      droppingPositions: [],
      shotsRemaining: -1, // 무제한
    };
  }

  getState(): BubbleShooterState {
    return this.state;
  }

  private emit(): void {
    this.onStateChange?.({ ...this.state });
  }

  private randomColor(colors?: BubbleColor[]): BubbleColor {
    const pool = colors && colors.length > 0 ? colors : BUBBLE_COLORS.slice(0, this.config.colorsCount);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * 방울 발사
   */
  shoot(angle: number): void {
    if (this.state.phase !== 'ready' && this.state.phase !== 'aiming') return;

    this.state.phase = 'shooting';

    // 발사 위치
    const launcherX = this.screenWidth / 2;
    const launcherY = this.getGridHeight() + this.config.bubbleRadius * 4;

    // 충돌 지점 계산
    const occupiedPositions = this.getOccupiedScreenPositions();
    const collision = findCollisionPoint(
      launcherX, launcherY, angle, this.screenWidth, occupiedPositions, this.config,
    );

    // 가장 가까운 빈 슬롯 찾기
    const slot = findNearestEmptySlot(this.state.grid, collision.x, collision.y, this.config);

    if (slot && slot.row < this.config.rows) {
      // 격자에 방울 배치
      this.state.grid[slot.row][slot.col] = {
        color: this.state.currentBubble,
        id: createBubbleId(),
      };

      // 같은 색 연결 찾기
      const connected = findConnectedSameColor(this.state.grid, slot.row, slot.col);

      if (connected.length >= 3) {
        // 터뜨리기!
        this.state.poppingPositions = connected;
        this.state.combo++;

        // 방울 제거
        for (const pos of connected) {
          this.state.grid[pos.row][pos.col] = null;
        }

        // 고립 방울 찾기
        const floating = findFloatingBubbles(this.state.grid, this.config);
        this.state.droppingPositions = floating;

        // 고립 방울 제거
        for (const pos of floating) {
          this.state.grid[pos.row][pos.col] = null;
        }

        // 점수 계산
        const points = calculateTotalScore(connected.length, floating.length, this.state.combo);
        this.state.score += points;

        this.state.phase = 'popping';

        // 팝 애니메이션 후 자동 전환
        setTimeout(() => this.finishPopping(), 300);
      } else {
        // 못 터뜨리면 콤보 리셋
        this.state.combo = 0;
        this.state.poppingPositions = [];
        this.state.droppingPositions = [];
      }

      // 게임오버 체크
      if (checkGameOver(this.state.grid, this.config)) {
        this.state.phase = 'gameover';
        this.emit();
        return;
      }
    }

    // 다음 방울 준비
    const colors = getActiveColors(this.state.grid);
    this.state.currentBubble = this.state.nextBubble;
    this.state.nextBubble = this.randomColor(colors.length > 0 ? colors : undefined);

    const phase = this.state.phase as GamePhase;
    if (phase !== 'gameover' && phase !== 'popping') {
      this.state.phase = 'ready';
    }

    this.emit();
  }

  /**
   * 팝 애니메이션 완료 후 호출
   */
  finishPopping(): void {
    if (this.state.phase !== 'popping') return;
    this.state.poppingPositions = [];
    this.state.droppingPositions = [];
    this.state.phase = 'ready';
    this.emit();
  }

  /**
   * 보상: 5발 추가 (부활)
   */
  addExtraShots(count: number = 5): void {
    if (this.state.phase !== 'gameover') return;
    this.state.shotsRemaining = count;
    this.state.phase = 'ready';
    this.emit();
  }

  /**
   * 게임 리셋
   */
  reset(): void {
    resetBubbleIdCounter();
    this.state = this.createInitialState();
    this.emit();
  }

  /**
   * 현재 방울들의 화면 좌표
   */
  getOccupiedScreenPositions(): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = [];
    for (let r = 0; r < this.state.grid.length; r++) {
      for (let c = 0; c < this.state.grid[r].length; c++) {
        if (this.state.grid[r][c]) {
          positions.push(getGridPosition(r, c, this.config));
        }
      }
    }
    return positions;
  }

  /**
   * 그리드 높이 (방울이 차지하는 영역)
   */
  getGridHeight(): number {
    const d = this.config.bubbleRadius * 2;
    return this.config.rows * (d * Math.sqrt(3) / 2) + this.config.bubbleRadius;
  }

  getConfig(): GameConfig {
    return this.config;
  }

  getScreenWidth(): number {
    return this.screenWidth;
  }
}
