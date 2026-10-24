import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { EdgeType, BiologicalNode } from '../types/biology.types';
import type { LevelData, LevelMode } from '../types/level.types';
import { TOURS } from './tours';
import type { ScoreBreakdown, HintResult, GamePhase } from '../types/game.types';
import type { SimulationState } from '../types/simulation.types';
import { BiologicalGraph } from '../biology/BiologicalGraph';
import { PuzzleEngine } from './PuzzleEngine';
import { levelLoader } from '../levels/LevelLoader';
import { createInitialSimulationState } from '../simulation/SimulationState';
import { persistence } from '../utils/persistence';
import { audioManager } from '../audio/AudioManager';
import { localize, t, fmt, type Language } from '../i18n';
import {
  correctFeedback, optionalFeedback, wrongFeedback, fallbackEdgeType, type Feedback,
} from './feedback';
import {
  genotypeOptions, classifyMutation, evaluateAssembly, evaluateCut, evaluateGuide, evaluateTune, firstWrongStep, mutationKind, mutationSites,
  inheritAnswer, inheritCellCount, pairSlotCount, punnett, wrongPairs, type GuideVerdict, type MutationEffect, type TuneResult,
} from './modes/logic';

const LANGUAGE_KEY = 'biogen_language';
const SEEN_TOURS_KEY = 'biogen_seen_tours';

function seenTours(): string[] {
  try { return JSON.parse(localStorage.getItem(SEEN_TOURS_KEY) ?? '[]') as string[]; } catch { return []; }
}

function loadLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === 'es' || saved === 'en') return saved;
  } catch { /* storage unavailable */ }
  return 'es';
}

function indexNodes(level: LevelData | null): Record<string, BiologicalNode> {
  const map: Record<string, BiologicalNode> = {};
  level?.biologicalContext.nodes.forEach(n => { map[n.id] = n; });
  return map;
}

export type GameState = GameStoreState;

interface GameStoreState {
  // Level: raw (bilingual) data and the copy localized to `language`
  rawLevel: LevelData | null;
  currentLevel: LevelData | null;
  nodes: Record<string, BiologicalNode>;
  isLoadingLevel: boolean;
  levelError: string | null;

  gamePhase: GamePhase;
  language: Language;

  playerGraph: BiologicalGraph;
  puzzleEngine: PuzzleEngine | null;
  simulationState: SimulationState;

  selectedNodeId: string | null;
  pendingSourceId: string | null;

  score: ScoreBreakdown;
  hintsUsed: number;
  wrongConnections: number;
  satisfiedRequiredIds: string[];

  feedback: Feedback | null;
  feedbackKey: number;

  // Construct mode: part id placed in each slot, and the part picked up from the tray
  slots: (string | null)[];
  selectedPartId: string | null;
  wrongSlot: number | null;

  // Diagnose mode
  accusedIds: string[];
  faultFound: boolean;
  fixesTried: string[];

  // Sequence mode
  seqOrder: string[];
  seqWrong: number | null;

  // Inheritance mode: current scenario, the four cells of its square, and where the player is
  inheritIndex: number;
  inheritCells: (string | null)[];
  inheritStage: 'square' | 'question';
  inheritWrongCells: number[];
  inheritAnswered: boolean;

  // Mutation mode
  mutFound: boolean;
  mutWrongBases: number[];

  // Tune mode
  tuneChoices: Record<string, string>;
  tuneResult: TuneResult | null;

  // Pairing mode
  pairAnswer: (string | null)[];
  pairActive: number;
  pairWrong: number[];

  // Cut mode
  cutChosen: string[];
  /** What was wrong in the last failed check, if any. */
  cutAttempt: 'inside' | 'impostor' | 'missing' | null;

  // Assemble mode
  asmOrder: number[];
  /** First join that does not fit, -1 when the joins fit but the result is wrong, null before any check. */
  asmBad: number | null;

  // CRISPR mode
  crisprGuide: string | null;
  crisprAttempt: GuideVerdict | null;

  // Levels of every mode except pathway are solved without a simulation
  modeSolved: boolean;

  // Guided tutorial level
  guideStep: number;
  // "How to play" card shown before the first non-tutorial puzzle
  showHowToPlay: boolean;
  // Guided tutorial of a level mode: shown the first time a mode is played, and on demand
  tourMode: LevelMode | null;
  tourStep: number;

  setLanguage: (lang: Language) => void;
  loadLevel: (levelId: string) => Promise<void>;
  tapNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  attemptConnection: (aId: string, bId: string) => void;
  runSimulation: () => void;
  useHint: (level: 1 | 2 | 3) => HintResult | null;
  completeLevel: () => void;
  resetLevel: () => void;
  setGamePhase: (phase: GamePhase) => void;
  advanceGuide: () => void;
  dismissHowToPlay: () => void;
  startTour: (mode: LevelMode) => void;
  advanceTour: () => void;
  endTour: () => void;

  pickPart: (partId: string | null) => void;
  placeInSlot: (index: number) => void;
  testConstruct: () => void;
  accuse: (nodeId: string) => void;
  chooseFix: (fixId: string) => void;
  seqAdd: (stepId: string) => void;
  seqRemove: (index: number) => void;
  testSequence: () => void;
  cycleCell: (index: number) => void;
  checkSquare: () => void;
  answerInherit: (percent: number) => void;
  nextInherit: () => void;
  pickBase: (index: number) => void;
  answerEffect: (effect: MutationEffect) => void;
  setTune: (knobId: string, optionId: string) => void;
  testTune: () => void;
  pairSelect: (index: number) => void;
  pairPlace: (value: string) => void;
  testPairs: () => void;
  cutToggle: (enzymeId: string) => void;
  testCut: () => void;
  asmAdd: (fragment: number) => void;
  asmRemove: (position: number) => void;
  testAssemble: () => void;
  crisprPick: (guideId: string) => void;
  testCrispr: () => void;
}

export function levelMode(level: LevelData | null): LevelMode {
  return level?.mode ?? 'pathway';
}

