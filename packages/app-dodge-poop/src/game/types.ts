export interface Position {
  x: number;
  y: number;
}

export interface FallingObject {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'poop' | 'star' | 'shield';
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  isShielded: boolean;
  shieldTimer: number;
}

export interface GameConfig {
  screenWidth: number;
  screenHeight: number;
  playerWidth: number;
  playerHeight: number;
  poopSize: number;
  itemSize: number;
  initialSpawnInterval: number;  // ms
  minSpawnInterval: number;      // ms
  speedIncreaseRate: number;     // per second
  basePoopSpeed: number;
  starChance: number;            // 0-1
  shieldChance: number;          // 0-1
  shieldDuration: number;        // frames
  playerY: number;               // Y position ratio (0-1)
}

export const DEFAULT_CONFIG: GameConfig = {
  screenWidth: 375,
  screenHeight: 700,
  playerWidth: 40,
  playerHeight: 40,
  poopSize: 30,
  itemSize: 24,
  initialSpawnInterval: 800,
  minSpawnInterval: 300,
  speedIncreaseRate: 0.1,
  basePoopSpeed: 3,
  starChance: 0.1,
  shieldChance: 0.03,
  shieldDuration: 180, // ~3 seconds at 60fps
  playerY: 0.82,
};
