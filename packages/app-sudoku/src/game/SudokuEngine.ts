import type { BoardState, CellState, CellValue, Difficulty, Grid, Position, SudokuGameState } from './types';
import { MAX_MISTAKES } from './types';
import { generatePuzzle } from './generator';
import { cloneGrid } from './solver';
import { calculateTotalScore } from './scoring';

export class SudokuEngine {
  private state: SudokuGameState;
  private onStateChange?: (state: SudokuGameState) => void;

  constructor(
    difficulty: Difficulty = 'medium',
    onStateChange?: (state: SudokuGameState) => void,
  ) {
    this.onStateChange = onStateChange;
    this.state = this.createInitialState(difficulty);
  }

  private createInitialState(difficulty: Difficulty): SudokuGameState {
    const { puzzle, solution } = generatePuzzle(difficulty);
    const board = this.createBoard(puzzle);

    return {
      board,
      solution,
      selectedCell: null,
      isNoteMode: false,
      mistakes: 0,
      maxMistakes: MAX_MISTAKES,
      hintsUsed: 0,
      difficulty,
      isComplete: false,
      elapsedSeconds: 0,
    };
  }

  private createBoard(puzzle: Grid): BoardState {
    return puzzle.map(row =>
      row.map(value => ({
        value: value as CellValue,
        isGiven: value !== 0,
        notes: new Set<number>(),
        isError: false,
      }))
    );
  }

  getState(): SudokuGameState {
    return this.state;
  }

  private emit(): void {
    this.onStateChange?.(this.state);
  }

  /**
   * 셀 선택
   */
  selectCell(row: number, col: number): void {
    this.state.selectedCell = { row, col };
    this.emit();
  }

  /**
   * 선택 해제
   */
  deselectCell(): void {
    this.state.selectedCell = null;
    this.emit();
  }

  /**
   * 숫자 입력
   */
  enterNumber(num: number): void {
    const { selectedCell, board, solution, isComplete } = this.state;
    if (!selectedCell || isComplete) return;

    const { row, col } = selectedCell;
    const cell = board[row][col];
    if (cell.isGiven) return;

    if (this.state.isNoteMode) {
      // 메모 모드
      if (cell.notes.has(num)) {
        cell.notes.delete(num);
      } else {
        cell.notes.add(num);
      }
      cell.value = 0;
    } else {
      // 숫자 입력 모드
      const correct = solution[row][col];

      if (num === correct) {
        cell.value = num as CellValue;
        cell.isError = false;
        cell.notes.clear();

        // 같은 숫자를 메모에서 제거 (같은 행/열/박스)
        this.clearRelatedNotes(row, col, num);

        // 완성 확인
        if (this.checkComplete()) {
          this.state.isComplete = true;
        }
      } else {
        cell.value = num as CellValue;
        cell.isError = true;
        this.state.mistakes++;

        if (this.state.mistakes >= this.state.maxMistakes) {
          this.state.isComplete = true; // 게임오버 (실패)
        }
      }
    }

    this.emit();
  }

  /**
   * 셀 지우기
   */
  eraseCell(): void {
    const { selectedCell, board } = this.state;
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const cell = board[row][col];
    if (cell.isGiven) return;

    cell.value = 0;
    cell.isError = false;
    cell.notes.clear();
    this.emit();
  }

  /**
   * 메모 모드 토글
   */
  toggleNoteMode(): void {
    this.state.isNoteMode = !this.state.isNoteMode;
    this.emit();
  }

  /**
   * 힌트 사용
   */
  useHint(): boolean {
    const { selectedCell, board, solution, isComplete } = this.state;
    if (isComplete) return false;

    let target: Position | null = selectedCell;

    // 선택된 셀이 없거나 이미 채워진 경우 → 빈 셀 찾기
    if (!target || board[target.row][target.col].isGiven || board[target.row][target.col].value === solution[target.row][target.col]) {
      target = this.findEmptyCell();
    }

    if (!target) return false;

    const { row, col } = target;
    const cell = board[row][col];
    cell.value = solution[row][col] as CellValue;
    cell.isError = false;
    cell.notes.clear();
    this.state.hintsUsed++;
    this.state.selectedCell = target;

    this.clearRelatedNotes(row, col, cell.value);

    if (this.checkComplete()) {
      this.state.isComplete = true;
    }

    this.emit();
    return true;
  }

  /**
   * 타이머 업데이트
   */
  tick(): void {
    if (!this.state.isComplete) {
      this.state.elapsedSeconds++;
    }
  }

  /**
   * 점수 계산
   */
  getScore(): number {
    return calculateTotalScore(
      this.state.difficulty,
      this.state.elapsedSeconds,
      this.state.mistakes,
      this.state.hintsUsed,
    );
  }

  /**
   * 게임 성공 여부 (실수 초과가 아닌 완성)
   */
  isWin(): boolean {
    return this.state.isComplete && this.state.mistakes < this.state.maxMistakes;
  }

  /**
   * 게임 리셋
   */
  reset(difficulty?: Difficulty): void {
    this.state = this.createInitialState(difficulty ?? this.state.difficulty);
    this.emit();
  }

  private checkComplete(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = this.state.board[r][c];
        if (cell.value === 0 || cell.isError) return false;
      }
    }
    return true;
  }

  private findEmptyCell(): Position | null {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = this.state.board[r][c];
        if (!cell.isGiven && (cell.value === 0 || cell.isError)) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  private clearRelatedNotes(row: number, col: number, num: number): void {
    const { board } = this.state;

    // 행
    for (let c = 0; c < 9; c++) board[row][c].notes.delete(num);
    // 열
    for (let r = 0; r < 9; r++) board[r][col].notes.delete(num);
    // 박스
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        board[r][c].notes.delete(num);
      }
    }
  }
}
