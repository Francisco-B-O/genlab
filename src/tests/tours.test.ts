import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { useGameStore, levelMode } from '../game/GameStore';
import { TOURS } from '../game/tours';
import { persistence } from '../utils/persistence';
import type { LevelMode } from '../types/level.types';
import { LEVEL_ORDER, LevelLoader } from '../levels/LevelLoader';
import { es, en } from '../i18n';

const MODES = Object.keys(TOURS) as LevelMode[];
const css = readFileSync('src/index.css', 'utf8');
const source = (file: string) => readFileSync(`src/ui/components/${file}`, 'utf8');

describe('mode tutorials', () => {
  it('cover every mode', () => {
    expect([...MODES].sort()).toEqual(['assemble', 'construct', 'crispr', 'cut', 'diagnose', 'inherit', 'mutation', 'pairing', 'pathway', 'sequence', 'tune']);
  });

  it.each(MODES)('%s: has a text for every step, in both languages', (mode) => {
    for (const lang of [es, en]) {
      const texts = lang.tour.steps[mode];
      expect(texts.length).toBe(TOURS[mode].length);
      texts.forEach(text => expect(text.trim().length).toBeGreaterThan(20));
    }
  });

  it.each(MODES)('%s: the last step waits for the player and every highlight exists', (mode) => {
    const steps = TOURS[mode];
    expect(steps[steps.length - 1].done, 'the tutorial ends when the player does it').toBeTypeOf('function');
    steps.forEach(step => {
      if (!step.target) return;
      expect(css, `css for ${step.target}`).toContain(`body[data-tour-on="${step.target}"] [data-tour-el="${step.target}"]`);
    });
  });

  it('every highlight is attached to some element of a board', () => {
    const boards = ['ConstructBoard', 'SequenceBoard', 'InheritBoard', 'MutationBoard', 'TuneBoard', 'DiagnoseCard', 'Board2D', 'RightPanel', 'PairBoard', 'CutBoard', 'AssembleBoard', 'CrisprBoard']
      .map(name => source(`${name}.tsx`)).join('\n');
    const targets = new Set(MODES.flatMap(m => TOURS[m].flatMap(s => (s.target ? [s.target] : []))));
    targets.forEach(target => {
      const marked = boards.includes(`data-tour-el="${target}"`) || boards.includes(`'${target}'`);
      expect(marked, target).toBe(true);
    });
  });
});

describe('tutorial flow in the store', () => {
  const loader = new LevelLoader();

  const firstOf = async (mode: string) => {
    for (const id of LEVEL_ORDER) {
      const level = await loader.loadLevel(id);
      // The first pathway level has its own guided walk-through instead of the tour
      if (levelMode(level) === mode && !level.isTutorial) return id;
    }
    throw new Error(`no level for ${mode}`);
  };

  beforeEach(() => {
    useGameStore.setState({ tourMode: null, tourStep: 0 });
    persistence.markTutorialCompleted();
  });

  it.each(MODES)('%s: starts on the first visit and moves on as the player acts', async (mode) => {
    const id = await firstOf(mode);
    await useGameStore.getState().loadLevel(id);
    const s = useGameStore.getState();
    // A level may open with its illustrated intro first; the tutorial starts with the puzzle
    if (s.gamePhase === 'exploration') s.setGamePhase('puzzle');
    expect(useGameStore.getState().tourMode).toBe(mode);
    expect(useGameStore.getState().tourStep).toBe(0);
    // Steps that wait for the Next button are not satisfied by themselves
    expect(TOURS[mode][0].done?.(useGameStore.getState()) ?? false).toBe(false);
    // Skipping ends it
    useGameStore.getState().endTour();
    expect(useGameStore.getState().tourMode).toBeNull();
  });

  it('advances through the steps with Next and ends after the last one', async () => {
    await useGameStore.getState().loadLevel(await firstOf('mutation'));
    if (useGameStore.getState().gamePhase === 'exploration') useGameStore.getState().setGamePhase('puzzle');
    const total = TOURS.mutation.length;
    for (let i = 0; i < total - 1; i++) useGameStore.getState().advanceTour();
    expect(useGameStore.getState().tourStep).toBe(total - 1);
    useGameStore.getState().advanceTour();
    expect(useGameStore.getState().tourMode).toBeNull();
  });

  it('the construct steps react to picking and placing parts', async () => {
    await useGameStore.getState().loadLevel(await firstOf('construct'));
    const store = useGameStore.getState();
    const part = store.currentLevel!.construct!.parts[0].id;
    const [, pick, place, fill] = TOURS.construct;
    expect(pick.done!(useGameStore.getState())).toBe(false);
    useGameStore.getState().pickPart(part);
    expect(pick.done!(useGameStore.getState())).toBe(true);
    expect(place.done!(useGameStore.getState())).toBe(false);
    useGameStore.getState().placeInSlot(0);
    expect(place.done!(useGameStore.getState())).toBe(true);
    expect(fill.done!(useGameStore.getState())).toBe(false);
  });

  it('the pathway tutorial starts by itself once the "how to play" card is out of the way', async () => {
    let id = '';
    for (const l of LEVEL_ORDER) {
      const level = await loader.loadLevel(l);
      if (levelMode(level) === 'pathway' && !level.isTutorial) { id = l; break; }
    }
    // A player who has not done the guided level first sees the card, and the tutorial after it
    persistence.updatePreferences({ tutorialCompleted: false });
    await useGameStore.getState().loadLevel(id);
    if (useGameStore.getState().gamePhase === 'exploration') useGameStore.getState().setGamePhase('puzzle');
    expect(useGameStore.getState().showHowToPlay).toBe(true);
    expect(useGameStore.getState().tourMode, 'the card comes first').toBeNull();
    useGameStore.getState().dismissHowToPlay();
    expect(useGameStore.getState().tourMode).toBe('pathway');
    useGameStore.getState().endTour();

    // Without the card it starts right away, and follows the connections made
    await useGameStore.getState().loadLevel(id);
    if (useGameStore.getState().gamePhase === 'exploration') useGameStore.getState().setGamePhase('puzzle');
    expect(useGameStore.getState().showHowToPlay).toBe(false);
    expect(useGameStore.getState().tourMode).toBe('pathway');
    const [, pick, connect] = TOURS.pathway;
    expect(pick.done!(useGameStore.getState())).toBe(false);
    const rc = useGameStore.getState().currentLevel!.puzzle.requiredConnections[0];
    useGameStore.getState().tapNode(rc.sourceId);
    expect(pick.done!(useGameStore.getState())).toBe(true);
    expect(connect.done!(useGameStore.getState())).toBe(false);
    useGameStore.getState().tapNode(rc.targetId);
    expect(connect.done!(useGameStore.getState())).toBe(true);
    // Running the simulation ends it, so it does not come back when the level is retried
    useGameStore.getState().runSimulation();
    expect(useGameStore.getState().tourMode).toBeNull();
    useGameStore.getState().resetLevel();
    expect(useGameStore.getState().tourMode).toBeNull();
  });

  it('the guided first level has no tour, it has its own walk-through', async () => {
    await useGameStore.getState().loadLevel('tutorial');
    if (useGameStore.getState().gamePhase === 'exploration') useGameStore.getState().setGamePhase('puzzle');
    expect(useGameStore.getState().tourMode).toBeNull();
  });
});
