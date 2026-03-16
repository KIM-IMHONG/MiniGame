import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SudokuEngine } from './SudokuEngine';
import type { Difficulty } from './types';
import type { GameControls } from '@shared/core/src/types/game';

interface Props {
  controls: GameControls;
  difficulty?: Difficulty;
}

const SCREEN_WIDTH = Math.min(Dimensions.get('window').width, 400);
const BOARD_PADDING = 8;
const BOARD_SIZE = SCREEN_WIDTH - BOARD_PADDING * 2;
const CELL_SIZE = Math.floor(BOARD_SIZE / 9);

const COLORS = {
  bg: '#0F0F1E',
  cellBg: '#1A1A2E',
  cellSelected: '#2D5AA0',
  cellSameNumber: '#1E3A5F',
  cellSameGroup: '#161630',
  cellGiven: '#E8E8F0',
  cellInput: '#5B9BD5',
  cellError: '#FF4757',
  cellNote: '#888',
  gridLine: '#333355',
  boxLine: '#6666AA',
  numPad: '#1A1A2E',
  numPadActive: '#2D5AA0',
  numPadText: '#E8E8F0',
  toolBtn: '#1A1A2E',
  toolBtnActive: '#2D5AA0',
  white: '#E8E8F0',
  muted: '#888',
};

