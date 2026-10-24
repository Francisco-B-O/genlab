import { describe, it, expect } from 'vitest';
import { LevelLoader, LEVEL_ORDER } from '../levels/LevelLoader';
import { levelMode } from '../game/GameStore';
import type { LevelData } from '../types/level.types';

const loader = new LevelLoader();
const load = (id: string): Promise<LevelData> => loader.loadLevel(id);

const ids = async (mode: 'construct' | 'diagnose') => {
  const out: string[] = [];
  for (const id of LEVEL_ORDER) {
    if (levelMode(await load(id)) === mode) out.push(id);
  }
  return out;
};

describe('construct levels', async () => {
  const construct = await ids('construct');

  it('exist', () => expect(construct.length).toBeGreaterThan(0));

  it.each(construct)('%s: solution uses real parts in a valid reading order', async (id) => {
    const def = (await load(id)).construct!;
    const parts = new Map(def.parts.map(p => [p.id, p]));
    expect(new Set(def.solution).size, 'no part is used twice').toBe(def.solution.length);
    def.solution.forEach(partId => expect(parts.has(partId), partId).toBe(true));

    const kinds = def.solution.map(partId => parts.get(partId)!.kind);
    expect(kinds[0]).toBe('promoter');
    expect(kinds[kinds.length - 1]).toBe('terminator');
    // The gene comes after any signal or ribosome site, never before the promoter
    expect(kinds.indexOf('gene')).toBeGreaterThan(kinds.indexOf('promoter'));
    if (kinds.includes('signal')) expect(kinds.indexOf('signal')).toBeLessThan(kinds.indexOf('gene'));
    if (kinds.includes('rbs')) expect(kinds.indexOf('rbs')).toBeLessThan(kinds.indexOf('gene'));
  });

  it.each(construct)('%s: has tempting wrong parts that explain themselves', async (id) => {
    const def = (await load(id)).construct!;
    const wrong = def.parts.filter(p => !def.solution.includes(p.id));
    expect(wrong.length).toBeGreaterThanOrEqual(2);
    wrong.forEach(p => expect(p.wrongReason, p.id).toBeTruthy());
  });

  it.each(construct)('%s: part ids are unique', async (id) => {
    const def = (await load(id)).construct!;
    expect(new Set(def.parts.map(p => p.id)).size).toBe(def.parts.length);
  });
});

describe('diagnose levels', async () => {
  const diagnose = await ids('diagnose');

  it('exist', () => expect(diagnose.length).toBeGreaterThan(0));

  it.each(diagnose)('%s: faulty pieces exist and every piece has a note', async (id) => {
    const level = await load(id);
    const def = level.diagnose!;
    const nodeIds = new Set(level.biologicalContext.nodes.map(n => n.id));
    expect(def.faultyIds.length).toBeGreaterThan(0);
    def.faultyIds.forEach(f => expect(nodeIds.has(f), f).toBe(true));
    nodeIds.forEach(n => expect(def.notes[n]?.text, n).toBeTruthy());
  });

  it.each(diagnose)('%s: exactly one correct treatment, with reasons for the rest', async (id) => {
    const def = (await load(id)).diagnose!;
    expect(def.fixes.filter(f => f.correct)).toHaveLength(1);
    expect(def.fixes.length).toBeGreaterThanOrEqual(3);
    expect(new Set(def.fixes.map(f => f.id)).size).toBe(def.fixes.length);
    def.fixes.forEach(f => expect(f.reason, f.id).toBeTruthy());
  });

  it.each(diagnose)('%s: the pathway is drawn with real pieces', async (id) => {
    const level = await load(id);
    const nodeIds = new Set(level.biologicalContext.nodes.map(n => n.id));
    expect(level.biologicalContext.edges.length).toBeGreaterThan(0);
    level.biologicalContext.edges.forEach(e => {
      expect(nodeIds.has(e.source), e.id).toBe(true);
      expect(nodeIds.has(e.target), e.id).toBe(true);
    });
  });
});

// ───────────────────────── The four newer modes ─────────────────────────

import {
  allGenotypes, genotypeOptions, inheritAnswer, SIXTEENTHS, classifyMutation, evaluateTune, mutationKind, mutationSites, punnett, probability,
  pairChoices, pairSlotCount, pairSolution, wrongPairs, evaluateCut,
  evaluateAssembly, mergeFragments, overlapLength, evaluateGuide,
} from '../game/modes/logic';

