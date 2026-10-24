import React, { useEffect } from 'react';
import { useGameStore, levelMode } from '../../game/GameStore';
import { t } from '../../i18n';

/**
 * Help for the level in play: its goal, how to play its mode step by step, the key words
 * and how points work. It is the same text the guided tutorial uses, in one place that can
 * be read at any time, in the story and in free play alike.
 */
export const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const level = useGameStore(s => s.currentLevel);
  const gamePhase = useGameStore(s => s.gamePhase);
  const startTour = useGameStore(s => s.startTour);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!level) return null;
  const mode = levelMode(level);
  const steps = i18n.tour.steps[mode];
  const terms = i18n.glossary[mode];
  // The first pathway level has its own guided walk-through, so the tour is not offered there
  const canTour = gamePhase === 'puzzle' && !level.isTutorial;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="card modal modal--wide help" role="dialog" aria-modal="true" aria-label={i18n.help.title} onClick={e => e.stopPropagation()}>
        <span className="eyebrow">{i18n.modes[mode]}</span>
        <h2 className="display" style={{ fontSize: 28, margin: '4px 0 6px' }}>{i18n.help.title}</h2>
        <p className="muted">{i18n.modeIntro[mode]}</p>

        <section className="help__section">
          <span className="eyebrow">{i18n.help.goal}</span>
          <p>{level.objective}</p>
        </section>

        <section className="help__section">
          <span className="eyebrow">{i18n.help.howTo}</span>
          <ol className="help__steps">
            {steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </section>

        <section className="help__section">
          <span className="eyebrow">{i18n.help.glossary}</span>
          <dl className="help__terms">
            {terms.map(item => (
              <React.Fragment key={item.term}>
                <dt>{item.term}</dt>
                <dd>{item.def}</dd>
              </React.Fragment>
            ))}
          </dl>
        </section>

        <section className="help__section">
          <span className="eyebrow">{i18n.help.scoringTitle}</span>
          <ul className="help__list">
            {i18n.help.scoring.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        </section>

        <div className="result__actions">
          {canTour && (
            <button className="btn btn--ghost" onClick={() => { onClose(); startTour(mode); }}>
              {i18n.help.tutorial}
            </button>
          )}
          <button className="btn btn--primary" onClick={onClose}>{i18n.help.close}</button>
        </div>
      </div>
    </div>
  );
};
