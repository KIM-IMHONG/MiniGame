import { SudokuEngine } from '../SudokuEngine';

describe('SudokuEngine', () => {
  let engine: SudokuEngine;

  beforeEach(() => {
    engine = new SudokuEngine('easy');
  });

  it('should initialize with correct state', () => {
    const state = engine.getState();
    expect(state.difficulty).toBe('easy');
    expect(state.mistakes).toBe(0);
    expect(state.hintsUsed).toBe(0);
    expect(state.isComplete).toBe(false);
    expect(state.isNoteMode).toBe(false);
    expect(state.selectedCell).toBeNull();
    expect(state.board.length).toBe(9);
    expect(state.board[0].length).toBe(9);
  });

  it('should have given cells in the board', () => {
    const state = engine.getState();
    let givenCount = 0;
    for (const row of state.board) {
      for (const cell of row) {
        if (cell.isGiven) givenCount++;
      }
    }
    expect(givenCount).toBeGreaterThan(30); // Easy has 36-45 clues
    expect(givenCount).toBeLessThanOrEqual(45);
  });

  it('should select and deselect cells', () => {
    engine.selectCell(3, 4);
    expect(engine.getState().selectedCell).toEqual({ row: 3, col: 4 });

    engine.deselectCell();
    expect(engine.getState().selectedCell).toBeNull();
  });

  it('should not modify given cells', () => {
    const state = engine.getState();
    // Find a given cell
    let givenPos: { row: number; col: number } | null = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (state.board[r][c].isGiven) {
          givenPos = { row: r, col: c };
          break;
        }
      }
      if (givenPos) break;
    }

    expect(givenPos).not.toBeNull();
    engine.selectCell(givenPos!.row, givenPos!.col);
    const originalValue = state.board[givenPos!.row][givenPos!.col].value;
    engine.enterNumber(9);
    expect(engine.getState().board[givenPos!.row][givenPos!.col].value).toBe(originalValue);
  });

  it('should enter correct number without error', () => {
    const state = engine.getState();
    // Find an empty cell
    let emptyPos: { row: number; col: number } | null = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!state.board[r][c].isGiven && state.board[r][c].value === 0) {
          emptyPos = { row: r, col: c };
          break;
        }
      }
      if (emptyPos) break;
    }

    expect(emptyPos).not.toBeNull();
    const correctValue = state.solution[emptyPos!.row][emptyPos!.col];
    engine.selectCell(emptyPos!.row, emptyPos!.col);
    engine.enterNumber(correctValue);

    const cell = engine.getState().board[emptyPos!.row][emptyPos!.col];
    expect(cell.value).toBe(correctValue);
    expect(cell.isError).toBe(false);
  });

  it('should mark wrong number as error and count mistake', () => {
    const state = engine.getState();
    let emptyPos: { row: number; col: number } | null = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!state.board[r][c].isGiven && state.board[r][c].value === 0) {
          emptyPos = { row: r, col: c };
          break;
        }
      }
      if (emptyPos) break;
    }

    const correctValue = state.solution[emptyPos!.row][emptyPos!.col];
    const wrongValue = correctValue === 9 ? 1 : correctValue + 1;

    engine.selectCell(emptyPos!.row, emptyPos!.col);
    engine.enterNumber(wrongValue);

    const newState = engine.getState();
    expect(newState.board[emptyPos!.row][emptyPos!.col].isError).toBe(true);
    expect(newState.mistakes).toBe(1);
  });

  it('should toggle note mode', () => {
    expect(engine.getState().isNoteMode).toBe(false);
    engine.toggleNoteMode();
    expect(engine.getState().isNoteMode).toBe(true);
    engine.toggleNoteMode();
    expect(engine.getState().isNoteMode).toBe(false);
  });

  it('should add and toggle notes', () => {
    const state = engine.getState();
    let emptyPos: { row: number; col: number } | null = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!state.board[r][c].isGiven && state.board[r][c].value === 0) {
          emptyPos = { row: r, col: c };
          break;
        }
      }
      if (emptyPos) break;
    }

    engine.selectCell(emptyPos!.row, emptyPos!.col);
    engine.toggleNoteMode();
    engine.enterNumber(1);
    engine.enterNumber(3);

    const cell = engine.getState().board[emptyPos!.row][emptyPos!.col];
    expect(cell.notes.has(1)).toBe(true);
    expect(cell.notes.has(3)).toBe(true);
    expect(cell.value).toBe(0);

    // Toggle note off
    engine.enterNumber(1);
    expect(engine.getState().board[emptyPos!.row][emptyPos!.col].notes.has(1)).toBe(false);
  });

  it('should erase cell', () => {
    const state = engine.getState();
    let emptyPos: { row: number; col: number } | null = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!state.board[r][c].isGiven && state.board[r][c].value === 0) {
          emptyPos = { row: r, col: c };
          break;
        }
      }
      if (emptyPos) break;
    }

    engine.selectCell(emptyPos!.row, emptyPos!.col);
    const correct = state.solution[emptyPos!.row][emptyPos!.col];
    engine.enterNumber(correct);
    expect(engine.getState().board[emptyPos!.row][emptyPos!.col].value).toBe(correct);

    engine.eraseCell();
    expect(engine.getState().board[emptyPos!.row][emptyPos!.col].value).toBe(0);
  });

  it('should use hint', () => {
    const state = engine.getState();
    let emptyPos: { row: number; col: number } | null = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!state.board[r][c].isGiven && state.board[r][c].value === 0) {
          emptyPos = { row: r, col: c };
          break;
        }
      }
      if (emptyPos) break;
    }

    engine.selectCell(emptyPos!.row, emptyPos!.col);
    const result = engine.useHint();
    expect(result).toBe(true);

    const newState = engine.getState();
    expect(newState.hintsUsed).toBe(1);
    expect(newState.board[emptyPos!.row][emptyPos!.col].value).toBe(
      state.solution[emptyPos!.row][emptyPos!.col]
    );
  });

  it('should tick timer', () => {
    expect(engine.getState().elapsedSeconds).toBe(0);
    engine.tick();
    engine.tick();
    expect(engine.getState().elapsedSeconds).toBe(2);
  });

  it('should reset game', () => {
    engine.tick();
    engine.tick();
    engine.reset('hard');
    const state = engine.getState();
    expect(state.difficulty).toBe('hard');
    expect(state.elapsedSeconds).toBe(0);
    expect(state.mistakes).toBe(0);
    expect(state.isComplete).toBe(false);
  });

  it('should calculate score', () => {
    const score = engine.getScore();
    expect(score).toBeGreaterThan(0);
  });

  it('should report game over after max mistakes', () => {
    const state = engine.getState();
    // Find 3 empty cells and enter wrong numbers
    let emptyCells: Array<{ row: number; col: number }> = [];
    for (let r = 0; r < 9 && emptyCells.length < 3; r++) {
      for (let c = 0; c < 9 && emptyCells.length < 3; c++) {
        if (!state.board[r][c].isGiven && state.board[r][c].value === 0) {
          emptyCells.push({ row: r, col: c });
        }
      }
    }

    for (const pos of emptyCells) {
      const correct = state.solution[pos.row][pos.col];
      const wrong = correct === 9 ? 1 : correct + 1;
      engine.selectCell(pos.row, pos.col);
      engine.enterNumber(wrong);
    }

    expect(engine.getState().isComplete).toBe(true);
    expect(engine.isWin()).toBe(false);
  });
});