const idsOf = async (mode: string) => {
  const out: string[] = [];
  for (const id of LEVEL_ORDER) if (levelMode(await load(id)) === mode) out.push(id);
  return out;
};

describe('sequence levels', async () => {
  const levels = await idsOf('sequence');
  it('exist', () => expect(levels.length).toBeGreaterThan(0));

  it.each(levels)('%s: steps are unique and each explains what must come before', async (id) => {
    const steps = (await load(id)).sequence!.steps;
    expect(steps.length).toBeGreaterThanOrEqual(4);
    expect(new Set(steps.map(s => s.id)).size).toBe(steps.length);
    steps.forEach(s => {
      expect(s.needs, s.id).toBeTruthy();
      expect(s.description, s.id).toBeTruthy();
    });
  });
});

describe('inheritance levels', async () => {
  const levels = await idsOf('inherit');
  it('exist', () => expect(levels.length).toBeGreaterThan(0));

  it.each(levels)('%s: genotypes, phenotypes and answers are consistent', async (id) => {
    const def = (await load(id)).inherit!;
    const genotypes = genotypeOptions(def);
    // Every genotype has a phenotype, and every phenotype has a label
    genotypes.forEach(g => expect(def.phenotypes[g], g).toBeDefined());
    Object.values(def.phenotypes).forEach(p => expect(def.phenotypeLabels[p], p).toBeTruthy());

    // A level with a second gene has the same rules for it
    const second = def.second;
    if (second) {
      genotypeOptions(second).forEach(g => expect(second.phenotypes[g], g).toBeDefined());
      Object.values(second.phenotypes).forEach(p => expect(second.phenotypeLabels[p], p).toBeTruthy());
    }

    expect(def.scenarios.length).toBeGreaterThanOrEqual(2);
    def.scenarios.forEach(sc => {
      expect(genotypes, `${sc.id} parent 1`).toContain(sc.parent1);
      expect(genotypes, `${sc.id} parent 2`).toContain(sc.parent2);
      expect(def.phenotypeLabels[sc.target], sc.id).toBeTruthy();
      if (second) {
        expect(genotypeOptions(second), `${sc.id} parent 1, second gene`).toContain(sc.parent1b);
        expect(genotypeOptions(second), `${sc.id} parent 2, second gene`).toContain(sc.parent2b);
        expect(second.phenotypeLabels[sc.targetB!], `${sc.id} second target`).toBeTruthy();
      } else {
        expect(sc.parent1b, sc.id).toBeUndefined();
      }
      const answer = inheritAnswer(def, sc);
      expect(second ? SIXTEENTHS : [0, 25, 50, 75, 100]).toContain(answer);
      expect(sc.explanation).toBeTruthy();
    });
  });
});

describe('mutation levels', async () => {
  const levels = await idsOf('mutation');
  it('exist', () => expect(levels.length).toBeGreaterThan(0));

  it.each(levels)('%s: one changed base, codon-aligned, and every effect is explained', async (id) => {
    const def = (await load(id)).mutation!;
    expect(def.reference.length % 3).toBe(0);
    expect(def.reference).toMatch(/^[ACGT]+$/);
    expect(def.mutant).toMatch(/^[ACGT]+$/);
    expect(mutationSites(def.reference, def.mutant).length).toBeGreaterThan(0);
    (['silent', 'missense', 'nonsense'] as const).forEach(e => expect(def.explanations[e], e).toBeTruthy());
    const effect = classifyMutation(def.reference, def.mutant);
    expect(['silent', 'missense', 'nonsense', 'frameshift']).toContain(effect);
    // A letter more or less shifts the reading, and then that effect has to be explained
    expect(mutationKind(def.reference, def.mutant) === 'substitution').toBe(effect !== 'frameshift');
    if (effect === 'frameshift') expect(def.explanations.frameshift).toBeTruthy();
  });

  it('the levels together cover every kind of effect', async () => {
    const effects = new Set<string>();
    for (const id of levels) {
      const def = (await load(id)).mutation!;
      effects.add(classifyMutation(def.reference, def.mutant));
    }
    expect([...effects].sort()).toEqual(['frameshift', 'missense', 'nonsense', 'silent']);
  });
});

