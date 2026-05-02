// src/type.ts

export type Scene = 'TITLE' | 'PLAYING' | 'CLEAR' | 'GAMEOVER';

// ここに export が付いているか確認！
export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

export interface GameConfig {
  cols: number;
  rows: number;
  timeLimit: number;
}

export const DIFFICULTY_SETTINGS: Record<Difficulty, GameConfig> = {
  EASY:   { cols: 3, rows: 2, timeLimit: 60 },
  NORMAL: { cols: 4, rows: 3, timeLimit: 45 },
  HARD:   { cols: 6, rows: 4, timeLimit: 30 }
};

export interface Piece {
  id: number;
  x: number; y: number;
  correctX: number; correctY: number;
  width: number; height: number;
  vx: number; vy: number;
  isLocked: boolean;
}