/** Progress shown in the top bar and side panel, for any kind of level. */
export function selectProgress(s: GameStoreState): { done: number; total: number } {
  const level = s.currentLevel;
  if (!level) return { done: 0, total: 0 };
  switch (levelMode(level)) {
    case 'construct': {
      // Only counts once the construct works: a full strip is not necessarily a right one
      const total = level.construct?.solution.length ?? 0;
      return { done: s.modeSolved ? total : 0, total };
    }
    case 'diagnose':
      return { done: (s.faultFound ? 1 : 0) + (s.modeSolved ? 1 : 0), total: 2 };
    case 'sequence': {
      const total = level.sequence?.steps.length ?? 0;
      return { done: s.modeSolved ? total : 0, total };
    }
    case 'inherit': {
      const total = level.inherit?.scenarios.length ?? 0;
      return { done: Math.min(total, s.inheritIndex + (s.inheritAnswered ? 1 : 0)), total };
    }
    case 'mutation':
      return { done: (s.mutFound ? 1 : 0) + (s.modeSolved ? 1 : 0), total: 2 };
    case 'tune':
      return { done: s.modeSolved ? 1 : 0, total: 1 };
    case 'pairing': {
      const total = level.pairing ? pairSlotCount(level.pairing) : 0;
      return { done: s.modeSolved ? total : 0, total };
    }
    case 'cut':
      return { done: s.modeSolved ? 1 : 0, total: 1 };
    case 'assemble': {
      const total = level.assemble?.fragments.length ?? 0;
      return { done: s.modeSolved ? total : 0, total };
    }
    case 'crispr':
      return { done: s.modeSolved ? 1 : 0, total: 1 };
    default:
      return {
        done: s.satisfiedRequiredIds.length,
        total: level.puzzle.winCondition.requiredConnectionIds.length,
      };
  }
}

/** Points earned so far in a construct or diagnose level (undefined for pathway levels). */
function modeBase(s: GameStoreState): number | undefined {
  switch (levelMode(s.currentLevel)) {
    case 'construct':
      return s.modeSolved ? (s.currentLevel?.construct?.solution.length ?? 0) * CONSTRUCT_POINTS_PER_SLOT : 0;
    case 'diagnose':
      return (s.faultFound ? DIAGNOSE_POINTS_FAULT : 0) + (s.modeSolved ? DIAGNOSE_POINTS_FIX : 0);
    case 'sequence':
      return s.modeSolved ? (s.currentLevel?.sequence?.steps.length ?? 0) * 100 : 0;
    case 'inherit':
      return Math.min(s.currentLevel?.inherit?.scenarios.length ?? 0, s.inheritIndex + (s.inheritAnswered ? 1 : 0)) * 150;
    case 'mutation':
      return (s.mutFound ? 300 : 0) + (s.modeSolved ? 200 : 0);
    case 'tune':
      return s.modeSolved ? 500 : 0;
    case 'cut':
      return s.modeSolved ? 500 : 0;
    case 'assemble':
      return s.modeSolved ? (s.currentLevel?.assemble?.fragments.length ?? 0) * 100 : 0;
    case 'crispr':
      return s.modeSolved ? 500 : 0;
    case 'pairing':
      return s.modeSolved ? (s.currentLevel?.pairing ? pairSlotCount(s.currentLevel.pairing) : 0) * PAIR_POINTS_PER_SLOT : 0;
    default:
      return undefined;
  }
}

const CONSTRUCT_POINTS_PER_SLOT = 100;
const PAIR_POINTS_PER_SLOT = 50;
const DIAGNOSE_POINTS_FAULT = 300;
const DIAGNOSE_POINTS_FIX = 200;

const DEFAULT_SCORE: ScoreBreakdown = {
  base: 0,
  bonusNoHints: 0,
  bonusNoPenalties: 0,
  bonusSpeed: 0,
  bonusOptional: 0,
  penalties: 0,
  total: 0,
};

const freshPuzzleState = {
  simulationState: createInitialSimulationState(),
  score: DEFAULT_SCORE,
  hintsUsed: 0,
  wrongConnections: 0,
  satisfiedRequiredIds: [] as string[],
  selectedNodeId: null,
  pendingSourceId: null,
  feedback: null,
  guideStep: 0,
  slots: [] as (string | null)[],
  selectedPartId: null,
  wrongSlot: null,
  accusedIds: [] as string[],
  faultFound: false,
  fixesTried: [] as string[],
  seqOrder: [] as string[],
  seqWrong: null,
  inheritIndex: 0,
  // Four cells per gene: the first four are the square of the first gene, the last four the square of the second
  inheritCells: Array.from({ length: 8 }, () => null) as (string | null)[],
  inheritStage: 'square' as 'square' | 'question',
  inheritWrongCells: [] as number[],
  inheritAnswered: false,
  mutFound: false,
  mutWrongBases: [] as number[],
  tuneChoices: {} as Record<string, string>,
  tuneResult: null,
  pairAnswer: [] as (string | null)[],
  pairActive: 0,
  pairWrong: [] as number[],
  cutChosen: [] as string[],
  cutAttempt: null as 'inside' | 'impostor' | 'missing' | null,
  asmOrder: [] as number[],
  asmBad: null as number | null,
  crisprGuide: null as string | null,
  crisprAttempt: null as GuideVerdict | null,
  modeSolved: false,
};

/** Fresh per-attempt state for a level, including its mode-specific parts. */
function startState(level: LevelData) {
  return {
    ...freshPuzzleState,
    slots: Array.from({ length: level.construct?.solution.length ?? 0 }, () => null),
    pairAnswer: Array.from({ length: level.pairing ? pairSlotCount(level.pairing) : 0 }, () => null) as (string | null)[],
  };
}

/** The player graph for a level; diagnose levels start with the whole pathway drawn. */
function buildGraph(level: LevelData) {
  const graph = levelLoader.buildGraphFromLevel(level);
  if (levelMode(level) === 'diagnose') {
    level.biologicalContext.edges.forEach(e => graph.addEdge({ ...e, isRequired: true, isValid: true }));
  }
  return graph;
}

