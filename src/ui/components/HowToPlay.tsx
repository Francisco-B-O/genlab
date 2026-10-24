import React from 'react';
import { useGameStore } from '../../game/GameStore';
import { t } from '../../i18n';

/** Short primer shown before the first puzzle if the tutorial level was skipped. */
export const HowToPlay: React.FC = () => {
  const dismiss = useGameStore(s => s.dismissHowToPlay);
  const loadLevel = useGameStore(s => s.loadLevel);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  return (
    <div className="overlay">
      <div className="card modal">
        <h2 className="display" style={{ fontSize: 26, marginBottom: 8 }}>{i18n.howToPlay.title}</h2>
        {i18n.howToPlay.steps.map((step, i) => (
          <div key={i} className="how-step">
            <span className="how-step__num">{i + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <p className="muted small" style={{ marginTop: 2 }}>{step.text}</p>
            </div>
          </div>
        ))}
        <div className="result__actions">
          <button className="btn btn--ghost" onClick={() => { dismiss(); void loadLevel('tutorial'); }}>
            {i18n.howToPlay.doTutorial}
          </button>
          <button className="btn btn--primary" onClick={dismiss}>{i18n.howToPlay.iKnow}</button>
        </div>
      </div>
    </div>
  );
};
