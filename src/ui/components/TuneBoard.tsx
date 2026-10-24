import React from 'react';
import { ArrowRight, FlaskConical, RotateCcw } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { evaluateTune } from '../../game/modes/logic';
import { t, fmt } from '../../i18n';
import { FeedbackToast } from './FeedbackToast';
import { TourCard } from './TourCard';

const Meter: React.FC<{ label: string; value: number; max: number; marker?: number; display: string; ok?: boolean }> = ({
  label, value, max, marker, display, ok,
}) => (
  <div>
    <div className="sim__bar-label"><span>{label}</span><span className="mono">{display}</span></div>
    <div className="meter">
      <div className={ok ? 'is-ok' : ''} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      {marker !== undefined && <i style={{ left: `${Math.min(100, (marker / max) * 100)}%` }} />}
    </div>
  </div>
);

/** "Tune the factory": pick one option per setting, within a budget, to hit a target. */
export const TuneBoard: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const choices = useGameStore(s => s.tuneChoices);
  const tuneResult = useGameStore(s => s.tuneResult);
  const modeSolved = useGameStore(s => s.modeSolved);
  const setTune = useGameStore(s => s.setTune);
  const testTune = useGameStore(s => s.testTune);
  const resetLevel = useGameStore(s => s.resetLevel);
  const completeLevel = useGameStore(s => s.completeLevel);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  const def = currentLevel?.tune;
  if (!def) return null;

  // Live cost of the current choices, even before everything is chosen
  const live = evaluateTune(def, choices);
  const over = live.cost > def.budget;
  const shown = tuneResult ?? live;
  const maxResult = def.target * 1.6;

  return (
    <main className="board graph-paper construct">
      <div className={`board__instruction${modeSolved ? '' : ' is-pending'}`}>
        {modeSolved ? i18n.tune.works : i18n.tune.chooseAll}
      </div>

      <div className="construct__inner">
        <TourCard />
        <div data-tour-el="budget" className="card tune__status">
          <Meter
            label={i18n.tune.budget}
            value={live.cost}
            max={def.budget}
            display={`${live.cost} / ${def.budget}`}
            ok={!over}
          />
          {tuneResult && (
            <>
              <Meter label={def.labels?.perCell ?? i18n.tune.perCell} value={tuneResult.perCell} max={6} display={`×${tuneResult.perCell.toFixed(1)}`} />
              <Meter label={def.labels?.growth ?? i18n.tune.growth} value={tuneResult.growth} max={1.2} display={`×${tuneResult.growth.toFixed(2)}`} />
              <Meter
                label={`${i18n.tune.result} (${def.metricLabel})`}
                value={tuneResult.result}
                max={maxResult}
                marker={def.target}
                display={`${tuneResult.result} ${def.unit} · ${i18n.tune.target} ${def.target}`}
                ok={tuneResult.reachesTarget}
              />
            </>
          )}
          {!tuneResult && (
            <p className="small faint">{def.metricLabel}: {i18n.tune.target} {def.target} {def.unit}</p>
          )}
        </div>

        {def.knobs.map(knob => (
          <section key={knob.id} data-tour-el="knobs" className="knob">
            <span className="eyebrow">{knob.label}</span>
            <div className="knob__options">
              {knob.options.map(option => {
                const selected = choices[knob.id] === option.id;
                return (
                  <button
                    key={option.id}
                    className={`opt${selected ? ' is-selected' : ''}`}
                    onClick={() => setTune(knob.id, option.id)}
                    disabled={modeSolved}
                    aria-pressed={selected}
                  >
                    <strong>{option.label}</strong>
                    <span className="muted small">{option.description}</span>
                    <span className="mono small opt__cost">{fmt(i18n.tune.cost + ': {n}', { n: option.cost })}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <div className="construct__actions">
          {modeSolved ? (
            <button className="btn btn--primary" onClick={completeLevel}>
              {i18n.simulation.results} <ArrowRight size={15} />
            </button>
          ) : (
            <>
              <button data-tour-el="test" className="btn btn--primary" onClick={testTune}>
                <FlaskConical size={15} /> {i18n.tune.test}
              </button>
              <button className="btn btn--quiet" onClick={resetLevel}>
                <RotateCcw size={14} /> {i18n.construct.clear}
              </button>
            </>
          )}
        </div>
      </div>

      <FeedbackToast />
    </main>
  );
};