describe('tune levels', async () => {
  const levels = await idsOf('tune');
  it('exist', () => expect(levels.length).toBeGreaterThan(0));

  // Every possible combination of one option per knob
  const combos = (def: NonNullable<LevelData['tune']>) =>
    def.knobs.reduce<Record<string, string>[]>(
      (acc, knob) => acc.flatMap(c => knob.options.map(o => ({ ...c, [knob.id]: o.id }))),
      [{}],
    );

  it.each(levels)('%s: has several solutions, but most setups fail', async (id) => {
    const def = (await load(id)).tune!;
    const results = combos(def).map(c => evaluateTune(def, c));
    const solved = results.filter(r => r.solved).length;
    expect(solved, 'at least two ways to win').toBeGreaterThanOrEqual(2);
    expect(solved / results.length, 'not trivial').toBeLessThan(0.35);
    // The budget has to matter: some setup reaches the target but costs too much
    expect(results.some(r => r.reachesTarget && !r.withinBudget), 'budget matters').toBe(true);
  });

  it.each(levels)('%s: the trade-offs exist (some setup fails because the culture suffers)', async (id) => {
    const def = (await load(id)).tune!;
    const results = combos(def).map(c => evaluateTune(def, c));
    expect(results.some(r => r.withinBudget && !r.reachesTarget && r.growth < 0.6)).toBe(true);
  });

  it.each(levels)('%s: every option has a positive cost-effect and a description', async (id) => {
    const def = (await load(id)).tune!;
    def.knobs.forEach(k => k.options.forEach(o => {
      expect(o.description, o.id).toBeTruthy();
      expect(o.cost).toBeGreaterThanOrEqual(0);
      expect(o.perCell).toBeGreaterThan(0);
      expect(o.growth).toBeGreaterThan(0);
    }));
  });
});

describe('pairing levels', async () => {
  const levels = await idsOf('pairing');
  it('exist, one of each kind', async () => {
    expect(levels.length).toBeGreaterThanOrEqual(3);
    const kinds = await Promise.all(levels.map(async id => (await load(id)).pairing!.kind));
    expect([...new Set(kinds)].sort()).toEqual(['dna', 'protein', 'rna']);
  });

  it.each(levels)('%s: the template is valid for its kind and every answer is on offer', async (id) => {
    const def = (await load(id)).pairing!;
    if (def.kind === 'protein') {
      expect(def.template).toMatch(/^[ACGU]+$/);
      expect(def.template.length % 3).toBe(0);
      expect(def.template.startsWith('AUG')).toBe(true);
      expect(['UAA', 'UAG', 'UGA']).toContain(def.template.slice(-3));
    } else {
      expect(def.template).toMatch(/^[ACGT]+$/);
    }
    expect(def.story).toBeTruthy();
    const solution = pairSolution(def);
    expect(solution).toHaveLength(pairSlotCount(def));
    const tray = pairChoices(def, id);
    solution.forEach(value => expect(tray, value).toContain(value));
    // The right answer is accepted, and a wrong or empty one is caught
    expect(wrongPairs(def, solution)).toEqual([]);
    expect(wrongPairs(def, solution.map((v, i) => (i === 0 ? tray.find(c => c !== v)! : v)))).toEqual([0]);
    expect(wrongPairs(def, [])).toHaveLength(solution.length);
  });
});

describe('cut levels', async () => {
  const levels = await idsOf('cut');
  it('exist', () => expect(levels.length).toBeGreaterThanOrEqual(2));

  it.each(levels)('%s: the gene is inside the DNA and the enzymes make a puzzle with an answer', async (id) => {
    const def = (await load(id)).cut!;
    expect(def.gene.start).toBeGreaterThan(0);
    expect(def.gene.end).toBeLessThan(def.length);
    expect(def.gene.start).toBeLessThan(def.gene.end);
    expect(new Set(def.enzymes.map(e => e.id)).size).toBe(def.enzymes.length);
    def.enzymes.forEach(e => {
      expect(e.sites.length, e.id).toBeGreaterThan(0);
      e.sites.forEach(p => { expect(p, e.id).toBeGreaterThan(0); expect(p, e.id).toBeLessThan(def.length); });
    });
    expect(def.story).toBeTruthy();

    // Try every choice of enzymes
    const ids = def.enzymes.map(e => e.id);
    const subsets = Array.from({ length: 1 << ids.length }, (_, mask) => ids.filter((_, i) => mask & (1 << i)));
    const solutions = subsets.filter(chosen => evaluateCut(def, chosen).isolates);
    expect(solutions.length, 'there is a way to isolate the gene').toBeGreaterThan(0);
    expect(evaluateCut(def, []).isolates).toBe(false);
    expect(evaluateCut(def, ids).isolates, 'choosing everything must not work').toBe(false);
    // Some enzyme cuts inside the gene, which is what makes "everything" fail
    expect(def.enzymes.some(e => e.sites.some(p => p > def.gene.start && p < def.gene.end))).toBe(true);
  });

  it('the insulin level has a band of the gene size that is another piece', async () => {
    const def = (await load('cut-insulin')).cut!;
    const traps = def.enzymes.filter(e => evaluateCut(def, [e.id]).impostor);
    expect(traps.length).toBeGreaterThan(0);
  });
});

