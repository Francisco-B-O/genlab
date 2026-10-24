import { describe, it, expect, beforeEach } from 'vitest';
import { PuzzleEngine } from '../game/PuzzleEngine';
import { BiologicalGraph } from '../biology/BiologicalGraph';
import type { LevelData } from '../types/level.types';
import type { BiologicalNode } from '../types/biology.types';

const makeNode = (id: string, type: BiologicalNode['type']): BiologicalNode => ({
  id,
  type,
  label: id,
  description: `Test: ${id}`,
  isDistractor: false,
  metadata: {},
});

// Minimal level fixture for testing
const buildMinimalLevel = (): LevelData => ({
  id: 'test-level',
  title: 'Test Level',
  subtitle: 'Unit test level',
  difficulty: 'beginner',
  estimatedDuration: 5,
  objective: 'Connect gene to enzyme',
  description: 'Test level for unit tests',
  organism: {
    id: 'test-org',
    commonName: 'Test Organism',
    scientificName: 'Testus testicus',
    taxonomy: [],
    targetTissue: 'leaf',
    targetOrganelle: 'plastid',
    description: 'Test organism',
  },
  biologicalContext: {
    pathwayDescription: 'Test pathway',
    nodes: [
      makeNode('gene_a', 'gene'),
      makeNode('enzyme_a', 'enzyme'),
      makeNode('rxn_a', 'reaction'),
      makeNode('met_a', 'metabolite'),
    ],
    edges: [],
  },
  puzzle: {
    availableNodes: ['gene_a', 'enzyme_a', 'rxn_a', 'met_a'],
    distractorNodes: [],
    requiredConnections: [
      {
        id: 'req_1',
        sourceId: 'gene_a',
        targetId: 'enzyme_a',
        edgeType: 'encodes',
        description: 'gene encodes enzyme',
        pointValue: 100,
      },
      {
        id: 'req_2',
        sourceId: 'enzyme_a',
        targetId: 'rxn_a',
        edgeType: 'catalyzes',
        description: 'enzyme catalyzes reaction',
        pointValue: 100,
      },
    ],
    optionalConnections: [],
    invalidConnections: [],
    winCondition: {
      type: 'pathway_complete',
      targetNodeId: 'met_a',
      requiredConnectionIds: ['req_1', 'req_2'],
      description: 'Complete pathway',
    },
  },
  simulation: {
    steps: [],
    variables: [],
  },
  hints: [
    {
      level: 1,
      title: 'Hint 1',
      content: 'Connect the gene to the enzyme.',
      revealedNodes: [],
      revealedConnections: [],
      pointCost: 50,
    },
  ],
  completion: {
    title: 'Complete!',
    summary: 'You did it.',
    realWorldImpact: 'Great job.',
    achievements: [],
  },
  science: {
    organism: 'Test organism',
    realWorldCase: 'Test case description that is long enough to pass validation checks.',
    scientificContext: 'Test context description for unit testing purposes.',
    gameplaySimplifications: ['Simplified for testing.'],
    fictionalVisualElements: ['None for testing.'],
    references: [],
  },
});

