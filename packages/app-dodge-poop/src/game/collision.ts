export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * AABB 충돌 감지 (margin으로 히트박스 조정)
 */
export function checkCollision(a: Rect, b: Rect, margin: number = 4): boolean {
  return (
    a.x + margin < b.x + b.width - margin &&
    a.x + a.width - margin > b.x + margin &&
    a.y + margin < b.y + b.height - margin &&
    a.y + a.height - margin > b.y + margin
  );
}

/**
 * 화면 밖으로 나갔는지 확인
 */
export function isOffScreen(obj: Rect, screenHeight: number): boolean {
  return obj.y > screenHeight + obj.height;
}

/**
 * X 좌표 클램프
 */
export function clampX(x: number, width: number, screenWidth: number): number {
  return Math.max(0, Math.min(screenWidth - width, x));
}