/** Every ordering of 0..n-1. */
function permutations(n: number): number[][] {
  const out: number[][] = [];
  const walk = (prefix: number[], rest: number[]) => {
    if (rest.length === 0) { out.push(prefix); return; }
    rest.forEach((x, i) => walk([...prefix, x], [...rest.slice(0, i), ...rest.slice(i + 1)]));
  };
  walk([], Array.from({ length: n }, (_, i) => i));
  return out;
}

describe('assemble levels', async () => {
  const levels = await idsOf('assemble');
  it('exist, from easy to hard', () => expect(levels.length).toBeGreaterThanOrEqual(4));

  it.each(levels)('%s: the fragments rebuild the sequence, with one way to do it', async (id) => {
    const def = (await load(id)).assemble!;
    expect(def.sequence).toMatch(/^[ACGT]+$/);
    def.fragments.forEach(f => expect(f).toMatch(/^[ACGT]+$/));
    expect(new Set(def.fragments).size).toBe(def.fragments.length);
    expect(def.fragments.length).toBeGreaterThanOrEqual(3);
    expect(def.fragments.length).toBeLessThanOrEqual(7);
    expect(mergeFragments(def.fragments)).toBe(def.sequence);
    def.fragments.slice(1).forEach((f, i) => {
      expect(overlapLength(def.fragments[i], f), `join ${i + 1}`).toBeGreaterThanOrEqual(def.minOverlap);
    });
    const solving = permutations(def.fragments.length).filter(order => evaluateAssembly(def, order).solved);
    expect(solving, 'only the listed order solves it').toEqual([def.fragments.map((_, i) => i)]);
    expect(def.story).toBeTruthy();
  });

  it('the harder levels have a repeat that makes a wrong order look right', async () => {
    let tricky = 0;
    for (const id of levels) {
      const def = (await load(id)).assemble!;
      const fooling = permutations(def.fragments.length).some(order => {
        const r = evaluateAssembly(def, order);
        return r.badJoin === -1 && !r.solved;
      });
      if (fooling) tricky++;
    }
    expect(tricky).toBeGreaterThanOrEqual(2);
  });
});

describe('CRISPR levels', async () => {
  const levels = await idsOf('crispr');
  it('exist', () => expect(levels.length).toBeGreaterThanOrEqual(4));

  it.each(levels)('%s: one right guide and several that fail in different ways', async (id) => {
    const def = (await load(id)).crispr!;
    expect(def.genome).toMatch(/^[ACGT]+$/);
    expect(def.target.start).toBeGreaterThan(0);
    expect(def.target.end).toBeLessThan(def.genome.length);
    expect(def.target.start).toBeLessThan(def.target.end);
    expect(new Set(def.guides.map(g => g.id)).size).toBe(def.guides.length);
    def.guides.forEach(g => {
      expect(g.sequence).toMatch(/^[ACGT]+$/);
      expect(g.sequence.length).toBe(def.guides[0].sequence.length);
    });
    const verdicts = def.guides.map(g => evaluateGuide(def, g.id).verdict);
    expect(verdicts.filter(v => v === 'perfect'), 'exactly one right guide').toHaveLength(1);
    expect(new Set(verdicts).size, 'the wrong ones fail in different ways').toBeGreaterThanOrEqual(3);
    expect(def.story).toBeTruthy();
  });

  it('the later levels teach the PAM and the look-alike sites', async () => {
    const seen = new Set<string>();
    for (const id of levels) {
      const def = (await load(id)).crispr!;
      def.guides.forEach(g => seen.add(evaluateGuide(def, g.id).verdict));
    }
    expect([...seen].sort()).toEqual(['elsewhere', 'nomatch', 'nopam', 'offtarget', 'perfect']);
  });
});
