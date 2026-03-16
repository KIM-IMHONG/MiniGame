import type { FallingObject, Player, GameConfig } from './types';
import { DEFAULT_CONFIG } from './types';
import { checkCollision, isOffScreen, clampX } from './collision';
import { calculateTotalScore } from './scoring';

export interface DodgePoopState {
  player: Player;
  objects: FallingObject[];
  score: number;
  starsCollected: number;
  combo: number;
  maxCombo: number;
  elapsedFrames: number;
  isGameOver: boolean;
  spawnTimer: number;
  difficultyLevel: number;
}

let nextObjectId = 0;

export class DodgePoopEngine {
  private state: DodgePoopState;
  private config: GameConfig;
  private onStateChange?: (state: DodgePoopState) => void;

  constructor(
    config: Partial<GameConfig> = {},
    onStateChange?: (state: DodgePoopState) => void,
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.onStateChange = onStateChange;
    nextObjectId = 0;
    this.state = this.createInitialState();
  }

  private createInitialState(): DodgePoopState {
    return {
      player: {
        x: this.config.screenWidth / 2 - this.config.playerWidth / 2,
        y: this.config.screenHeight * this.config.playerY,
        width: this.config.playerWidth,
        height: this.config.playerHeight,
        isShielded: false,
        shieldTimer: 0,
      },
      objects: [],
      score: 0,
      starsCollected: 0,
      combo: 0,
      maxCombo: 0,
      elapsedFrames: 0,
      isGameOver: false,
      spawnTimer: 0,
      difficultyLevel: 1,
    };
  }

  getState(): DodgePoopState {
    return this.state;
  }

  private emit(): void {
    this.onStateChange?.(this.state);
  }

  /**
   * 플레이어 이동
   */
  movePlayer(x: number): void {
    if (this.state.isGameOver) return;
    this.state.player.x = clampX(
      x - this.config.playerWidth / 2,
      this.config.playerWidth,
      this.config.screenWidth,
    );
  }

  /**
   * 게임 프레임 업데이트 (60fps 기준)
   */
  update(): void {
    if (this.state.isGameOver) return;

    this.state.elapsedFrames++;
    const elapsed = this.state.elapsedFrames / 60;

    // 난이도 상승
    this.state.difficultyLevel = 1 + elapsed * this.config.speedIncreaseRate;

    // 스폰 타이머
    this.state.spawnTimer++;
    const spawnInterval = Math.max(
      this.config.minSpawnInterval,
      this.config.initialSpawnInterval - elapsed * 10,
    );

    if (this.state.spawnTimer >= spawnInterval / (1000 / 60)) {
      this.spawnObject();
      this.state.spawnTimer = 0;
    }

    // 오브젝트 이동
    this.state.objects.forEach(obj => {
      obj.y += obj.speed;
    });

    // 쉴드 타이머
    if (this.state.player.isShielded) {
      this.state.player.shieldTimer--;
      if (this.state.player.shieldTimer <= 0) {
        this.state.player.isShielded = false;
      }
    }

    // 충돌 검사
    const player = this.state.player;
    const remaining: FallingObject[] = [];
    let hitPoop = false;

    for (const obj of this.state.objects) {
      if (isOffScreen(obj, this.config.screenHeight)) {
        if (obj.type === 'poop') {
          // 똥 피하면 콤보 리셋 없음 (별만 콤보에 영향)
        }
        continue;
      }

      if (checkCollision(player, obj)) {
        if (obj.type === 'poop') {
          if (player.isShielded) {
            // 쉴드로 방어
            continue;
          }
          hitPoop = true;
        } else if (obj.type === 'star') {
          this.state.starsCollected++;
          this.state.combo++;
          if (this.state.combo > this.state.maxCombo) {
            this.state.maxCombo = this.state.combo;
          }
          continue;
        } else if (obj.type === 'shield') {
          player.isShielded = true;
          player.shieldTimer = this.config.shieldDuration;
          continue;
        }
      }

      remaining.push(obj);
    }

    this.state.objects = remaining;

    if (hitPoop) {
      this.state.isGameOver = true;
      this.state.score = calculateTotalScore(
        elapsed,
        this.state.starsCollected,
        this.state.maxCombo,
      );
    } else {
      // 실시간 점수 업데이트
      this.state.score = calculateTotalScore(
        elapsed,
        this.state.starsCollected,
        this.state.maxCombo,
      );
    }

    this.emit();
  }

  private spawnObject(): void {
    const rand = Math.random();
    let type: FallingObject['type'] = 'poop';
    let size = this.config.poopSize;

    if (rand < this.config.shieldChance) {
      type = 'shield';
      size = this.config.itemSize;
    } else if (rand < this.config.shieldChance + this.config.starChance) {
      type = 'star';
      size = this.config.itemSize;
    }

    const speed = this.config.basePoopSpeed * this.state.difficultyLevel * (0.8 + Math.random() * 0.4);
    const x = Math.random() * (this.config.screenWidth - size);

    this.state.objects.push({
      id: nextObjectId++,
      x,
      y: -size,
      width: size,
      height: size,
      speed,
      type,
    });
  }

  /**
   * 게임 리셋
   */
  reset(): void {
    nextObjectId = 0;
    this.state = this.createInitialState();
    this.emit();
  }

  getConfig(): GameConfig {
    return this.config;
  }
}
