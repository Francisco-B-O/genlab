import { describe, it, expect, beforeAll, vi } from 'vitest';

// The store uses localStorage and window timers: give the node environment simple stand-ins
const memory: Record<string, string> = {};
// @ts-expect-error — setting globals for the node test environment
globalThis.localStorage = {
  getItem: (key: string) => memory[key] ?? null,
  setItem: (key: string, value: string) => { memory[key] = value; },
  removeItem: (key: string) => { delete memory[key]; },
  clear: () => { Object.keys(memory).forEach(k => delete memory[k]); },
};
// @ts-expect-error — the store schedules the pathway simulation with window.setTimeout
globalThis.window = globalThis;

const { useGameStore, levelMode, selectProgress } = await import('../game/GameStore');
const { LEVEL_ORDER } = await import('../levels/LevelLoader');
const logic = await import('../game/modes/logic');
import type { LevelData } from '../types/level.types';

/**
 * Plays every level to the end with the right moves, through the same store actions the
 * boards call. It catches levels whose data cannot be solved, in any mode.
 */
const store = () => useGameStore.getState();

/** Every choice of one option per knob. */
function tuneCombos(def: NonNullable<LevelData['tune']>) {
  return def.knobs.reduce<Record<string, string>[]>(
    (acc, knob) => acc.flatMap(c => knob.options.map(o => ({ ...c, [knob.id]: o.id }))),
    [{}],
  );
}

function playWinningMoves(level: LevelData) {
  const mode = levelMode(level);
  switch (mode) {
    case 'pathway':
      for (const rc of level.puzzle.requiredConnections) {
        store().tapNode(rc.sourceId);
        store().tapNode(rc.targetId);
      }
      return;
    case 'construct': {
      const def = level.construct!;
      def.solution.forEach((partId, i) => { store().pickPart(partId); store().placeInSlot(i); });
      store().testConstruct();
      return;
    }
    case 'diagnose': {
      const def = level.diagnose!;
      store().accuse(def.faultyIds[0]);
      store().chooseFix(def.fixes.find(f => f.correct)!.id);
      return;
    }
    case 'sequence': {
      level.sequence!.steps.forEach(step => store().seqAdd(step.id));
      store().testSequence();
      return;
    }
    case 'inherit': {
      const def = level.inherit!;
      for (const scenario of def.scenarios) {
        const expected = [
          ...logic.punnett(scenario.parent1, scenario.parent2, def.alleles),
          ...(def.second ? logic.punnett(scenario.parent1b!, scenario.parent2b!, def.second.alleles) : []),
        ];
        expected.forEach((genotype, i) => {
          for (let tries = 0; store().inheritCells[i] !== genotype && tries < 6; tries++) store().cycleCell(i);
        });
        store().checkSquare();
        store().answerInherit(logic.inheritAnswer(def, scenario));
        store().nextInherit();
      }
      return;
    }
    case 'mutation': {
      const def = level.mutation!;
      store().pickBase(logic.mutationSites(def.reference, def.mutant)[0]);
      store().answerEffect(logic.classifyMutation(def.reference, def.mutant));
      return;
    }
    case 'tune': {
      const def = level.tune!;
      const winning = tuneCombos(def).find(c => logic.evaluateTune(def, c).solved)!;
      Object.entries(winning).forEach(([knob, option]) => store().setTune(knob, option));
      store().testTune();
      return;
    }
    case 'pairing': {
      logic.pairSolution(level.pairing!).forEach(value => store().pairPlace(value));
      store().testPairs();
      return;
    }
    case 'cut': {
      const def = level.cut!;
      const ids = def.enzymes.map(e => e.id);
      const subsets = Array.from({ length: 1 << ids.length }, (_, mask) => ids.filter((_, i) => mask & (1 << i)));
      subsets.find(s => logic.evaluateCut(def, s).isolates)!.forEach(id => store().cutToggle(id));
      store().testCut();
      return;
    }
    case 'assemble': {
      const def = level.assemble!;
      def.fragments.forEach((_, i) => store().asmAdd(i));
      store().testAssemble();
      return;
    }
    case 'crispr': {
      const def = level.crispr!;
      const right = def.guides.find(g => logic.evaluateGuide(def, g.id).verdict === 'perfect')!;
      store().crisprPick(right.id);
      store().testCrispr();
      return;
    }
  }
}

describe('every level can be played to the end', () => {
  beforeAll(() => { vi.useFakeTimers(); });

  it.each(LEVEL_ORDER)('%s', async (id) => {
    await store().loadLevel(id);
    expect(store().levelError, 'it loads').toBeNull();
    if (store().gamePhase === 'exploration') store().setGamePhase('puzzle');
    const level = store().currentLevel!;
    const mode = levelMode(level);

    playWinningMoves(level);

    if (mode === 'pathway') {
      expect(store().satisfiedRequiredIds.length).toBe(level.puzzle.requiredConnections.length);
      expect(store().puzzleEngine!.getState().isComplete).toBe(true);
    } else {
      expect(store().modeSolved, `${mode} level solved with the right moves`).toBe(true);
    }
    const { done, total } = selectProgress(store());
    expect(total).toBeGreaterThan(0);
    expect(done).toBe(total);
  });
});
