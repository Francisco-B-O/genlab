import type { SaveData, LevelProgress, UserPreferences } from '../types/game.types';
import { DEFAULT_SAVE_DATA } from '../types/game.types';

// The key keeps the game's first name so saved progress survives the rename
const SAVE_KEY = 'biogen_save';
const SAVE_VERSION = 1;

export class PersistenceManager {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { ...DEFAULT_SAVE_DATA };

      const parsed = JSON.parse(raw) as Partial<SaveData>;

      // Version migration
      if (!parsed.version || parsed.version < SAVE_VERSION) {
        console.info('[PersistenceManager] Save data migration: resetting to defaults');
        return { ...DEFAULT_SAVE_DATA };
      }

      return {
        ...DEFAULT_SAVE_DATA,
        ...parsed,
        preferences: { ...DEFAULT_SAVE_DATA.preferences, ...(parsed.preferences ?? {}) },
      };
    } catch {
      return { ...DEFAULT_SAVE_DATA };
    }
  }

  private save(): void {
    try {
      this.data.lastPlayedAt = new Date().toISOString();
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (err) {
      console.error('[PersistenceManager] Failed to save:', err);
    }
  }

  getLevelProgress(levelId: string): LevelProgress | null {
    return this.data.completedLevels[levelId] ?? null;
  }

  saveLevelProgress(levelId: string, progress: LevelProgress): void {
    const existing = this.data.completedLevels[levelId];
    const merged: LevelProgress = {
      ...progress,
      bestScore: Math.max(progress.bestScore, existing?.bestScore ?? 0),
      achievementsEarned: [
        ...new Set([...(existing?.achievementsEarned ?? []), ...progress.achievementsEarned]),
      ],
    };
    this.data.completedLevels[levelId] = merged;
    this.save();
  }

  getPreferences(): UserPreferences {
    return { ...this.data.preferences };
  }

  updatePreferences(partial: Partial<UserPreferences>): void {
    this.data.preferences = { ...this.data.preferences, ...partial };
    this.save();
  }

  isLevelCompleted(levelId: string): boolean {
    return this.data.completedLevels[levelId]?.completed ?? false;
  }

  getBestScore(levelId: string): number {
    return this.data.completedLevels[levelId]?.bestScore ?? 0;
  }

  getStorySeen(): string[] {
    return [...(this.data.storySeen ?? [])];
  }

  markStorySeen(sceneId: string): void {
    const seen = this.data.storySeen ?? [];
    if (seen.includes(sceneId)) return;
    this.data.storySeen = [...seen, sceneId];
    this.save();
  }

  isTutorialCompleted(): boolean {
    return this.data.preferences.tutorialCompleted ?? false;
  }

  markTutorialCompleted(): void {
    this.data.preferences = { ...this.data.preferences, tutorialCompleted: true };
    this.save();
  }

  clearAllData(): void {
    localStorage.removeItem(SAVE_KEY);
    this.data = { ...DEFAULT_SAVE_DATA };
  }

  export(): string {
    return JSON.stringify(this.data, null, 2);
  }
}

export const persistence = new PersistenceManager();
