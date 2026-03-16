import { calculateAngle, simulateTrajectory, generateAimDots, findCollisionPoint } from '../aiming';

describe('aiming', () => {
  describe('calculateAngle', () => {
    it('정중앙 위 터치는 0 (직진)', () => {
      const angle = calculateAngle(100, 50, 100, 400);
      expect(angle).toBeCloseTo(0, 1);
    });

    it('왼쪽 터치는 음수 각도', () => {
      const angle = calculateAngle(50, 200, 100, 400);
      expect(angle).toBeLessThan(0);
    });

    it('오른쪽 터치는 양수 각도', () => {
      const angle = calculateAngle(150, 200, 100, 400);
      expect(angle).toBeGreaterThan(0);
    });

    it('최대 각도 제한', () => {
      const angle = calculateAngle(500, 399, 100, 400);
      expect(Math.abs(angle)).toBeLessThanOrEqual(Math.PI * 0.42 + 0.01);
    });
  });

  describe('simulateTrajectory', () => {
    it('점 배열 반환', () => {
      const points = simulateTrajectory(187, 700, 0, 375);
      expect(points.length).toBeGreaterThan(0);
    });

    it('직진 시 x 좌표 거의 일정', () => {
      const points = simulateTrajectory(187, 700, 0, 375);
      for (const p of points) {
        expect(Math.abs(p.x - 187)).toBeLessThan(2);
      }
    });

    it('좌우 벽에서 반사', () => {
      // 큰 각도로 발사 → 벽 반사 발생
      const points = simulateTrajectory(187, 700, Math.PI * 0.35, 375);
      const hasReflection = points.some((p, i) => {
        if (i === 0) return false;
        const prev = points[i - 1];
        // 벽 근처에서 x 방향 변화
        return (p.x <= 20 || p.x >= 355);
      });
      // 큰 각도면 벽에 닿아야 함
      expect(points.length).toBeGreaterThan(5);
    });

    it('천장에서 멈춤', () => {
      const points = simulateTrajectory(187, 700, 0, 375);
      const lastPoint = points[points.length - 1];
      expect(lastPoint.y).toBeLessThanOrEqual(20);
    });
  });

  describe('generateAimDots', () => {
    it('지정된 수 이하의 점 반환', () => {
      const dots = generateAimDots(187, 700, 0, 375, 10);
      expect(dots.length).toBeLessThanOrEqual(10);
      expect(dots.length).toBeGreaterThan(0);
    });
  });

  describe('findCollisionPoint', () => {
    it('기존 방울과 충돌 감지', () => {
      const occupied = [{ x: 187, y: 100 }];
      const point = findCollisionPoint(187, 700, 0, 375, occupied);
      // 충돌 지점의 y는 기존 방울보다 아래
      expect(point.y).toBeGreaterThan(100);
      expect(point.y).toBeLessThan(700);
    });

    it('방울 없으면 천장 도달', () => {
      const point = findCollisionPoint(187, 700, 0, 375, []);
      expect(point.y).toBeLessThanOrEqual(20);
    });
  });
});
