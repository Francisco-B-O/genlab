import type { ScoreBreakdown } from '../types/game.types';
import {
  BONUS_NO_HINTS,
  BONUS_NO_PENALTIES,
  PENALTY_WRONG_CONNECTION,
  PENALTY_HINT_LEVEL_1,
  PENALTY_HINT_LEVEL_2,
  PENALTY_HINT_LEVEL_3,
} from '../types/game.types';

export interface ScoreInput {
  base: number;
  bonusOptional?: number;
  hintsUsed: { 1: boolean; 2: boolean; 3: boolean };
  mistakes: number;
  startedAt: number;
  /** When the level was solved; null while still in progress. */
  completedAt: number | null;
}

/**
 * Shared scoring rules for every kind of level.
 * End-of-level bonuses only count once the level is solved, and the total is
 * not clamped at 0, so hints and mistakes always cost points.
 */
export function computeScore(input: ScoreInput): ScoreBreakdown {
  const complete = input.completedAt !== null;
  const noHints = !input.hintsUsed[1] && !input.hintsUsed[2] && !input.hintsUsed[3];

  const bonusNoHints = complete && noHints ? BONUS_NO_HINTS : 0;
  const bonusNoPenalties = complete && input.mistakes === 0 ? BONUS_NO_PENALTIES : 0;

  const elapsedMinutes = ((input.completedAt ?? Date.now()) - input.startedAt) / 60000;
  const bonusSpeed = !complete ? 0 : elapsedMinutes < 5 ? 200 : elapsedMinutes < 10 ? 100 : 0;

  const hintPenalties =
    (input.hintsUsed[1] ? PENALTY_HINT_LEVEL_1 : 0) +
    (input.hintsUsed[2] ? PENALTY_HINT_LEVEL_2 : 0) +
    (input.hintsUsed[3] ? PENALTY_HINT_LEVEL_3 : 0);
  const penalties = hintPenalties + input.mistakes * PENALTY_WRONG_CONNECTION;

  const bonusOptional = input.bonusOptional ?? 0;
  const base = input.base;

  return {
    base,
    bonusNoHints,
    bonusNoPenalties,
    bonusSpeed,
    bonusOptional,
    penalties,
    total: base + bonusNoHints + bonusNoPenalties + bonusSpeed + bonusOptional + penalties,
  };
}
