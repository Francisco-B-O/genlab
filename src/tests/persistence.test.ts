import { describe, it, expect, beforeEach } from 'vitest';

// Mock localStorage for the node test environment before importing the module
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};

// @ts-expect-error — setting global for node test environment
globalThis.localStorage = localStorageMock;

// Import AFTER patching localStorage
import { PersistenceManager } from '../utils/persistence';

describe('Persistence', () => {
  let pm: PersistenceManager;

  beforeEach(() => {
    localStorageMock.clear();
    pm = new PersistenceManager();
  });

  it('reports level as not completed before any save', () => {
    expect(pm.isLevelCompleted('test-level-xyz')).toBe(false);
  });

  it('returns 0 as best score for new level', () => {
    expect(pm.getBestScore('test-level-xyz')).toBe(0);
  });

  it('saves and retrieves level progress', () => {
    pm.saveLevelProgress('test-save-level', {
      completed: true,
      bestScore: 1500,
      hintsUsed: 1,
      wrongConnections: 2,
      completedAt: new Date().toISOString(),
      achievementsEarned: ['ach_speed'],
    });
    expect(pm.isLevelCompleted('test-save-level')).toBe(true);
    expect(pm.getBestScore('test-save-level')).toBe(1500);
  });

  it('preserves best score across multiple saves', () => {
    pm.saveLevelProgress('ml', {
      completed: true,
      bestScore: 800,
      hintsUsed: 0,
      wrongConnections: 0,
      completedAt: new Date().toISOString(),
      achievementsEarned: [],
    });
    pm.saveLevelProgress('ml', {
      completed: true,
      bestScore: 1200,
      hintsUsed: 1,
      wrongConnections: 0,
      completedAt: new Date().toISOString(),
      achievementsEarned: [],
    });
    expect(pm.getBestScore('ml')).toBe(1200);
  });

  it('keeps lower score if new save has lower score', () => {
    pm.saveLevelProgress('ml2', {
      completed: true,
      bestScore: 2000,
      hintsUsed: 0,
      wrongConnections: 0,
      completedAt: new Date().toISOString(),
      achievementsEarned: [],
    });
    pm.saveLevelProgress('ml2', {
      completed: true,
      bestScore: 500,
      hintsUsed: 2,
      wrongConnections: 3,
      completedAt: new Date().toISOString(),
      achievementsEarned: [],
    });
    expect(pm.getBestScore('ml2')).toBe(2000);
  });

  it('save/load cycle via serialization is consistent', () => {
    pm.saveLevelProgress('export-test', {
      completed: true,
      bestScore: 999,
      hintsUsed: 0,
      wrongConnections: 0,
      completedAt: '2026-01-01T00:00:00.000Z',
      achievementsEarned: ['ach_no_hints'],
    });
    const exported = pm.export();
    const parsed = JSON.parse(exported) as { completedLevels: Record<string, { bestScore: number }> };
    expect(parsed.completedLevels['export-test']?.bestScore).toBe(999);
  });
});