export const useGameStore = create<GameStoreState>()(
  subscribeWithSelector((set, get) => ({
    rawLevel: null,
    currentLevel: null,
    nodes: {},
    isLoadingLevel: false,
    levelError: null,
    gamePhase: 'menu',
    language: loadLanguage(),
    playerGraph: new BiologicalGraph(),
    puzzleEngine: null,
    feedbackKey: 0,
    showHowToPlay: false,
    tourMode: null,
    tourStep: 0,
    ...freshPuzzleState,

    setLanguage: (lang: Language) => {
      try { localStorage.setItem(LANGUAGE_KEY, lang); } catch { /* storage unavailable */ }
      const { rawLevel } = get();
      const currentLevel = rawLevel ? localize(rawLevel, lang) : null;
      set({ language: lang, currentLevel, nodes: indexNodes(currentLevel), feedback: null });
    },

    loadLevel: async (levelId: string) => {
      set({ isLoadingLevel: true, levelError: null });

      try {
        const rawLevel = await levelLoader.loadLevel(levelId);
        const graph = buildGraph(rawLevel);
        const engine = new PuzzleEngine(rawLevel, graph);
        const currentLevel = localize(rawLevel, get().language);
        const hasExploration = (rawLevel.exploration?.length ?? 0) > 0;

        set({
          rawLevel,
          currentLevel,
          nodes: indexNodes(currentLevel),
          playerGraph: graph,
          puzzleEngine: engine,
          isLoadingLevel: false,
          showHowToPlay: false,
          ...startState(rawLevel),
        });
        get().setGamePhase(hasExploration ? 'exploration' : 'puzzle');
      } catch (err) {
        set({
          isLoadingLevel: false,
          levelError: err instanceof Error ? err.message : 'Unknown error loading level',
        });
      }
    },

    tapNode: (nodeId: string) => {
      const { gamePhase, pendingSourceId, currentLevel } = get();
      audioManager.play('node_select');

      if (gamePhase !== 'puzzle' || levelMode(currentLevel) !== 'pathway') {
        set({ selectedNodeId: nodeId });
        return;
      }
      if (!pendingSourceId) {
        set({ pendingSourceId: nodeId, selectedNodeId: nodeId });
        return;
      }
      if (pendingSourceId === nodeId) {
        set({ pendingSourceId: null });
        return;
      }
      set({ pendingSourceId: null, selectedNodeId: nodeId });
      get().attemptConnection(pendingSourceId, nodeId);
    },

    selectNode: (nodeId: string | null) => {
      set({ selectedNodeId: nodeId, pendingSourceId: null });
    },

    attemptConnection: (aId: string, bId: string) => {
      const { puzzleEngine, currentLevel, nodes, language, playerGraph, satisfiedRequiredIds } = get();
      if (!puzzleEngine || !currentLevel) return;
      const a = nodes[aId];
      const b = nodes[bId];
      if (!a || !b) return;

      const showFeedback = (feedback: Feedback) =>
        set(s => ({ feedback, feedbackKey: s.feedbackKey + 1 }));

      const alreadyLinked = playerGraph.getAllEdges().some(
        e => (e.source === aId && e.target === bId) || (e.source === bId && e.target === aId)
      );
      if (alreadyLinked) {
        showFeedback({ tone: 'info', title: t(language).feedback.alreadyConnected });
        return;
      }

      // The player may tap the two pieces in either order: orient the
      // connection the way the level defines it.
      const matches = (c: { sourceId: string; targetId: string }) =>
        (c.sourceId === aId && c.targetId === bId) || (c.sourceId === bId && c.targetId === aId);
      const required = currentLevel.puzzle.requiredConnections.find(
        rc => matches(rc) && !satisfiedRequiredIds.includes(rc.id)
      );
      const optional = required ? undefined : currentLevel.puzzle.optionalConnections.find(matches);
      const def = required ?? optional;

      const [sourceId, targetId] = def ? [def.sourceId, def.targetId] : [aId, bId];
      const edgeType = (def?.edgeType ?? fallbackEdgeType(a.type, b.type)) as EdgeType;
      const result = puzzleEngine.connectNodes(sourceId, targetId, edgeType);

      let feedback: Feedback;
      if (result.success && result.isCorrect && required) {
        feedback = correctFeedback(language, nodes[sourceId], nodes[targetId], edgeType, required.description);
        audioManager.play('connection_correct');
      } else if (result.success && optional) {
        feedback = optionalFeedback(language, nodes[sourceId], nodes[targetId], edgeType, optional.bonusPoints, optional.description);
        audioManager.play('connection_correct');
      } else {
        // Wrong attempts are explained but never left on the board
        if (result.success && result.edge) puzzleEngine.disconnectNodes(result.edge.id);
        feedback = wrongFeedback(language, currentLevel, a, b);
        audioManager.play('connection_wrong');
      }

      const engineState = puzzleEngine.getState();
      const satisfied = Array.from(engineState.satisfiedRequiredIds);
      set(s => ({
        feedback,
        feedbackKey: s.feedbackKey + 1,
        score: puzzleEngine.getScore(),
        satisfiedRequiredIds: satisfied,
        wrongConnections: engineState.wrongConnectionCount,
        playerGraph: puzzleEngine.getGraph(),
      }));

      // Advance the tutorial guide when its awaited connection is made
      const guide = currentLevel.guide;
      const { guideStep } = get();
      const awaited = guide?.[guideStep]?.connectionId;
      if (awaited && satisfied.includes(awaited)) {
        set({ guideStep: guideStep + 1 });
      }

      if (engineState.isComplete) {
        showFeedback({ tone: 'success', title: t(language).feedback.complete, detail: feedback.detail });
        window.setTimeout(() => {
          const now = get();
          if (now.gamePhase === 'puzzle' && now.puzzleEngine === puzzleEngine) now.runSimulation();
        }, 1400);
      }
    },

    runSimulation: () => {
      const { puzzleEngine, currentLevel, language } = get();
      if (!puzzleEngine || !currentLevel) return;

      const result = puzzleEngine.runSimulation();
      const done = puzzleEngine.getState().satisfiedRequiredIds.size;
      const total = currentLevel.puzzle.winCondition.requiredConnectionIds.length;
      const completionFraction = total > 0 ? done / total : 0;
      const i18n = t(language);

      audioManager.play('simulation_start');
      // The pathway tutorial ends here: its card leaves with the puzzle phase
      get().endTour();
      set({
        gamePhase: 'simulation',
        pendingSourceId: null,
        simulationState: {
          ...createInitialSimulationState(),
          isRunning: true,
          steps: result.steps,
          variables: result.finalVariables,
          completionFraction,
          isComplete: true,
        },
        feedback: {
          tone: completionFraction >= 1 ? 'success' : 'info',
          title: completionFraction >= 1
            ? i18n.simulation.complete
            : fmt(i18n.simulation.partial, { done, total }),
        },
      });
    },

    useHint: (level: 1 | 2 | 3): HintResult | null => {
      const { puzzleEngine, currentLevel } = get();
      if (!puzzleEngine || !currentLevel) return null;

      const hint = puzzleEngine.getHint(level);
      // The engine holds raw data; take the text from the localized level
      const localized = currentLevel.hints.find(h => h.level === level);
      set({ score: puzzleEngine.getScore(modeBase(get())), hintsUsed: puzzleEngine.getHintsUsedCount() });
      return {
        ...hint,
        title: localized?.title ?? hint.title,
        content: localized?.content ?? hint.content,
      };
    },

    completeLevel: () => {
      const { puzzleEngine, currentLevel, hintsUsed, wrongConnections, simulationState, modeSolved, score: current } = get();
      const isPathway = levelMode(currentLevel) === 'pathway';
      const score = isPathway ? puzzleEngine?.getScore() ?? DEFAULT_SCORE : current;
      set({ gamePhase: 'complete', score });
      audioManager.play('level_complete');

      const solved = isPathway ? simulationState.completionFraction >= 1 : modeSolved;
      if (currentLevel && solved) {
        persistence.saveLevelProgress(currentLevel.id, {
          completed: true,
          bestScore: score.total,
          hintsUsed,
          wrongConnections,
          completedAt: new Date().toISOString(),
          timeElapsedSeconds: puzzleEngine?.getElapsedSeconds(),
          achievementsEarned: [],
        });
        if (currentLevel.isTutorial) persistence.markTutorialCompleted();
      }
    },

    resetLevel: () => {
      const { rawLevel } = get();
      if (!rawLevel) return;

      const freshGraph = buildGraph(rawLevel);
      set({
        playerGraph: freshGraph,
        puzzleEngine: new PuzzleEngine(rawLevel, freshGraph),
        gamePhase: 'puzzle',
        ...startState(rawLevel),
      });
    },

    setGamePhase: (phase: GamePhase) => {
      const { currentLevel } = get();
      const mode = levelMode(currentLevel);
      const needsHowToPlay =
        phase === 'puzzle' &&
        mode === 'pathway' &&
        !!currentLevel &&
        !currentLevel.isTutorial &&
        !persistence.isTutorialCompleted();
      // The tutorial of the mode starts by itself the first time, unless the first guided level or the "how to play" card is doing that job
      const needsTour = phase === 'puzzle' && !currentLevel?.isTutorial && !needsHowToPlay && !seenTours().includes(mode);
      set({
        gamePhase: phase,
        pendingSourceId: null,
        showHowToPlay: needsHowToPlay,
        tourMode: needsTour ? mode : null,
        tourStep: 0,
      });
    },

    advanceGuide: () => {
      set(s => ({ guideStep: s.guideStep + 1 }));
    },

    // ─── Sequence mode ────────────────────────────────────────

    seqAdd: (stepId: string) => {
      const { modeSolved, seqOrder } = get();
      if (modeSolved || seqOrder.includes(stepId)) return;
      audioManager.play('node_select');
      set({ seqOrder: [...seqOrder, stepId], seqWrong: null });
    },

    seqRemove: (index: number) => {
      const { modeSolved, seqOrder } = get();
      if (modeSolved) return;
      set({ seqOrder: seqOrder.filter((_, i) => i !== index), seqWrong: null });
    },

    testSequence: () => {
      const { currentLevel, seqOrder, puzzleEngine, language } = get();
      const def = currentLevel?.sequence;
      if (!def || !puzzleEngine) return;
      const i18n = t(language);
      const show = (feedback: Feedback, extra: Partial<GameStoreState> = {}) =>
        set(s => ({ feedback, feedbackKey: s.feedbackKey + 1, ...extra }));

      if (seqOrder.length < def.steps.length) {
        show({ tone: 'info', title: i18n.sequence.fillAll });
        return;
      }
      const wrong = firstWrongStep(seqOrder, def.steps.map(st => st.id));
      if (wrong === -1) {
        puzzleEngine.markSolved();
        audioManager.play('simulation_start');
        show(
          { tone: 'success', title: i18n.sequence.works, detail: i18n.sequence.worksDetail },
          { modeSolved: true, seqWrong: null, score: puzzleEngine.getScore(def.steps.length * 100) },
        );
        return;
      }
      const placed = def.steps.find(st => st.id === seqOrder[wrong])!;
      const isStarter = def.steps[0].id === placed.id;
      puzzleEngine.recordMistake();
      audioManager.play('connection_wrong');
      show(
        {
          tone: 'error',
          title: fmt(i18n.sequence.wrongAt, { n: wrong + 1, label: placed.label }),
          detail: isStarter ? i18n.sequence.firstStep : fmt(i18n.sequence.needs, { needs: placed.needs }),
        },
        { seqWrong: wrong, wrongConnections: puzzleEngine.getState().wrongConnectionCount, score: puzzleEngine.getScore(0) },
      );
    },

    // ─── Inheritance mode ─────────────────────────────────────

    cycleCell: (index: number) => {
      const { currentLevel, inheritCells, inheritStage } = get();
      const def = currentLevel?.inherit;
      if (!def || inheritStage !== 'square') return;
      const options = genotypeOptions(index >= 4 && def.second ? def.second : def);
      const current = inheritCells[index];
      const next = current === null ? options[0] : options[(options.indexOf(current) + 1) % options.length];
      const cells = [...inheritCells];
      cells[index] = next;
      audioManager.play('node_select');
      set({ inheritCells: cells, inheritWrongCells: [] });
    },

    checkSquare: () => {
      const { currentLevel, inheritCells, inheritIndex, puzzleEngine, language } = get();
      const def = currentLevel?.inherit;
      const scenario = def?.scenarios[inheritIndex];
      if (!def || !scenario || !puzzleEngine) return;
      const i18n = t(language);
      const show = (feedback: Feedback, extra: Partial<GameStoreState> = {}) =>
        set(s => ({ feedback, feedbackKey: s.feedbackKey + 1, ...extra }));

      if (inheritCells.slice(0, inheritCellCount(def)).some(c => c === null)) {
        show({ tone: 'info', title: i18n.inherit.fillAll });
        return;
      }
      const expected = [
        ...punnett(scenario.parent1, scenario.parent2, def.alleles),
        ...(def.second && scenario.parent1b && scenario.parent2b ? punnett(scenario.parent1b, scenario.parent2b, def.second.alleles) : []),
      ];
      const wrongCells = expected.flatMap((g, i) => (g !== inheritCells[i] ? [i] : []));
      if (wrongCells.length === 0) {
        audioManager.play('connection_correct');
        show({ tone: 'success', title: i18n.inherit.squareOk }, { inheritStage: 'question', inheritWrongCells: [] });
        return;
      }
      puzzleEngine.recordMistake();
      audioManager.play('connection_wrong');
      show(
        { tone: 'error', title: i18n.inherit.squareWrong },
        { inheritWrongCells: wrongCells, wrongConnections: puzzleEngine.getState().wrongConnectionCount, score: puzzleEngine.getScore(modeBase(get())) },
      );
    },

    answerInherit: (percent: number) => {
      const { currentLevel, inheritIndex, inheritStage, inheritAnswered, puzzleEngine, language } = get();
      const def = currentLevel?.inherit;
      const scenario = def?.scenarios[inheritIndex];
      if (!def || !scenario || !puzzleEngine || inheritStage !== 'question' || inheritAnswered) return;
      const i18n = t(language);
      const correct = inheritAnswer(def, scenario);
      if (Math.abs(percent - correct) < 1e-6) {
        audioManager.play('connection_correct');
        set(s => ({
          inheritAnswered: true,
          score: puzzleEngine.getScore(Math.min(def.scenarios.length, inheritIndex + 1) * 150),
          feedback: { tone: 'success', title: i18n.inherit.right, detail: scenario.explanation },
          feedbackKey: s.feedbackKey + 1,
        }));
        return;
      }
      puzzleEngine.recordMistake();
      audioManager.play('connection_wrong');
      set(s => ({
        wrongConnections: puzzleEngine.getState().wrongConnectionCount,
        score: puzzleEngine.getScore(modeBase(get())),
        feedback: { tone: 'error', title: def.second ? i18n.inherit.wrongTwo : i18n.inherit.wrong },
        feedbackKey: s.feedbackKey + 1,
      }));
    },

    nextInherit: () => {
      const { currentLevel, inheritIndex, inheritAnswered, puzzleEngine } = get();
      const def = currentLevel?.inherit;
      if (!def || !puzzleEngine || !inheritAnswered) return;
      if (inheritIndex + 1 >= def.scenarios.length) {
        puzzleEngine.markSolved();
        set({
          modeSolved: true,
          inheritIndex: def.scenarios.length,
          score: puzzleEngine.getScore(def.scenarios.length * 150),
        });
        return;
      }
      set({
        inheritIndex: inheritIndex + 1,
        inheritCells: Array.from({ length: 8 }, () => null),
        inheritStage: 'square',
        inheritWrongCells: [],
        inheritAnswered: false,
        feedback: null,
      });
    },

    // ─── Mutation mode ────────────────────────────────────────

    pickBase: (index: number) => {
      const { currentLevel, mutFound, puzzleEngine, mutWrongBases, language } = get();
      const def = currentLevel?.mutation;
      if (!def || !puzzleEngine || mutFound) return;
      const i18n = t(language);
      if (mutationSites(def.reference, def.mutant).includes(index)) {
        audioManager.play('connection_correct');
        set(s => ({
          mutFound: true,
          score: puzzleEngine.getScore(300),
          feedback: { tone: 'success', title: i18n.mutation.found },
          feedbackKey: s.feedbackKey + 1,
        }));
        return;
      }
      if (!mutWrongBases.includes(index)) puzzleEngine.recordMistake();
      audioManager.play('connection_wrong');
      set(s => ({
        mutWrongBases: s.mutWrongBases.includes(index) ? s.mutWrongBases : [...s.mutWrongBases, index],
        wrongConnections: puzzleEngine.getState().wrongConnectionCount,
        score: puzzleEngine.getScore(0),
        feedback: { tone: 'error', title: { substitution: i18n.mutation.notIt, insertion: i18n.mutation.notExtra, deletion: i18n.mutation.notMissing }[mutationKind(def.reference, def.mutant)] },
        feedbackKey: s.feedbackKey + 1,
      }));
    },

    answerEffect: (effect: MutationEffect) => {
      const { currentLevel, mutFound, modeSolved, puzzleEngine, language } = get();
      const def = currentLevel?.mutation;
      if (!def || !puzzleEngine || !mutFound || modeSolved) return;
      const i18n = t(language);
      if (effect === classifyMutation(def.reference, def.mutant)) {
        puzzleEngine.markSolved();
        audioManager.play('simulation_start');
        set(s => ({
          modeSolved: true,
          score: puzzleEngine.getScore(500),
          feedback: { tone: 'success', title: i18n.mutation.effects[effect], detail: def.explanations[effect] },
          feedbackKey: s.feedbackKey + 1,
        }));
        return;
      }
      puzzleEngine.recordMistake();
      audioManager.play('connection_wrong');
      set(s => ({
        wrongConnections: puzzleEngine.getState().wrongConnectionCount,
        score: puzzleEngine.getScore(300),
        feedback: { tone: 'error', title: i18n.mutation.wrongEffect },
        feedbackKey: s.feedbackKey + 1,
      }));
    },

    // ─── Tune mode ────────────────────────────────────────────

    setTune: (knobId: string, optionId: string) => {
      if (get().modeSolved) return;
      set(s => ({ tuneChoices: { ...s.tuneChoices, [knobId]: optionId }, tuneResult: null }));
    },

    testTune: () => {
      const { currentLevel, tuneChoices, puzzleEngine, language } = get();
      const def = currentLevel?.tune;
      if (!def || !puzzleEngine) return;
      const i18n = t(language);
      const result = evaluateTune(def, tuneChoices);
      const show = (feedback: Feedback, extra: Partial<GameStoreState> = {}) =>
        set(s => ({ feedback, feedbackKey: s.feedbackKey + 1, tuneResult: result, ...extra }));

      if (!result.complete) {
        show({ tone: 'info', title: i18n.tune.chooseAll }, { tuneResult: null });
        return;
      }
      if (result.solved) {
        puzzleEngine.markSolved();
        audioManager.play('simulation_start');
        show({ tone: 'success', title: i18n.tune.works }, { modeSolved: true, score: puzzleEngine.getScore(500) });
        return;
      }
      puzzleEngine.recordMistake();
      audioManager.play('connection_wrong');
      const title = !result.withinBudget
        ? i18n.tune.overBudget
        : result.growth < 0.6 ? def.messages?.lowGrowth ?? i18n.tune.lowGrowth
        : result.perCell < 2 ? def.messages?.lowPerCell ?? i18n.tune.lowPerCell
        : i18n.tune.tooLow;
      show({ tone: 'error', title }, { wrongConnections: puzzleEngine.getState().wrongConnectionCount, score: puzzleEngine.getScore(0) });
    },

    // ─── Pairing mode ─────────────────────────────────────────

    pairSelect: (index: number) => {
      if (get().modeSolved) return;
      audioManager.play('node_select');
      set({ pairActive: index, pairWrong: [] });
    },

    pairPlace: (value: string) => {
      const { pairAnswer, pairActive, modeSolved } = get();
      if (modeSolved || pairAnswer.length === 0) return;
      const next = [...pairAnswer];
      next[pairActive] = value;
      // Carry on with the next empty slot, wrapping round; stay put when everything is filled
      let target = pairActive;
      for (let step = 1; step <= next.length; step++) {
        const i = (pairActive + step) % next.length;
        if (next[i] === null) { target = i; break; }
      }
      audioManager.play('connection_correct');
      set({ pairAnswer: next, pairActive: target, pairWrong: [] });
    },

    testPairs: () => {
      const { currentLevel, pairAnswer, puzzleEngine, language } = get();
      const def = currentLevel?.pairing;
      if (!def || !puzzleEngine) return;
      const i18n = t(language);
      const showFeedback = (feedback: Feedback) => set(s => ({ feedback, feedbackKey: s.feedbackKey + 1 }));

      if (pairAnswer.some(v => !v)) {
        showFeedback({ tone: 'info', title: i18n.pairing.fillAll });
        return;
      }

      const wrong = wrongPairs(def, pairAnswer);
      if (wrong.length === 0) {
        puzzleEngine.markSolved();
        audioManager.play('simulation_start');
        set(s => ({
          modeSolved: true,
          pairWrong: [],
          score: puzzleEngine.getScore(pairAnswer.length * PAIR_POINTS_PER_SLOT),
          feedback: { tone: 'success', title: i18n.pairing.works[def.kind], detail: i18n.pairing.worksDetail[def.kind] },
          feedbackKey: s.feedbackKey + 1,
        }));
        return;
      }

      puzzleEngine.recordMistake();
      audioManager.play('connection_wrong');
      set(s => ({
        pairWrong: wrong,
        feedback: {
          tone: 'error',
          title: wrong.length === 1 ? i18n.pairing.wrongOne : fmt(i18n.pairing.wrongMany, { count: wrong.length }),
          detail: i18n.pairing.rule[def.kind],
        },
        feedbackKey: s.feedbackKey + 1,
        wrongConnections: puzzleEngine.getState().wrongConnectionCount,
        score: puzzleEngine.getScore(0),
      }));
    },

    // ─── Cut mode ─────────────────────────────────────────────

    cutToggle: (enzymeId: string) => {
      const { cutChosen, modeSolved } = get();
      if (modeSolved) return;
      audioManager.play('node_select');
      set({
        cutChosen: cutChosen.includes(enzymeId) ? cutChosen.filter(id => id !== enzymeId) : [...cutChosen, enzymeId],
        cutAttempt: null,
      });
    },

    testCut: () => {
      const { currentLevel, cutChosen, puzzleEngine, language } = get();
      const def = currentLevel?.cut;
      if (!def || !puzzleEngine) return;
      const i18n = t(language);
      const showFeedback = (feedback: Feedback) => set(s => ({ feedback, feedbackKey: s.feedbackKey + 1 }));

      if (cutChosen.length === 0) {
        showFeedback({ tone: 'info', title: i18n.cut.pickOne });
        return;
      }

      const result = evaluateCut(def, cutChosen);
      if (result.isolates) {
        puzzleEngine.markSolved();
        audioManager.play('simulation_start');
        set(s => ({
          modeSolved: true,
          cutAttempt: null,
          score: puzzleEngine.getScore(500),
          feedback: { tone: 'success', title: i18n.cut.works, detail: i18n.cut.worksDetail },
          feedbackKey: s.feedbackKey + 1,
        }));
        return;
      }

      // Say what is wrong, most telling first: a broken gene, then a band that looks right, then a missing cut
      let attempt: 'inside' | 'impostor' | 'missing';
      let feedback: Feedback;
      if (result.cutsInside.length > 0) {
        attempt = 'inside';
        const names = def.enzymes.filter(e => result.cutsInside.includes(e.id)).map(e => e.label).join(', ');
        feedback = {
          tone: 'error',
          title: fmt(result.cutsInside.length === 1 ? i18n.cut.insideOne : i18n.cut.insideMany, { enzymes: names }),
          detail: i18n.cut.insideHelp,
        };
      } else if (result.impostor) {
        attempt = 'impostor';
        feedback = { tone: 'error', title: i18n.cut.impostor, detail: i18n.cut.impostorHelp };
      } else {
        attempt = 'missing';
        feedback = {
          tone: 'error',
          title: !result.cutAtStart && !result.cutAtEnd ? i18n.cut.missingBoth
            : !result.cutAtStart ? i18n.cut.missingStart : i18n.cut.missingEnd,
          detail: i18n.cut.missingHelp,
        };
      }

      puzzleEngine.recordMistake();
      audioManager.play('connection_wrong');
      set(s => ({
        cutAttempt: attempt,
        feedback,
        feedbackKey: s.feedbackKey + 1,
        wrongConnections: puzzleEngine.getState().wrongConnectionCount,
        score: puzzleEngine.getScore(0),
      }));
    },

    // ─── Assemble mode ────────────────────────────────────────

    asmAdd: (fragment: number) => {
      const { asmOrder, modeSolved } = get();
      if (modeSolved || asmOrder.includes(fragment)) return;
      audioManager.play('node_select');
      set({ asmOrder: [...asmOrder, fragment], asmBad: null });
    },

    asmRemove: (position: number) => {
      const { asmOrder, modeSolved } = get();
      if (modeSolved) return;
      set({ asmOrder: asmOrder.filter((_, i) => i !== position), asmBad: null });
    },

    testAssemble: () => {
      const { currentLevel, asmOrder, puzzleEngine, language } = get();
      const def = currentLevel?.assemble;
      if (!def || !puzzleEngine) return;
      const i18n = t(language);
      const showFeedback = (feedback: Feedback) => set(s => ({ feedback, feedbackKey: s.feedbackKey + 1 }));

      if (asmOrder.length < def.fragments.length) {
        showFeedback({ tone: 'info', title: i18n.assemble.fillAll });
        return;
      }

      const result = evaluateAssembly(def, asmOrder);
      if (result.solved) {
        puzzleEngine.markSolved();
        audioManager.play('simulation_start');
        set(s => ({
          modeSolved: true,
          asmBad: null,
          score: puzzleEngine.getScore(def.fragments.length * 100),
          feedback: { tone: 'success', title: i18n.assemble.works, detail: i18n.assemble.worksDetail },
          feedbackKey: s.feedbackKey + 1,
        }));
        return;
      }

      puzzleEngine.recordMistake();
      audioManager.play('connection_wrong');
      const feedback: Feedback = result.badJoin >= 0
        ? {
            tone: 'error',
            title: fmt(i18n.assemble.wrongJoin, { a: result.badJoin + 1, b: result.badJoin + 2, n: def.minOverlap }),
            detail: i18n.assemble.joinHelp,
          }
        : {
            tone: 'error',
            title: fmt(i18n.assemble.wrongLength, { have: result.merged.length, need: def.sequence.length }),
            detail: i18n.assemble.lengthHelp,
          };
      set(s => ({
        asmBad: result.badJoin,
        feedback,
        feedbackKey: s.feedbackKey + 1,
        wrongConnections: puzzleEngine.getState().wrongConnectionCount,
        score: puzzleEngine.getScore(0),
      }));
    },

    // ─── CRISPR mode ──────────────────────────────────────────

    crisprPick: (guideId: string) => {
      const { crisprGuide, modeSolved } = get();
      if (modeSolved) return;
      audioManager.play('node_select');
      set({ crisprGuide: crisprGuide === guideId ? null : guideId, crisprAttempt: null });
    },

    testCrispr: () => {
      const { currentLevel, crisprGuide, puzzleEngine, language } = get();
      const def = currentLevel?.crispr;
      if (!def || !puzzleEngine) return;
      const i18n = t(language);
      const showFeedback = (feedback: Feedback) => set(s => ({ feedback, feedbackKey: s.feedbackKey + 1 }));

      if (!crisprGuide) {
        showFeedback({ tone: 'info', title: i18n.crispr.pickOne });
        return;
      }

      const { verdict } = evaluateGuide(def, crisprGuide);
      if (verdict === 'perfect') {
        puzzleEngine.markSolved();
        audioManager.play('simulation_start');
        set(s => ({
          modeSolved: true,
          crisprAttempt: null,
          score: puzzleEngine.getScore(500),
          feedback: { tone: 'success', title: i18n.crispr.works, detail: i18n.crispr.worksDetail },
          feedbackKey: s.feedbackKey + 1,
        }));
        return;
      }

      puzzleEngine.recordMistake();
      audioManager.play('connection_wrong');
      set(s => ({
        crisprAttempt: verdict,
        feedback: { tone: 'error', title: i18n.crispr.verdicts[verdict], detail: i18n.crispr.verdictHelp[verdict] },
        feedbackKey: s.feedbackKey + 1,
        wrongConnections: puzzleEngine.getState().wrongConnectionCount,
        score: puzzleEngine.getScore(0),
      }));
    },

    startTour: (mode: LevelMode) => {
      set({ tourMode: mode, tourStep: 0 });
    },

    advanceTour: () => {
      const { tourMode, tourStep } = get();
      if (!tourMode) return;
      if (tourStep + 1 >= TOURS[tourMode].length) get().endTour();
      else set({ tourStep: tourStep + 1 });
    },

    // Finishing or skipping a tutorial means it is not offered again on its own
    endTour: () => {
      const { tourMode } = get();
      if (tourMode && !seenTours().includes(tourMode)) {
        try { localStorage.setItem(SEEN_TOURS_KEY, JSON.stringify([...seenTours(), tourMode])); } catch { /* storage unavailable */ }
      }
      set({ tourMode: null, tourStep: 0 });
    },

    dismissHowToPlay: () => {
      persistence.markTutorialCompleted();
      set({ showHowToPlay: false });
      // The card was in the way of the tutorial of the pathway: start it now
      const { gamePhase, currentLevel } = get();
      if (gamePhase === 'puzzle' && currentLevel && !currentLevel.isTutorial && !seenTours().includes('pathway')) {
        set({ tourMode: 'pathway', tourStep: 0 });
      }
    },

    // ─── Construct mode ───────────────────────────────────────

    pickPart: (partId: string | null) => {
      if (get().modeSolved) return;
      audioManager.play('node_select');
      set(s => ({ selectedPartId: s.selectedPartId === partId ? null : partId, wrongSlot: null }));
    },

    placeInSlot: (index: number) => {
      const { slots, selectedPartId, modeSolved } = get();
      if (modeSolved) return;
      const next = [...slots];
      if (selectedPartId) {
        // A part lives in one slot at a time
        const previous = next.indexOf(selectedPartId);
        if (previous >= 0) next[previous] = null;
        next[index] = selectedPartId;
        audioManager.play('connection_correct');
      } else {
        // Tapping a filled slot with nothing picked returns the part to the tray
        next[index] = null;
      }
      set({ slots: next, selectedPartId: null, wrongSlot: null });
    },

    testConstruct: () => {
      const { currentLevel, slots, puzzleEngine, language } = get();
      const def = currentLevel?.construct;
      if (!def || !puzzleEngine) return;
      const i18n = t(language);
      const showFeedback = (feedback: Feedback) => set(s => ({ feedback, feedbackKey: s.feedbackKey + 1 }));

      if (slots.some(slot => !slot)) {
        showFeedback({ tone: 'info', title: i18n.construct.fillAll });
        return;
      }

      const parts = new Map(def.parts.map(p => [p.id, p]));
      const wrongIndex = slots.findIndex((id, i) => id !== def.solution[i]);

      if (wrongIndex === -1) {
        puzzleEngine.markSolved();
        audioManager.play('simulation_start');
        set(s => ({
          modeSolved: true,
          selectedPartId: null,
          score: puzzleEngine.getScore(def.solution.length * CONSTRUCT_POINTS_PER_SLOT),
          feedback: { tone: 'success', title: i18n.construct.works, detail: i18n.construct.worksDetail },
          feedbackKey: s.feedbackKey + 1,
        }));
        return;
      }

      const placed = parts.get(slots[wrongIndex]!)!;
      const expected = parts.get(def.solution[wrongIndex])!;
      const kinds = i18n.construct.kinds;
      let feedback: Feedback;
      if (placed.wrongReason) {
        feedback = { tone: 'error', title: placed.wrongReason };
      } else if (placed.kind !== expected.kind) {
        feedback = {
          tone: 'error',
          title: fmt(i18n.construct.wrongKind, { n: wrongIndex + 1, expected: kinds[expected.kind], placed: kinds[placed.kind] }),
          detail: i18n.construct.kindHelp[expected.kind],
        };
      } else {
        feedback = { tone: 'error', title: fmt(i18n.construct.wrongPart, { label: placed.label }) };
      }

      puzzleEngine.recordMistake();
      audioManager.play('connection_wrong');
      set(s => ({
        feedback,
        feedbackKey: s.feedbackKey + 1,
        wrongSlot: wrongIndex,
        wrongConnections: puzzleEngine.getState().wrongConnectionCount,
        score: puzzleEngine.getScore(0),
      }));
    },

    // ─── Diagnose mode ────────────────────────────────────────

    accuse: (nodeId: string) => {
      const { currentLevel, nodes, puzzleEngine, faultFound, accusedIds, language } = get();
      const def = currentLevel?.diagnose;
      if (!def || !puzzleEngine || faultFound) return;
      const i18n = t(language);
      const note = def.notes[nodeId]?.text;

      if (def.faultyIds.includes(nodeId)) {
        audioManager.play('connection_correct');
        set(s => ({
          faultFound: true,
          score: puzzleEngine.getScore(DIAGNOSE_POINTS_FAULT),
          feedback: { tone: 'success', title: fmt(i18n.diagnose.found, { label: nodes[nodeId]?.label ?? '' }), detail: note },
          feedbackKey: s.feedbackKey + 1,
        }));
        return;
      }

      if (!accusedIds.includes(nodeId)) puzzleEngine.recordMistake();
      audioManager.play('connection_wrong');
      set(s => ({
        accusedIds: s.accusedIds.includes(nodeId) ? s.accusedIds : [...s.accusedIds, nodeId],
        wrongConnections: puzzleEngine.getState().wrongConnectionCount,
        score: puzzleEngine.getScore(0),
        feedback: {
          tone: 'error',
          title: fmt(i18n.diagnose.notIt, { label: nodes[nodeId]?.label ?? '' }),
          detail: note ?? i18n.diagnose.looksFine,
        },
        feedbackKey: s.feedbackKey + 1,
      }));
    },

    chooseFix: (fixId: string) => {
      const { currentLevel, puzzleEngine, faultFound, modeSolved, fixesTried, language } = get();
      const i18n = t(language);
      const fix = currentLevel?.diagnose?.fixes.find(f => f.id === fixId);
      if (!fix || !puzzleEngine || !faultFound || modeSolved) return;

      if (fix.correct) {
        puzzleEngine.markSolved();
        audioManager.play('simulation_start');
        set(s => ({
          modeSolved: true,
          fixesTried: [...s.fixesTried, fixId],
          score: puzzleEngine.getScore(DIAGNOSE_POINTS_FAULT + DIAGNOSE_POINTS_FIX),
          feedback: { tone: 'success', title: i18n.diagnose.rightFix, detail: `${fix.text} ${fix.reason}` },
          feedbackKey: s.feedbackKey + 1,
        }));
        return;
      }

      if (!fixesTried.includes(fixId)) puzzleEngine.recordMistake();
      audioManager.play('connection_wrong');
      set(s => ({
        fixesTried: s.fixesTried.includes(fixId) ? s.fixesTried : [...s.fixesTried, fixId],
        wrongConnections: puzzleEngine.getState().wrongConnectionCount,
        score: puzzleEngine.getScore(DIAGNOSE_POINTS_FAULT),
        feedback: { tone: 'error', title: i18n.diagnose.wrongFix, detail: `${fix.text} ${fix.reason}` },
        feedbackKey: s.feedbackKey + 1,
      }));
    },
  }))
);
