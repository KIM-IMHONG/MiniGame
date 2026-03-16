import Matter from 'matter-js';
import { createPhysicsWorld } from '../PhysicsWorld';

describe('PhysicsWorld', () => {
  it('엔진과 월드 생성', () => {
    const pw = createPhysicsWorld({ width: 375, height: 812 });
    expect(pw.engine).toBeDefined();
    expect(pw.world).toBeDefined();
    pw.cleanup();
  });

  it('커스텀 중력 설정', () => {
    const pw = createPhysicsWorld({
      width: 375,
      height: 812,
      gravity: { x: 0, y: 2 },
    });
    expect(pw.engine.gravity.y).toBe(2);
    pw.cleanup();
  });

  it('벽 생성 (enableWalls: true)', () => {
    const pw = createPhysicsWorld({ width: 375, height: 812, enableWalls: true });
    const bodies = Matter.Composite.allBodies(pw.world);
    const walls = bodies.filter((b) => b.label.startsWith('wall-'));
    expect(walls.length).toBe(4);
    pw.cleanup();
  });

  it('벽 없음 (enableWalls: false)', () => {
    const pw = createPhysicsWorld({ width: 375, height: 812, enableWalls: false });
    const bodies = Matter.Composite.allBodies(pw.world);
    expect(bodies.length).toBe(0);
    pw.cleanup();
  });

  it('바디 추가/제거', () => {
    const pw = createPhysicsWorld({ width: 375, height: 812, enableWalls: false });
    const ball = Matter.Bodies.circle(100, 100, 20, { label: 'ball' });

    pw.addBody(ball);
    expect(Matter.Composite.allBodies(pw.world)).toContain(ball);

    pw.removeBody(ball);
    expect(Matter.Composite.allBodies(pw.world)).not.toContain(ball);

    pw.cleanup();
  });

  it('update로 물리 시뮬레이션 진행', () => {
    const pw = createPhysicsWorld({ width: 375, height: 812, enableWalls: false });
    const ball = Matter.Bodies.circle(100, 0, 20, { label: 'ball' });
    pw.addBody(ball);

    const initialY = ball.position.y;
    // 여러 프레임 업데이트 (중력으로 떨어짐)
    for (let i = 0; i < 60; i++) {
      pw.update();
    }
    expect(ball.position.y).toBeGreaterThan(initialY);

    pw.cleanup();
  });

  it('cleanup으로 정리', () => {
    const pw = createPhysicsWorld({ width: 375, height: 812, enableWalls: true });
    pw.cleanup();
    // cleanup 후에도 에러 없음
    expect(Matter.Composite.allBodies(pw.world).length).toBe(0);
  });
});
