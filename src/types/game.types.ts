// ============================================================
// Game State & Scoring Types
// ============================================================

export type GamePhase = 'menu' | 'story' | 'exploration' | 'puzzle' | 'simulation' | 'complete';

export interface ScoreBreakdown {
  base: number;
  bonusNoHints: number;
  bonusNoPenalties: number;
  bonusSpeed: number;
  bonusOptional: number;
  penalties: number;
  total: number;
}

export interface HintResult {
  level: 1 | 2 | 3;
  title: string;
  content: string;
  revealedNodes: string[];
  revealedConnections: string[];
  pointCost: number;
}

export interface UserPreferences {
  soundEnabled: boolean;
  musicEnabled: boolean;
  particleEffects: boolean;
  colorblindMode: boolean;
  language: string;
  tutorialCompleted: boolean;
}

export interface LevelProgress {
  completed: boolean;
  bestScore: number;
  hintsUsed: number;
  wrongConnections: number;
  completedAt?: string;
  timeElapsedSeconds?: number;
  achievementsEarned: string[];
}

export interface SaveData {
  completedLevels: Record<string, LevelProgress>;
  /** Story scenes the player has opened (a tool is unlocked by opening the scene that gives it). */
  storySeen: string[];
  preferences: UserPreferences;
  version: number;
  lastPlayedAt: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  soundEnabled: true,
  musicEnabled: true,
  particleEffects: true,
  colorblindMode: false,
  language: 'en',
  tutorialCompleted: false,
};

export const DEFAULT_SAVE_DATA: SaveData = {
  completedLevels: {},
  storySeen: [],
  preferences: DEFAULT_PREFERENCES,
  version: 1,
  lastPlayedAt: new Date().toISOString(),
};

export const BASE_SCORE_PER_REQUIRED_CONNECTION = 100;
export const BONUS_NO_HINTS = 300;
export const BONUS_NO_PENALTIES = 200;
export const BONUS_OPTIONAL_CONNECTION = 50;
export const PENALTY_WRONG_CONNECTION = -25;
export const PENALTY_HINT_LEVEL_1 = -50;
export const PENALTY_HINT_LEVEL_2 = -100;
export const PENALTY_HINT_LEVEL_3 = -150;
