export type BubbleColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export const BUBBLE_COLORS: BubbleColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

export interface GridPosition {
  row: number;
  col: number;
}

export interface Bubble {
  color: BubbleColor;
  id: string;
}

export type BubbleGrid = (Bubble | null)[][];

export interface Point {
  x: number;
  y: number;
}

export interface AimState {
  angle: number;
  dotPositions: Point[];
  isAiming: boolean;
}

export interface ShooterState {
  currentBubble: BubbleColor;
  nextBubble: BubbleColor;
}

export interface GameConfig {
  cols: number;
  rows: number;
  bubbleRadius: number;
  initialRows: number;
  colorsCount: number;
  gameOverRow: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  cols: 8,
  rows: 15,
  bubbleRadius: 18,
  initialRows: 5,
  colorsCount: 5,
  gameOverRow: 12,
};
