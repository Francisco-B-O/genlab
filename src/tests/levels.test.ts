import { describe, it, expect } from 'vitest';
import { LevelLoader, LEVEL_ORDER } from '../levels/LevelLoader';
import { VALID_CONNECTION_RULES, type EdgeType } from '../types/biology.types';
import { localize } from '../i18n';
import { pairSlotCount } from '../game/modes/logic';
import type { LevelData } from '../types/level.types';

const loader = new LevelLoader();

// Keys whose values are shown to the player and therefore need a Spanish variant
const TRANSLATABLE = new Set([
  'title', 'subtitle', 'objective', 'description', 'label', 'text', 'content',
  'summary', 'realWorldImpact', 'realWorldCase', 'scientificContext', 'reason',
  'productLabel', 'gameplaySimplifications',
]);
// Places where those key names are not player-facing prose
const SKIP_PATHS = [/^science\.references/, /^puzzle\.winCondition/, /^biologicalContext\.edges/];

function missingSpanish(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => missingSpanish(v, `${path}[${i}]`));
  if (value === null || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  const missing: string[] = [];
  for (const [key, v] of Object.entries(obj)) {
    const here = path ? `${path}.${key}` : key;
    if (SKIP_PATHS.some(re => re.test(here))) continue;
    if (TRANSLATABLE.has(key) && !(`${key}_es` in obj)) missing.push(here);
    if (!key.endsWith('_es')) missing.push(...missingSpanish(v, here));
  }
  return missing;
}

describe.each(LEVEL_ORDER)('level "%s"', (id) => {
  let level: LevelData;

  it('loads and passes schema and integrity checks', async () => {
    level = await loader.loadLevel(id);
    expect(level.id).toBe(id);
  });

  it('draws only connections allowed by the biology rules', async () => {
    level = await loader.loadLevel(id);
    const types = new Map(level.biologicalContext.nodes.map(n => [n.id, n.type]));
    for (const e of level.biologicalContext.edges) {
      const rule = VALID_CONNECTION_RULES[e.type as EdgeType];
      expect(rule, e.id).toBeDefined();
      expect(rule.sources, `${e.id} source`).toContain(types.get(e.source));
      expect(rule.targets, `${e.id} target`).toContain(types.get(e.target));
    }
  });

  it('only requires connections allowed by the biology rules', async () => {
    level = await loader.loadLevel(id);
    const types = new Map(level.biologicalContext.nodes.map(n => [n.id, n.type]));
    const all = [...level.puzzle.requiredConnections, ...level.puzzle.optionalConnections];
    for (const c of all) {
      const rule = VALID_CONNECTION_RULES[c.edgeType as EdgeType];
      expect(rule, c.id).toBeDefined();
      expect(rule.sources, `${c.id} source`).toContain(types.get(c.sourceId));
      expect(rule.targets, `${c.id} target`).toContain(types.get(c.targetId));
    }
  });

  it('wins exactly when every required connection is made', async () => {
    level = await loader.loadLevel(id);
    expect(new Set(level.puzzle.winCondition.requiredConnectionIds))
      .toEqual(new Set(level.puzzle.requiredConnections.map(r => r.id)));
  });

  it('places every available piece on the board', async () => {
    level = await loader.loadLevel(id);
    const nodes = new Map(level.biologicalContext.nodes.map(n => [n.id, n]));
    for (const nodeId of level.puzzle.availableNodes) {
      expect(nodes.get(nodeId)?.position, nodeId).toBeDefined();
    }
  });

  it('has a guide that points at real connections', async () => {
    level = await loader.loadLevel(id);
    const ids = new Set(level.puzzle.requiredConnections.map(r => r.id));
    for (const step of level.guide ?? []) {
      if (step.connectionId) expect(ids.has(step.connectionId), step.connectionId).toBe(true);
    }
  });

  it('has a Spanish version of every player-facing text', async () => {
    level = await loader.loadLevel(id);
    expect(missingSpanish(level)).toEqual([]);
    const raw = level as unknown as Record<string, unknown>;
    expect(localize(level, 'es').title).toBe(raw.title_es);
  });
});

describe('level registry', () => {
  it('summaries match the level files', async () => {
    for (const summary of loader.getAvailableLevels('en')) {
      const level = await loader.loadLevel(summary.id);
      expect(summary.title, summary.id).toBe(level.title);
      const mode = level.mode ?? 'pathway';
      expect(summary.mode, summary.id).toBe(mode);
      const expected =
        mode === 'construct' ? level.construct!.solution.length
        : mode === 'sequence' ? level.sequence!.steps.length
        : mode === 'inherit' ? level.inherit!.scenarios.length
        : mode === 'pairing' ? pairSlotCount(level.pairing!)
        : mode === 'pathway' ? level.puzzle.winCondition.requiredConnectionIds.length
        : 0;
      expect(summary.connections, summary.id).toBe(expected);
      expect(summary.difficulty, summary.id).toBe(level.difficulty);
    }
  });

  it('starts with the tutorial', () => {
    expect(LEVEL_ORDER[0]).toBe('tutorial');
  });
});