describe('PuzzleEngine', () => {
  let graph: BiologicalGraph;
  let engine: PuzzleEngine;
  let level: LevelData;

  beforeEach(() => {
    level = buildMinimalLevel();
    graph = new BiologicalGraph();
    for (const node of level.biologicalContext.nodes) {
      graph.addNode(node);
    }
    engine = new PuzzleEngine(level, graph);
  });

  // ─── Connection management ─────────────────────────────────

  it('accepts a correct required connection', () => {
    const result = engine.connectNodes('gene_a', 'enzyme_a', 'encodes');
    expect(result.success).toBe(true);
    expect(result.isCorrect).toBe(true);
    expect(result.pointsEarned).toBeGreaterThan(0);
  });

  it('rejects an invalid connection', () => {
    // gene→metabolite via "encodes" is invalid (encodes only targets enzyme/protein)
    const result = engine.connectNodes('gene_a', 'met_a', 'encodes');
    expect(result.success).toBe(false);
    expect(result.isCorrect).toBe(false);
  });

  it('tracks satisfied required connection count', () => {
    engine.connectNodes('gene_a', 'enzyme_a', 'encodes');
    const state = engine.getState();
    expect(state.satisfiedRequiredIds.has('req_1')).toBe(true);
    expect(state.satisfiedRequiredIds.size).toBe(1);
  });

  it('detects puzzle complete after all required connections', () => {
    engine.connectNodes('gene_a', 'enzyme_a', 'encodes');
    engine.connectNodes('enzyme_a', 'rxn_a', 'catalyzes');
    const state = engine.getState();
    expect(state.isComplete).toBe(true);
  });

  it('tracks wrong connections', () => {
    // Semantically valid but not required: enzyme→reaction catalyzes is valid,
    // but gene→met via influences is invalid (wrong type for source).
    // Actually let's do a valid but non-required connection: add a node first.
    // For minimal test, let's try gene_a → rxn_a (encodes): invalid target
    engine.connectNodes('gene_a', 'met_a', 'influences');
    const state = engine.getState();
    // gene→met via influences: sources for influences are metabolite,protein,enzyme,phenotype
    // gene is not valid source for influences — so this should fail/increment wrong count
    expect(state.wrongConnectionCount).toBeGreaterThan(0);
  });

  // ─── Hint system ─────────────────────────────────────────────

  it('returns hint content for level 1', () => {
    const hint = engine.getHint(1);
    expect(hint.level).toBe(1);
    expect(hint.content).toBeTruthy();
    expect(hint.content).toContain('gene');
  });

  it('returns placeholder when hint level not defined', () => {
    const hint = engine.getHint(3);
    expect(hint.title).toBe('No Hint Available');
  });

  it('tracks hints used', () => {
    engine.getHint(1);
    expect(engine.getHintsUsedCount()).toBe(1);
  });

  // ─── Scoring ─────────────────────────────────────────────────

  it('score increases with correct connections', () => {
    const before = engine.getScore().total;
    engine.connectNodes('gene_a', 'enzyme_a', 'encodes');
    const after = engine.getScore().total;
    expect(after).toBeGreaterThan(before);
  });

  it('score base reflects satisfied connections', () => {
    engine.connectNodes('gene_a', 'enzyme_a', 'encodes');
    const score = engine.getScore();
    expect(score.base).toBeGreaterThan(0);
  });

  it('starts at zero, with no bonuses before the level is complete', () => {
    expect(engine.getScore().total).toBe(0);
    engine.connectNodes('gene_a', 'enzyme_a', 'encodes');
    const score = engine.getScore();
    expect(score.bonusNoHints + score.bonusNoPenalties + score.bonusSpeed).toBe(0);
    expect(score.total).toBe(100);
  });

  it('charges hints even when the score is zero', () => {
    engine.getHint(1);
    expect(engine.getScore().total).toBe(-50);
  });

  it('charges mistakes even when the score is zero', () => {
    engine.connectNodes('gene_a', 'rxn_a', 'catalyzes');
    expect(engine.getScore().total).toBeLessThan(0);
  });

  it('awards the end-of-level bonuses once the pathway is complete', () => {
    engine.connectNodes('gene_a', 'enzyme_a', 'encodes');
    engine.connectNodes('enzyme_a', 'rxn_a', 'catalyzes');
    const score = engine.getScore();
    expect(score.bonusNoHints).toBeGreaterThan(0);
    expect(score.bonusNoPenalties).toBeGreaterThan(0);
    expect(score.bonusSpeed).toBeGreaterThan(0);
  });

  it('loses the no-hints bonus when a hint was used', () => {
    engine.getHint(1);
    engine.connectNodes('gene_a', 'enzyme_a', 'encodes');
    engine.connectNodes('enzyme_a', 'rxn_a', 'catalyzes');
    const score = engine.getScore();
    expect(score.bonusNoHints).toBe(0);
    expect(score.penalties).toBe(-50);
  });

  // ─── Reset ─────────────────────────────────────────────────

  it('resets state to initial values', () => {
    engine.connectNodes('gene_a', 'enzyme_a', 'encodes');
    engine.reset();
    const state = engine.getState();
    expect(state.satisfiedRequiredIds.size).toBe(0);
    expect(state.wrongConnectionCount).toBe(0);
    expect(state.isComplete).toBe(false);
  });
});
