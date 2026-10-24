import React, { useMemo } from 'react';
import { ArrowRight, FlaskConical, RotateCcw } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { codons, pairChoices, pairSlotCount } from '../../game/modes/logic';
import { t } from '../../i18n';
import { FeedbackToast } from './FeedbackToast';
import { TourCard } from './TourCard';

// One ink colour per base, so the strands are easy to read
const BASE_INK: Record<string, string> = {
  A: '#2f7d4f',
  T: '#b4382b',
  U: '#b4382b',
  C: '#2f5fa8',
  G: '#a87a0c',
};

/** "Pair the bases": complete a strand from its template, one base (or codon) at a time. */
export const PairBoard: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const answer = useGameStore(s => s.pairAnswer);
  const active = useGameStore(s => s.pairActive);
  const wrong = useGameStore(s => s.pairWrong);
  const modeSolved = useGameStore(s => s.modeSolved);
  const pairSelect = useGameStore(s => s.pairSelect);
  const pairPlace = useGameStore(s => s.pairPlace);
  const testPairs = useGameStore(s => s.testPairs);
  const resetLevel = useGameStore(s => s.resetLevel);
  const completeLevel = useGameStore(s => s.completeLevel);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  const def = currentLevel?.pairing;
  const choices = useMemo(() => (def ? pairChoices(def, currentLevel?.id ?? '') : []), [def, currentLevel?.id]);
  if (!def) return null;

  const count = pairSlotCount(def);
  const topCells = def.kind === 'protein' ? codons(def.template) : [...def.template];
  const allFilled = answer.length === count && answer.every(Boolean);
  const label = (value: string) => (value === 'Stop' ? i18n.mutation.stop : value);
  const bases = (text: string) =>
    [...text].map((b, i) => <span key={i} className="base mono is-static" style={{ color: BASE_INK[b] }}>{b}</span>);

  return (
    <main className="board graph-paper construct">
      <div className={`board__instruction${!modeSolved && !allFilled ? ' is-pending' : ''}`}>
        {modeSolved ? i18n.pairing.works[def.kind] : allFilled ? i18n.pairing.allFilled : i18n.pairing.tapBase[def.kind]}
      </div>

      <div className="construct__inner">
        <TourCard />
        <p className="hand pair__story">{def.story}</p>

        <div className="pair__legend">
          <span className="eyebrow">▲ {i18n.pairing.template[def.kind]}</span>
          <span className="eyebrow">▼ {i18n.pairing.answer[def.kind]}</span>
        </div>

        <div className="pair">
          {topCells.map((cell, i) => {
            const value = answer[i];
            const classes = ['pair__slot', 'mono'];
            if (value) classes.push('is-filled');
            if (active === i && !modeSolved) classes.push('is-active');
            if (wrong.includes(i)) classes.push('is-wrong');
            if (modeSolved) classes.push('is-done');
            return (
              <div key={i} className="pair__col">
                <div data-tour-el="template" className="pair__top">{bases(cell)}</div>
                <span className="pair__rung" />
                <button
                  data-tour-el="slots"
                  className={classes.join(' ')}
                  style={def.kind !== 'protein' && value ? { color: BASE_INK[value] } : undefined}
                  onClick={() => pairSelect(i)}
                  disabled={modeSolved}
                  aria-label={`${i + 1}`}
                >
                  {value ? label(value) : ''}
                </button>
              </div>
            );
          })}
        </div>

        {modeSolved ? (
          <div className="construct__actions">
            <button className="btn btn--primary" onClick={completeLevel}>
              {i18n.simulation.results} <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <>
            <div className="construct__actions">
              <button data-tour-el="test" className="btn btn--primary" onClick={testPairs} disabled={!allFilled}>
                <FlaskConical size={15} /> {i18n.pairing.test}
              </button>
              <button className="btn btn--quiet" onClick={resetLevel}>
                <RotateCcw size={14} /> {i18n.pairing.clear}
              </button>
            </div>

            <div className="construct__head" style={{ marginTop: 18 }}>
              <span className="eyebrow">{i18n.pairing.tray[def.kind]}</span>
            </div>
            <div data-tour-el="tray" className="pair__tray">
              {choices.map(choice => (
                <button
                  key={choice}
                  className="pair__choice mono"
                  style={def.kind !== 'protein' ? { color: BASE_INK[choice] } : undefined}
                  onClick={() => pairPlace(choice)}
                >
                  {label(choice)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <FeedbackToast />
    </main>
  );
};