export function SudokuGame({ controls, difficulty = 'medium' }: Props) {
  const engineRef = useRef<SudokuEngine | null>(null);
  const [tick, setTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const rerender = useCallback(() => setTick(n => n + 1), []);

  // 엔진 초기화
  useEffect(() => {
    const engine = new SudokuEngine(difficulty, () => rerender());
    engineRef.current = engine;
    rerender();

    timerRef.current = setInterval(() => {
      engine.tick();
      rerender();
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty]);

  const engine = engineRef.current;
  const state = engine?.getState();

  // 게임 완료 처리
  useEffect(() => {
    if (!engine || !state) return;
    if (state.isComplete) {
      if (timerRef.current) clearInterval(timerRef.current);
      const score = engine.getScore();
      controls.reportScore(score);
      controls.reportGameOver(score);
    }
  }, [state?.isComplete]);

  // 점수 실시간 업데이트
  useEffect(() => {
    if (!engine || !state || state.isComplete) return;
    controls.reportScore(engine.getScore());
  }, [tick]);

  // 모든 hooks 이후 조건부 리턴
  if (!engine || !state) return null;

  // TypeScript narrowing doesn't flow into nested functions, so alias
  const board = state.board;
  const selectedCell = state.selectedCell;
  const selectedValue = selectedCell
    ? state.board[selectedCell.row][selectedCell.col].value
    : 0;

  function isSameGroup(r: number, c: number): boolean {
    if (!selectedCell) return false;
    const sr = selectedCell.row;
    const sc = selectedCell.col;
    return (
      r === sr ||
      c === sc ||
      (Math.floor(r / 3) === Math.floor(sr / 3) &&
        Math.floor(c / 3) === Math.floor(sc / 3))
    );
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function getNumberCount(num: number): number {
    let count = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell.value === num && !cell.isError) count++;
      }
    }
    return count;
  }

  return (
    <View style={styles.container}>
      {/* 상태 바 */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>{difficulty.toUpperCase()}</Text>
        <Text style={styles.statusText}>{formatTime(state.elapsedSeconds)}</Text>
        <Text style={styles.statusText}>
          {Array.from({ length: state.maxMistakes }, (_, i) =>
            i < state.mistakes ? 'X' : 'O'
          ).join(' ')}
        </Text>
      </View>

      {/* 보드 */}
      <View style={[styles.board, { width: CELL_SIZE * 9, height: CELL_SIZE * 9 }]}>
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isSelected = selectedCell?.row === r && selectedCell?.col === c;
            const hasSameValue = selectedValue !== 0 && cell.value === selectedValue && !cell.isError;
            const inGroup = isSameGroup(r, c);

            return (
              <TouchableOpacity
                key={`${r}-${c}`}
                style={[
                  styles.cell,
                  {
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    left: c * CELL_SIZE,
                    top: r * CELL_SIZE,
                    backgroundColor: isSelected
                      ? COLORS.cellSelected
                      : hasSameValue
                      ? COLORS.cellSameNumber
                      : inGroup
                      ? COLORS.cellSameGroup
                      : COLORS.cellBg,
                    borderRightWidth: (c + 1) % 3 === 0 && c < 8 ? 2 : 0.5,
                    borderBottomWidth: (r + 1) % 3 === 0 && r < 8 ? 2 : 0.5,
                    borderRightColor: (c + 1) % 3 === 0 ? COLORS.boxLine : COLORS.gridLine,
                    borderBottomColor: (r + 1) % 3 === 0 ? COLORS.boxLine : COLORS.gridLine,
                  },
                ]}
                onPress={() => engine.selectCell(r, c)}
                activeOpacity={0.7}
              >
                {cell.value !== 0 ? (
                  <Text
                    style={[
                      styles.cellText,
                      {
                        color: cell.isError
                          ? COLORS.cellError
                          : cell.isGiven
                          ? COLORS.cellGiven
                          : COLORS.cellInput,
                        fontWeight: cell.isGiven ? '700' : '400',
                      },
                    ]}
                  >
                    {cell.value}
                  </Text>
                ) : cell.notes.size > 0 ? (
                  <View style={styles.notesGrid}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <Text
                        key={n}
                        style={[
                          styles.noteText,
                          { opacity: cell.notes.has(n) ? 1 : 0 },
                        ]}
                      >
                        {n}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* 도구 버튼 */}
      <View style={styles.toolRow}>
        <TouchableOpacity
          style={[styles.toolBtn, state.isNoteMode && styles.toolBtnActive]}
          onPress={() => engine.toggleNoteMode()}
        >
          <Text style={styles.toolBtnText}>MEMO</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => engine.eraseCell()}
        >
          <Text style={styles.toolBtnText}>ERASE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => engine.useHint()}
        >
          <Text style={styles.toolBtnText}>HINT</Text>
          <Text style={styles.toolBtnSub}>({state.hintsUsed})</Text>
        </TouchableOpacity>
      </View>

      {/* 숫자 패드 */}
      <View style={styles.numPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const remaining = 9 - getNumberCount(num);
          const isDone = remaining <= 0;
          return (
            <TouchableOpacity
              key={num}
              style={[
                styles.numBtn,
                isDone && styles.numBtnDone,
                selectedValue === num && styles.numBtnSelected,
              ]}
              onPress={() => engine.enterNumber(num)}
              disabled={isDone}
            >
              <Text style={[styles.numBtnText, isDone && styles.numBtnTextDone]}>
                {num}
              </Text>
              {!isDone && (
                <Text style={styles.numBtnCount}>{remaining}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    paddingTop: 8,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: CELL_SIZE * 9,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  statusText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  board: {
    position: 'relative',
    borderWidth: 2,
    borderColor: COLORS.boxLine,
  },
  cell: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: CELL_SIZE * 0.55,
  },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    padding: 1,
  },
  noteText: {
    width: '33.33%',
    height: '33.33%',
    textAlign: 'center',
    fontSize: CELL_SIZE * 0.22,
    color: COLORS.cellNote,
    lineHeight: CELL_SIZE * 0.33,
  },
  toolRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  toolBtn: {
    backgroundColor: COLORS.toolBtn,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toolBtnActive: {
    backgroundColor: COLORS.toolBtnActive,
  },
  toolBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  toolBtnSub: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 2,
  },
  numPad: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  numBtn: {
    backgroundColor: COLORS.numPad,
    width: Math.floor((CELL_SIZE * 9) / 9.5),
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numBtnDone: {
    opacity: 0.3,
  },
  numBtnSelected: {
    backgroundColor: COLORS.numPadActive,
  },
  numBtnText: {
    color: COLORS.numPadText,
    fontSize: 22,
    fontWeight: '700',
  },
  numBtnTextDone: {
    color: COLORS.muted,
  },
  numBtnCount: {
    color: COLORS.muted,
    fontSize: 9,
    position: 'absolute',
    bottom: 4,
  },
});
