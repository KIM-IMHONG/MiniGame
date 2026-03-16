import Matter from 'matter-js';

export interface PhysicsWorldConfig {
  gravity?: { x: number; y: number };
  width: number;
  height: number;
  enableWalls?: boolean;
}

export interface PhysicsWorldInstance {
  engine: Matter.Engine;
  world: Matter.World;
  cleanup: () => void;
  addBody: (body: Matter.Body) => void;
  removeBody: (body: Matter.Body) => void;
  update: (delta?: number) => void;
}

export function createPhysicsWorld(config: PhysicsWorldConfig): PhysicsWorldInstance {
  const {
    gravity = { x: 0, y: 1 },
    width,
    height,
    enableWalls = true,
  } = config;

  const engine = Matter.Engine.create({
    gravity: { x: gravity.x, y: gravity.y, scale: 0.001 },
  });

  const { world } = engine;

  const wallBodies: Matter.Body[] = [];

  if (enableWalls) {
    const wallThickness = 50;
    const walls = [
      // 바닥
      Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, { isStatic: true, label: 'wall-bottom' }),
      // 천장
      Matter.Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, { isStatic: true, label: 'wall-top' }),
      // 왼쪽
      Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true, label: 'wall-left' }),
      // 오른쪽
      Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true, label: 'wall-right' }),
    ];

    wallBodies.push(...walls);
    Matter.Composite.add(world, walls);
  }

  return {
    engine,
    world,
    addBody: (body: Matter.Body) => Matter.Composite.add(world, body),
    removeBody: (body: Matter.Body) => Matter.Composite.remove(world, body),
    update: (delta = 1000 / 60) => Matter.Engine.update(engine, delta),
    cleanup: () => {
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    },
  };
}
