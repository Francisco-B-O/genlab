import type { LevelMode } from '../types/level.types';
import type { GameState } from './GameStore';

/**
 * One step of the guided tutorial of a level mode. The text lives in the i18n files
 * (`tour.steps[mode][index]`). A step with `done` moves on by itself once the player
 * has done what it asks; a step without it waits for the Next button.
 * `target` names the part of the board to highlight (`data-tour-el` in the boards).
 */
export interface TourStep {
  target?: string;
  done?: (s: GameState) => boolean;
}

export const TOURS: Record<LevelMode, TourStep[]> = {
  pathway: [
    { target: 'pieces' },
    { target: 'pieces', done: s => s.pendingSourceId !== null || s.satisfiedRequiredIds.length > 0 },
    { target: 'pieces', done: s => s.satisfiedRequiredIds.length > 0 },
    { target: 'zoom' },
    { target: 'simulate', done: s => s.gamePhase !== 'puzzle' },
  ],
  construct: [
    { target: 'strip' },
    { target: 'tray', done: s => s.selectedPartId !== null || s.slots.some(Boolean) },
    { target: 'strip', done: s => s.slots.some(Boolean) },
    { target: 'strip', done: s => s.slots.length > 0 && s.slots.every(Boolean) },
    { target: 'test', done: s => s.wrongSlot !== null || s.modeSolved },
  ],
  diagnose: [
    {},
    { target: 'pieces', done: s => s.selectedNodeId !== null },
    { target: 'accuse', done: s => s.faultFound },
    { target: 'fixes', done: s => s.fixesTried.length > 0 || s.modeSolved },
  ],
  sequence: [
    { target: 'list' },
    { target: 'tray', done: s => s.seqOrder.length >= 1 },
    { target: 'list' },
    { target: 'tray', done: s => s.seqOrder.length >= (s.currentLevel?.sequence?.steps.length ?? Infinity) },
    { target: 'test', done: s => s.seqWrong !== null || s.modeSolved },
  ],
  inherit: [
    { target: 'parents' },
    { target: 'square' },
    { target: 'square', done: s => s.inheritCells.some(Boolean) || s.inheritStage === 'question' },
    { target: 'check', done: s => s.inheritStage === 'question' || s.inheritIndex > 0 },
    { target: 'answers', done: s => s.inheritAnswered || s.inheritIndex > 0 || s.modeSolved },
  ],
  mutation: [
    { target: 'healthy' },
    { target: 'patient' },
    { target: 'patient', done: s => s.mutFound },
    { target: 'effects', done: s => s.modeSolved },
  ],
  pairing: [
    { target: 'template' },
    { target: 'tray', done: s => s.pairAnswer.some(Boolean) },
    { target: 'slots', done: s => s.pairAnswer.length > 0 && s.pairAnswer.every(Boolean) },
    { target: 'test', done: s => s.pairWrong.length > 0 || s.modeSolved },
  ],
  cut: [
    { target: 'map' },
    { target: 'enzymes', done: s => s.cutChosen.length > 0 },
    { target: 'gel' },
    { target: 'test', done: s => s.modeSolved || s.cutAttempt !== null },
  ],
  assemble: [
    { target: 'tray' },
    { target: 'tray', done: s => s.asmOrder.length >= 1 },
    { target: 'list', done: s => s.asmOrder.length >= 2 },
    { target: 'list', done: s => s.asmOrder.length >= (s.currentLevel?.assemble?.fragments.length ?? Infinity) },
    { target: 'test', done: s => s.modeSolved || s.asmBad !== null },
  ],
  crispr: [
    { target: 'genome' },
    { target: 'guides', done: s => s.crisprGuide !== null },
    { target: 'genome' },
    { target: 'test', done: s => s.modeSolved || s.crisprAttempt !== null },
  ],
  tune: [
    { target: 'budget' },
    { target: 'knobs' },
    {
      target: 'knobs',
      done: s => {
        const knobs = s.currentLevel?.tune?.knobs ?? [];
        return knobs.length > 0 && knobs.every(k => s.tuneChoices[k.id] !== undefined);
      },
    },
    { target: 'test', done: s => s.tuneResult !== null || s.modeSolved },
  ],
};

/**
 * Every mode shows its tutorial the first time it is played, and it can be replayed on
 * demand. The exception is the very first pathway level, which has its own guided
 * walk-through (and the "how to play" card for those who skip it).
 */
