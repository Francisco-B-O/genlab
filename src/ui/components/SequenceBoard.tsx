import React, { useMemo } from 'react';
import { ArrowRight, FlaskConical, RotateCcw } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { shuffled } from '../../game/modes/logic';
import { t, fmt } from '../../i18n';
import { FeedbackToast } from './FeedbackToast';
import { TourCard } from './TourCard';

/** "Order the process": place the steps of a real process in the right order. */
export const SequenceBoard: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const seqOrder = useGameStore(s => s.seqOrder);
  const seqWrong = useGameStore(s => s.seqWrong);
  const modeSolved = useGameStore(s => s.modeSolved);
  const seqAdd = useGameStore(s => s.seqAdd);
  const seqRemove = useGameStore(s => s.seqRemove);
  const testSequence = useGameStore(s => s.testSequence);
  const resetLevel = useGameStore(s => s.resetLevel);
  const completeLevel = useGameStore(s => s.completeLevel);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  const def = currentLevel?.sequence;
  const steps = def?.steps ?? [];
  const order = useMemo(() => shuffled(steps.map(s => s.id), currentLevel?.id ?? ''), [steps, currentLevel?.id]);
  if (!def) return null;

  const byId = new Map(steps.map(s => [s.id, s]));
  const tray = order.filter(id => !seqOrder.includes(id));
  const allPlaced = seqOrder.length === steps.length;

  return (
    <main className="board graph-paper construct">
      <div className={`board__instruction${!modeSolved && tray.length ? ' is-pending' : ''}`}>
        {modeSolved ? i18n.sequence.works : allPlaced ? i18n.sequence.allPlaced : i18n.sequence.tapStep}
      </div>

      <div className="construct__inner">
        <TourCard />
        <div className="construct__head">
          <span className="eyebrow">{modeSolved ? i18n.sequence.result : i18n.sequence.yourOrder}</span>
        </div>

        <ol data-tour-el="list" className="seq">
          {steps.map((_, i) => {
            const id = seqOrder[i];
            const step = id ? byId.get(id) : undefined;
            const classes = ['seq__item'];
            if (!step) classes.push('is-empty');
            if (seqWrong === i) classes.push('is-wrong');
            if (modeSolved) classes.push('is-done');
            return (
              <li key={i} className={classes.join(' ')} onClick={() => !modeSolved && step && seqRemove(i)}>
                <span className="seq__num">{i + 1}</span>
                {step ? (
                  <span>
                    <strong>{step.label}</strong>
                    {modeSolved && <span className="muted small" style={{ display: 'block' }}>{step.description}</span>}
                  </span>
                ) : (
                  <span className="faint">{fmt(i18n.sequence.step, { n: i + 1 })}</span>
                )}
              </li>
            );
          })}
        </ol>

        {modeSolved ? (
          <div className="construct__actions">
            <button className="btn btn--primary" onClick={completeLevel}>
              {i18n.simulation.results} <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <>
            <div className="construct__actions">
              <button data-tour-el="test" className="btn btn--primary" onClick={testSequence} disabled={!allPlaced}>
                <FlaskConical size={15} /> {i18n.sequence.test}
              </button>
              <button className="btn btn--quiet" onClick={resetLevel}>
                <RotateCcw size={14} /> {i18n.sequence.clear}
              </button>
            </div>

            {tray.length > 0 && (
              <>
                <div className="construct__head" style={{ marginTop: 18 }}>
                  <span className="eyebrow">{i18n.sequence.tray}</span>
                </div>
                <div data-tour-el="tray" className="seq__tray">
                  {tray.map(id => (
                    <button key={id} className="step-card" onClick={() => seqAdd(id)}>
                      {byId.get(id)!.label}
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
