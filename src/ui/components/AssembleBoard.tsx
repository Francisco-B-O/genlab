import React, { useMemo } from 'react';
import { ArrowRight, FlaskConical, RotateCcw } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { mergeFragments, overlapLength, shuffled } from '../../game/modes/logic';
import { t, fmt } from '../../i18n';
import { FeedbackToast } from './FeedbackToast';
import { TourCard } from './TourCard';

/** "Assemble": put overlapping fragments in order to rebuild a whole sequence, as genome sequencing does. */
export const AssembleBoard: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const placed = useGameStore(s => s.asmOrder);
  const bad = useGameStore(s => s.asmBad);
  const modeSolved = useGameStore(s => s.modeSolved);
  const asmAdd = useGameStore(s => s.asmAdd);
  const asmRemove = useGameStore(s => s.asmRemove);
  const testAssemble = useGameStore(s => s.testAssemble);
  const resetLevel = useGameStore(s => s.resetLevel);
  const completeLevel = useGameStore(s => s.completeLevel);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  const def = currentLevel?.assemble;
  const display = useMemo(
    () => (def ? shuffled(def.fragments.map((_, i) => i), currentLevel?.id ?? '') : []),
    [def, currentLevel?.id],
  );
  if (!def) return null;

  const total = def.fragments.length;
  const tray = display.filter(i => !placed.includes(i));
  const allPlaced = placed.length === total;
  const merged = mergeFragments(placed.map(i => def.fragments[i]));

  return (
    <main className="board graph-paper construct">
      <div className={`board__instruction${!modeSolved && !allPlaced ? ' is-pending' : ''}`}>
        {modeSolved ? i18n.assemble.works : allPlaced ? i18n.assemble.allPlaced : i18n.assemble.tapFragment}
      </div>

      <div className="construct__inner">
        <TourCard />
        <p className="hand pair__story">{def.story}</p>
        <p className="muted small" style={{ marginBottom: 8 }}>{fmt(i18n.assemble.goal, { n: def.sequence.length })}</p>

        <div className="construct__head">
          <span className="eyebrow">{i18n.assemble.chain}</span>
        </div>
        <ol data-tour-el="list" className="asm">
          {Array.from({ length: total }, (_, pos) => {
            const index = placed[pos];
            const fragment = index === undefined ? undefined : def.fragments[index];
            if (fragment === undefined) {
              return (
                <li key={pos} className="asm__item is-empty">
                  <span className="asm__num">{pos + 1}</span>
                  <span className="faint small">{fmt(i18n.assemble.position, { n: pos + 1 })}</span>
                </li>
              );
            }
            const previous = pos > 0 ? def.fragments[placed[pos - 1]] : undefined;
            const shared = previous ? overlapLength(previous, fragment) : 0;
            const classes = ['asm__item'];
            if (previous && shared < def.minOverlap) classes.push('is-weak');
            if (bad === pos || bad === pos - 1) classes.push('is-wrong');
            if (modeSolved) classes.push('is-done');
            return (
              <li key={pos} className={classes.join(' ')} onClick={() => !modeSolved && asmRemove(pos)}>
                <span className="asm__num">{pos + 1}</span>
                <span className="asm__text mono">
                  {shared > 0 && <span className="asm__overlap">{fragment.slice(0, shared)}</span>}
                  {fragment.slice(shared)}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="construct__head" style={{ marginTop: 14 }}>
          <span className="eyebrow">{i18n.assemble.preview}</span>
          <span className="mono small faint">{fmt(i18n.assemble.letters, { have: merged.length, need: def.sequence.length })}</span>
        </div>
        <div data-tour-el="goal" className={`asm__preview mono${modeSolved ? ' is-done' : ''}`}>
          {merged || '…'}
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
              <button data-tour-el="test" className="btn btn--primary" onClick={testAssemble} disabled={!allPlaced}>
                <FlaskConical size={15} /> {i18n.assemble.test}
              </button>
              <button className="btn btn--quiet" onClick={resetLevel}>
                <RotateCcw size={14} /> {i18n.assemble.clear}
              </button>
            </div>

            {tray.length > 0 && (
              <>
                <div className="construct__head" style={{ marginTop: 18 }}>
                  <span className="eyebrow">{i18n.assemble.tray}</span>
                </div>
                <div data-tour-el="tray" className="asm__tray">
                  {tray.map(i => (
                    <button key={i} className="asm__frag mono" onClick={() => asmAdd(i)}>
                      {def.fragments[i]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <FeedbackToast />
    </main>
  );
};
