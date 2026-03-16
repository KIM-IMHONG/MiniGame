import { DodgePoopEngine, type DodgePoopState } from '../DodgePoopEngine';

describe('DodgePoopEngine', () => {
  let engine: DodgePoopEngine;
  let lastState: DodgePoopState | null;

  beforeEach(() => {
    lastState = null;
    engine = new DodgePoopEngine(
      { screenWidth: 300, screenHeight: 600 },
      (state) => { lastState = state; },
    );
  });

  it('should initialize with correct state', () => {
    const state = engine.getState();
    expect(state.isGameOver).toBe(false);
    expect(state.score).toBe(0);
    expect(state.starsCollected).toBe(0);
    expect(state.objects).toEqual([]);
    expect(state.player.x).toBeGreaterThan(0);
    expect(state.player.y).toBeGreaterThan(0);
  });

  it('should move player', () => {
    engine.movePlayer(100);
    const state = engine.getState();
    expect(state.player.x).toBeCloseTo(80, 0); // 100 - playerWidth/2
  });

  it('should clamp player to screen bounds', () => {
    engine.movePlayer(-100);
    expect(engine.getState().player.x).toBe(0);

    engine.movePlayer(500);
    expect(engine.getState().player.x).toBe(260); // 300 - 40
  });

  it('should increment frames on update', () => {
    engine.update();
    engine.update();
    expect(engine.getState().elapsedFrames).toBe(2);
  });

  it('should spawn objects over time', () => {
    // Run enough frames to trigger spawning
    for (let i = 0; i < 100; i++) engine.update();
    expect(engine.getState().objects.length).toBeGreaterThan(0);
  });

  it('should move objects downward', () => {
    // Force spawn by running many frames
    for (let i = 0; i < 60; i++) engine.update();
    const objects = engine.getState().objects;
    if (objects.length > 0) {
      expect(objects[0].y).toBeGreaterThan(-objects[0].height);
    }
  });

  it('should detect collision with poop (game over)', () => {
    // Manually place a poop right on the player
    const state = engine.getState();
    state.objects.push({
      id: 999,
      x: state.player.x,
      y: state.player.y,
      width: 30,
      height: 30,
      speed: 3,
      type: 'poop',
    });

    engine.update();
    expect(engine.getState().isGameOver).toBe(true);
  });

  it('should collect stars', () => {
    const state = engine.getState();
    state.objects.push({
      id: 998,
      x: state.player.x,
      y: state.player.y,
      width: 24,
      height: 24,
      speed: 3,
      type: 'star',
    });

    engine.update();
    expect(engine.getState().starsCollected).toBe(1);
    expect(engine.getState().combo).toBe(1);
  });

  it('should activate shield', () => {
    const state = engine.getState();
    state.objects.push({
      id: 997,
      x: state.player.x,
      y: state.player.y,
      width: 24,
      height: 24,
      speed: 3,
      type: 'shield',
    });

    engine.update();
    expect(engine.getState().player.isShielded).toBe(true);
  });

  it('should not die when shielded', () => {
    const state = engine.getState();
    state.player.isShielded = true;
    state.player.shieldTimer = 60;

    state.objects.push({
      id: 996,
      x: state.player.x,
      y: state.player.y,
      width: 30,
      height: 30,
      speed: 3,
      type: 'poop',
    });

    engine.update();
    expect(engine.getState().isGameOver).toBe(false);
  });

  it('should reset game', () => {
    for (let i = 0; i < 100; i++) engine.update();
    engine.reset();
    const state = engine.getState();
    expect(state.isGameOver).toBe(false);
    expect(state.elapsedFrames).toBe(0);
    expect(state.objects).toEqual([]);
    expect(state.starsCollected).toBe(0);
  });

  it('should not update after game over', () => {
    const state = engine.getState();
    state.isGameOver = true;
    const frames = state.elapsedFrames;
    engine.update();
    expect(engine.getState().elapsedFrames).toBe(frames);
  });

  it('should not move player after game over', () => {
    const state = engine.getState();
    state.isGameOver = true;
    const x = state.player.x;
    engine.movePlayer(x + 50);
    expect(engine.getState().player.x).toBe(x);
  });

  it('should track max combo', () => {
    const state = engine.getState();
    // Add 3 stars
    for (let i = 0; i < 3; i++) {
      state.objects.push({
        id: 900 + i,
        x: state.player.x,
        y: state.player.y,
        width: 24,
        height: 24,
        speed: 0.01,
        type: 'star',
      });
    }

    engine.update();
    expect(engine.getState().maxCombo).toBe(3);
    expect(engine.getState().combo).toBe(3);
  });

  it('should increase difficulty over time', () => {
    const initial = engine.getState().difficultyLevel;
    for (let i = 0; i < 600; i++) engine.update(); // 10 seconds
    expect(engine.getState().difficultyLevel).toBeGreaterThan(initial);
  });
});
