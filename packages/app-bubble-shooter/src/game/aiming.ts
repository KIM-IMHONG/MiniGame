import type { Point, GameConfig } from './types';
import { DEFAULT_CONFIG } from './types';

const MAX_ANGLE = Math.PI * 0.42; // 약 75도

/**
 * 터치 → 각도 계산
 */
export function calculateAngle(
  touchX: number,
  touchY: number,
  launcherX: number,
  launcherY: number,
): number {
  const dx = touchX - launcherX;
  const dy = touchY - launcherY;
  let angle = Math.atan2(dx, -dy);

  // 각도 제한
  angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, angle));
  return angle;
}

/**
 * 발사 경로 시뮬레이션 (벽 반사 포함)
 */
export function simulateTrajectory(
  startX: number,
  startY: number,
  angle: number,
  screenWidth: number,
  config: GameConfig = DEFAULT_CONFIG,
): Point[] {
  const speed = config.bubbleRadius * 0.8;
  let vx = Math.sin(angle) * speed;
  let vy = -Math.cos(angle) * speed;

  const points: Point[] = [];
  let x = startX;
  let y = startY;
  const r = config.bubbleRadius;

  for (let i = 0; i < 60; i++) {
    x += vx;
    y += vy;

    // 좌우 벽 반사
    if (x < r) {
      x = r;
      vx *= -1;
    } else if (x > screenWidth - r) {
      x = screenWidth - r;
      vx *= -1;
    }

    points.push({ x, y });

    // 천장 도달
    if (y < r) break;
  }

  return points;
}

/**
 * 조준선 점(도트) 위치 생성
 */
export function generateAimDots(
  startX: number,
  startY: number,
  angle: number,
  screenWidth: number,
  dotCount: number = 15,
  config: GameConfig = DEFAULT_CONFIG,
): Point[] {
  const trajectory = simulateTrajectory(startX, startY, angle, screenWidth, config);
  const step = Math.max(1, Math.floor(trajectory.length / dotCount));
  const dots: Point[] = [];

  for (let i = 0; i < trajectory.length && dots.length < dotCount; i += step) {
    dots.push(trajectory[i]);
  }

  return dots;
}

/**
 * 발사된 방울의 이동 시뮬레이션 (충돌 지점 찾기)
 */
export function findCollisionPoint(
  startX: number,
  startY: number,
  angle: number,
  screenWidth: number,
  occupiedPositions: Array<{ x: number; y: number }>,
  config: GameConfig = DEFAULT_CONFIG,
): Point {
  const speed = config.bubbleRadius * 0.8;
  let vx = Math.sin(angle) * speed;
  let vy = -Math.cos(angle) * speed;

  let x = startX;
  let y = startY;
  const r = config.bubbleRadius;
  const collisionDist = r * 2;

  for (let i = 0; i < 200; i++) {
    x += vx;
    y += vy;

    // 좌우 벽 반사
    if (x < r) {
      x = r;
      vx *= -1;
    } else if (x > screenWidth - r) {
      x = screenWidth - r;
      vx *= -1;
    }

    // 천장 도달
    if (y <= r) {
      return { x, y: r };
    }

    // 기존 방울과 충돌 체크
    for (const pos of occupiedPositions) {
      const dist = Math.hypot(x - pos.x, y - pos.y);
      if (dist < collisionDist) {
        // 충돌 직전 위치로
        return { x: x - vx, y: y - vy };
      }
    }
  }

  return { x, y };
}
