import { describe, it, expect, beforeAll } from 'vitest';
import goldenRiceRaw from '../data/levels/golden-rice.json';
import { LevelLoader } from '../levels/LevelLoader';

describe('Level Loader — golden-rice.json', () => {
  let loader: LevelLoader;

  beforeAll(() => {
    loader = new LevelLoader();
  });

  it('has required top-level fields', () => {
    const level = goldenRiceRaw as Record<string, unknown>;
    expect(level.id).toBe('golden-rice');
    expect(level.title).toBeTruthy();
    expect(level.objective).toBeTruthy();
    expect(level.organism).toBeTruthy();
    expect(level.biologicalContext).toBeTruthy();
    expect(level.puzzle).toBeTruthy();
    expect(level.simulation).toBeTruthy();
    expect(level.hints).toBeTruthy();
    expect(level.completion).toBeTruthy();
    expect(level.science).toBeTruthy();
  });

  it('loads and validates without throwing', () => {
    expect(() => loader.validateLevel(goldenRiceRaw)).not.toThrow();
  });

  it('all puzzle nodes exist in biologicalContext.nodes', () => {
    const level = loader.validateLevel(goldenRiceRaw);
    const nodeIds = new Set(level.biologicalContext.nodes.map(n => n.id));
    for (const nodeId of level.puzzle.availableNodes) {
      expect(nodeIds.has(nodeId), `Missing node: ${nodeId}`).toBe(true);
    }
  });

  it('all required connections reference valid nodes', () => {
    const level = loader.validateLevel(goldenRiceRaw);
    const nodeIds = new Set(level.biologicalContext.nodes.map(n => n.id));
    for (const rc of level.puzzle.requiredConnections) {
      expect(nodeIds.has(rc.sourceId), `Invalid source: ${rc.sourceId} in ${rc.id}`).toBe(true);
      expect(nodeIds.has(rc.targetId), `Invalid target: ${rc.targetId} in ${rc.id}`).toBe(true);
    }
  });

  it('win condition IDs all match requiredConnections IDs', () => {
    const level = loader.validateLevel(goldenRiceRaw);
    const reqIds = new Set(level.puzzle.requiredConnections.map(rc => rc.id));
    for (const winId of level.puzzle.winCondition.requiredConnectionIds) {
      expect(reqIds.has(winId), `Win condition ID not found in requiredConnections: ${winId}`).toBe(true);
    }
  });

  it('has at least one hint', () => {
    const level = loader.validateLevel(goldenRiceRaw);
    expect(level.hints.length).toBeGreaterThan(0);
  });

  it('has science references', () => {
    const level = loader.validateLevel(goldenRiceRaw);
    expect(level.science.references.length).toBeGreaterThan(0);
  });

  it('has distractor nodes labelled correctly', () => {
    const level = loader.validateLevel(goldenRiceRaw);
    const distractorSet = new Set(level.puzzle.distractorNodes);
    for (const nodeId of distractorSet) {
      const node = level.biologicalContext.nodes.find(n => n.id === nodeId);
      expect(node, `Distractor node not found: ${nodeId}`).toBeTruthy();
      expect(node!.isDistractor).toBe(true);
    }
  });
});
