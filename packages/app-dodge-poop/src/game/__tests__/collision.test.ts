import { checkCollision, isOffScreen, clampX } from '../collision';

describe('checkCollision', () => {
  it('should detect overlapping rectangles', () => {
    const a = { x: 0, y: 0, width: 20, height: 20 };
    const b = { x: 10, y: 10, width: 20, height: 20 };
    expect(checkCollision(a, b, 0)).toBe(true);
  });

  it('should not detect non-overlapping rectangles', () => {
    const a = { x: 0, y: 0, width: 20, height: 20 };
    const b = { x: 30, y: 30, width: 20, height: 20 };
    expect(checkCollision(a, b)).toBe(false);
  });

  it('should handle margin for hitbox reduction', () => {
    const a = { x: 0, y: 0, width: 20, height: 20 };
    const b = { x: 15, y: 15, width: 20, height: 20 };
    // With margin=4, effective a becomes (4,4)-(16,16), b becomes (19,19)-(31,31) — no overlap
    expect(checkCollision(a, b, 4)).toBe(false);
    // With margin=0, they overlap
    expect(checkCollision(a, b, 0)).toBe(true);
  });

  it('should detect exact touching as no collision with margin', () => {
    const a = { x: 0, y: 0, width: 20, height: 20 };
    const b = { x: 20, y: 0, width: 20, height: 20 };
    expect(checkCollision(a, b, 0)).toBe(false);
  });
});

describe('isOffScreen', () => {
  it('should return true when object is below screen', () => {
    expect(isOffScreen({ x: 0, y: 831, width: 30, height: 30 }, 800)).toBe(true);
  });

  it('should return false when object is on screen', () => {
    expect(isOffScreen({ x: 0, y: 500, width: 30, height: 30 }, 800)).toBe(false);
  });

  it('should return false when object is partially visible', () => {
    expect(isOffScreen({ x: 0, y: 790, width: 30, height: 30 }, 800)).toBe(false);
  });
});

describe('clampX', () => {
  it('should clamp within screen bounds', () => {
    expect(clampX(-10, 40, 375)).toBe(0);
    expect(clampX(400, 40, 375)).toBe(335);
    expect(clampX(100, 40, 375)).toBe(100);
  });
});
