export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Grid = CellValue[][];

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface CellState {
  value: CellValue;
  isGiven: boolean;       // 초기 제공 숫자
  notes: Set<number>;     // 메모 (후보 숫자)
  isError: boolean;       // 충돌 표시
}

export type BoardState = CellState[][];

export interface Position {
  row: number;
  col: number;
}

export interface SudokuGameState {
  board: BoardState;
  solution: Grid;
  selectedCell: Position | null;
  isNoteMode: boolean;
  mistakes: number;
  maxMistakes: number;
  hintsUsed: number;
  difficulty: Difficulty;
  isComplete: boolean;
  elapsedSeconds: number;
}

export const DIFFICULTY_CLUES: Record<Difficulty, { min: number; max: number }> = {
  easy:   { min: 36, max: 45 },
  medium: { min: 27, max: 35 },
  hard:   { min: 22, max: 26 },
  expert: { min: 17, max: 21 },
};

export const MAX_MISTAKES = 3;
