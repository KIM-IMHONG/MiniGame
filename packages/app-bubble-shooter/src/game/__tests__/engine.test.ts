import { BubbleShooterEngine, type BubbleShooterState } from '../BubbleShooterEngine';
import { DEFAULT_CONFIG } from '../types';

describe('BubbleShooterEngine', () => {
  let engine: BubbleShooterEngine;
  let lastState: BubbleShooterState | null;

  beforeEach(() => {
    lastState = null;
    engine = new BubbleShooterEngine(300, DEFAULT_CONFIG, (state) => {
      lastState = state;
    });
  });

  it('should initialize with correct state', () => {
    const state = engine.getState();
    expect(state.phase).toBe('ready');
    expect(state.score).toBe(0);
    expect(state.combo).toBe(0);
    expect(state.grid.length).toBe(DEFAULT_CONFIG.rows);
    expect(state.grid[0].length).toBe(DEFAULT_CONFIG.cols);
    expect(state.currentBubble).toBeDefined();
    expect(state.nextBubble).toBeDefined();
  });

  it('should have bubbles in initial rows', () => {
    const state = engine.getState();
    // First initialRows should have bubbles
    for (let r = 0; r < DEFAULT_CONFIG.initialRows; r++) {
      const hasBubble = state.grid[r].some((b) => b !== null);
      expect(hasBubble).toBe(true);
    }
    // Rows beyond initialRows should be empty
    for (let r = DEFAULT_CONFIG.initialRows; r < DEFAULT_CONFIG.rows; r++) {
      const allEmpty = state.grid[r].every((b) => b === null);
      expect(allEmpty).toBe(true);
    }
  });

  it('should shoot and change phase', () => {
    engine.shoot(0); // shoot straight up
    expect(lastState).not.toBeNull();
    // After shot, should be ready, popping, or gameover
    expect(['ready', 'popping', 'gameover']).toContain(lastState!.phase);
  });

  it('should advance current/next bubble after shot', () => {
    const before = engine.getState();
    const nextBubble = before.nextBubble;
    engine.shoot(0);
    expect(lastState!.currentBubble).toBe(nextBubble);
  });

  it('should reset game', () => {
    engine.shoot(0);
    engine.reset();
    expect(lastState!.phase).toBe('ready');
    expect(lastState!.score).toBe(0);
    expect(lastState!.combo).toBe(0);
  });

  it('should return grid height', () => {
    const height = engine.getGridHeight();
    expect(height).toBeGreaterThan(0);
    const d = DEFAULT_CONFIG.bubbleRadius * 2;
    const expected = DEFAULT_CONFIG.rows * (d * Math.sqrt(3) / 2) + DEFAULT_CONFIG.bubbleRadius;
    expect(height).toBeCloseTo(expected, 2);
  });

  it('should get occupied screen positions', () => {
    const positions = engine.getOccupiedScreenPositions();
    expect(positions.length).toBeGreaterThan(0);
    positions.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeGreaterThanOrEqual(0);
    });
  });

  it('should not shoot during gameover', () => {
    const state = engine.getState();
    // Force gameover
    (engine as any).state.phase = 'gameover';
    engine.shoot(0);
    // Should not have changed (no emit because shoot returns early)
    expect(engine.getState().phase).toBe('gameover');
  });

  it('should handle finishPopping', () => {
    (engine as any).state.phase = 'popping';
    (engine as any).state.poppingPositions = [{ row: 0, col: 0 }];
    engine.finishPopping();
    expect(lastState!.phase).toBe('ready');
    expect(lastState!.poppingPositions).toEqual([]);
  });

  it('should handle addExtraShots on gameover', () => {
    (engine as any).state.phase = 'gameover';
    engine.addExtraShots(5);
    expect(lastState!.phase).toBe('ready');
    expect(lastState!.shotsRemaining).toBe(5);
  });

  it('should not addExtraShots when not gameover', () => {
    engine.addExtraShots(5);
    // No state change emitted for non-gameover
    expect(engine.getState().phase).toBe('ready');
    expect(engine.getState().shotsRemaining).toBe(-1);
  });
});
