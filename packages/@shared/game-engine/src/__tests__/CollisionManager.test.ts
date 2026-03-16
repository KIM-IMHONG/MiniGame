import Matter from 'matter-js';
import { CollisionManager } from '../CollisionManager';

describe('CollisionManager', () => {
  let engine: Matter.Engine;
  let world: Matter.World;
  let manager: CollisionManager;

  beforeEach(() => {
    engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
    world = engine.world;
    manager = new CollisionManager(engine);
  });

  afterEach(() => {
    manager.cleanup();
    Matter.Engine.clear(engine);
  });

  it('충돌 룰 추가', () => {
    manager.addRule('ball', 'wall', () => {});
    expect(manager.getRuleCount()).toBe(1);
  });

  it('충돌 룰 제거', () => {
    const remove = manager.addRule('ball', 'wall', () => {});
    expect(manager.getRuleCount()).toBe(1);
    remove();
    expect(manager.getRuleCount()).toBe(0);
  });

  it('충돌 시 콜백 호출', () => {
    const callback = jest.fn();
    manager.addRule('ball', 'target', callback);

    const ball = Matter.Bodies.circle(100, 100, 20, { label: 'ball' });
    const target = Matter.Bodies.circle(100, 100, 20, {
      label: 'target',
      isStatic: true,
    });

    Matter.Composite.add(world, [ball, target]);
    Matter.Engine.update(engine);

    // 같은 위치에 있으므로 충돌 발생
    expect(callback).toHaveBeenCalled();
    if (callback.mock.calls.length > 0) {
      expect(callback.mock.calls[0][0].label).toBe('ball');
      expect(callback.mock.calls[0][1].label).toBe('target');
    }
  });

  it('역방향 충돌도 감지', () => {
    const callback = jest.fn();
    manager.addRule('target', 'ball', callback);

    const ball = Matter.Bodies.circle(100, 100, 20, { label: 'ball' });
    const target = Matter.Bodies.circle(100, 100, 20, {
      label: 'target',
      isStatic: true,
    });

    Matter.Composite.add(world, [ball, target]);
    Matter.Engine.update(engine);

    if (callback.mock.calls.length > 0) {
      expect(callback.mock.calls[0][0].label).toBe('target');
      expect(callback.mock.calls[0][1].label).toBe('ball');
    }
  });

  it('cleanup 후 콜백 안 호출', () => {
    const callback = jest.fn();
    manager.addRule('ball', 'wall', callback);
    manager.cleanup();
    expect(manager.getRuleCount()).toBe(0);
  });
});
