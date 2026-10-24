import React, { useState } from 'react';
import { useGameStore } from '../../game/GameStore';
import type { HintResult } from '../../types/game.types';
import { t, fmt } from '../../i18n';
import {
  PENALTY_HINT_LEVEL_1, PENALTY_HINT_LEVEL_2, PENALTY_HINT_LEVEL_3,
} from '../../types/game.types';

const COST = { 1: -PENALTY_HINT_LEVEL_1, 2: -PENALTY_HINT_LEVEL_2, 3: -PENALTY_HINT_LEVEL_3 };

export const HintSystem: React.FC = () => {
  const useHint = useGameStore(s => s.useHint);
  const hintsUsed = useGameStore(s => s.hintsUsed);
  const currentLevel = useGameStore(s => s.currentLevel);
  const levelId = currentLevel?.id;
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  const [revealed, setRevealed] = useState<Record<string, HintResult>>({});
  const [openLevel, setOpenLevel] = useState<1 | 2 | 3 | null>(null);

  // Hints revealed on a previous level should not carry over
  const [forLevel, setForLevel] = useState(levelId);
  if (forLevel !== levelId) {
    setForLevel(levelId);
    setRevealed({});
    setOpenLevel(null);
  }
  // Reset after the level is restarted
  if (hintsUsed === 0 && Object.keys(revealed).length > 0) {
    setRevealed({});
    setOpenLevel(null);
  }

  const labels = { 1: i18n.hints.level1, 2: i18n.hints.level2, 3: i18n.hints.level3 };

  const handle = (level: 1 | 2 | 3) => {
    if (!revealed[level]) {
      const hint = useHint(level);
      if (hint) setRevealed(r => ({ ...r, [level]: hint }));
    }
    setOpenLevel(openLevel === level ? null : level);
  };

  // Re-read hint text in the current language after a language switch
  const textFor = (level: 1 | 2 | 3) =>
    currentLevel?.hints.find(h => h.level === level)?.content ?? revealed[level]?.content;

  return (
    <div>
      <div className="hint-buttons">
        {([1, 2, 3] as const).map(level => (
          <button key={level} className="hint-btn" onClick={() => handle(level)}>
            <span>{level}. {labels[level]}</span>
            <span className="mono small faint">
              {revealed[level] ? '✓' : fmt(i18n.hints.cost, { points: COST[level] })}
            </span>
          </button>
        ))}
      </div>
      {openLevel && revealed[openLevel] && (
        <div className="hint-text">{textFor(openLevel)}</div>
      )}
    </div>
  );
};
