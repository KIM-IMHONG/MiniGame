import Matter from 'matter-js';

export type CollisionCallback = (
  bodyA: Matter.Body,
  bodyB: Matter.Body,
) => void;

export interface CollisionRule {
  labelA: string;
  labelB: string;
  callback: CollisionCallback;
}

export class CollisionManager {
  private rules: CollisionRule[] = [];
  private engine: Matter.Engine;
  private eventHandler: ((event: Matter.IEventCollision<Matter.Engine>) => void) | null = null;

  constructor(engine: Matter.Engine) {
    this.engine = engine;
    this.startListening();
  }

  addRule(labelA: string, labelB: string, callback: CollisionCallback): () => void {
    const rule: CollisionRule = { labelA, labelB, callback };
    this.rules.push(rule);

    return () => {
      this.rules = this.rules.filter((r) => r !== rule);
    };
  }

  private startListening(): void {
    this.eventHandler = (event) => {
      const pairs = event.pairs;
      for (const pair of pairs) {
        const { bodyA, bodyB } = pair;
        for (const rule of this.rules) {
          if (
            (bodyA.label === rule.labelA && bodyB.label === rule.labelB) ||
            (bodyA.label === rule.labelB && bodyB.label === rule.labelA)
          ) {
            const a = bodyA.label === rule.labelA ? bodyA : bodyB;
            const b = bodyA.label === rule.labelA ? bodyB : bodyA;
            rule.callback(a, b);
          }
        }
      }
    };

    Matter.Events.on(this.engine, 'collisionStart', this.eventHandler);
  }

  cleanup(): void {
    if (this.eventHandler) {
      Matter.Events.off(this.engine, 'collisionStart', this.eventHandler);
      this.eventHandler = null;
    }
    this.rules = [];
  }

  getRuleCount(): number {
    return this.rules.length;
  }
}
