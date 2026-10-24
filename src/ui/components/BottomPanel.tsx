import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { audioManager } from '../../audio/AudioManager';
import { t, fmt } from '../../i18n';

const STEP_INTERVAL_MS = 900;

export const BottomPanel: React.FC = () => {
  const gamePhase = useGameStore(s => s.gamePhase);
  const simulationState = useGameStore(s => s.simulationState);
  const currentLevel = useGameStore(s => s.currentLevel);
  const satisfied = useGameStore(s => s.satisfiedRequiredIds.length);
  const completeLevel = useGameStore(s => s.completeLevel);
  const resetLevel = useGameStore(s => s.resetLevel);
  const setGamePhase = useGameStore(s => s.setGamePhase);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  // Reveal the active steps one after another
  const [shown, setShown] = useState(0);
  const activeCount = simulationState.steps.filter(s => s.isActive).length;

  useEffect(() => {
    if (gamePhase !== 'simulation') {
      setShown(0);
      return;
    }
    if (shown >= activeCount) return;
    const timer = window.setTimeout(() => {
      setShown(n => n + 1);
      audioManager.play('simulation_step');
    }, shown === 0 ? 300 : STEP_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [gamePhase, shown, activeCount]);

  if (gamePhase !== 'simulation' || !currentLevel) return null;

  // The localized level holds the step texts; the simulation state holds activity
  const stepDefs = [...currentLevel.simulation.steps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const total = currentLevel.puzzle.winCondition.requiredConnectionIds.length;
  const isComplete = satisfied >= total;
  const progress = activeCount > 0 ? Math.min(shown / activeCount, 1) : 1;
  const vars = simulationState.variables;
  const current = shown > 0 ? stepDefs[shown - 1] : undefined;

  const bars = [
    { label: i18n.simulation.variables.geneExpression, value: vars.geneExpression },
    { label: i18n.simulation.variables.enzymeEfficiency, value: vars.enzymeEfficiency },
    { label: i18n.simulation.variables.reactionFlux, value: vars.reactionFlux },
    { label: currentLevel.simulation.productLabel ?? '—', value: vars.metaboliteAccumulation },
  ];

  return (
    <section className="sim">
      <div className="sim__head">
        <span className="eyebrow">{i18n.simulation.title}</span>
        <strong style={{ fontSize: 14.5 }}>
          {isComplete ? i18n.simulation.complete : fmt(i18n.simulation.partial, { done: satisfied, total })}
        </strong>
        <div style={{ flex: 1 }} />
        {isComplete ? (
          <button className="btn btn--primary" onClick={completeLevel} disabled={shown < activeCount}>
            {i18n.simulation.results} <ArrowRight size={15} />
          </button>
        ) : (
          <>
            <button className="btn btn--quiet" onClick={resetLevel}>{i18n.panel.reset}</button>
            <button className="btn btn--primary" onClick={() => setGamePhase('puzzle')}>
              {i18n.hud.phase.puzzle} <ArrowRight size={15} />
            </button>
          </>
        )}
      </div>

      <div className="sim__steps">
        {stepDefs.map((step, i) => {
          const classes = ['sim__step'];
          if (i < shown) classes.push('is-active');
          if (i === shown - 1) classes.push('is-current');
          return (
            <div key={step.id ?? i} className={classes.join(' ')}>
              {i + 1}. {step.label}
            </div>
          );
        })}
      </div>

      {current?.description && <p className="small muted" style={{ marginBottom: 12 }}>{current.description}</p>}

      <div className="sim__bars">
        {bars.map(bar => (
          <div key={bar.label}>
            <div className="sim__bar-label">
              <span>{bar.label}</span>
              <span className="mono">{Math.round(bar.value * progress * 100)}%</span>
            </div>
            <div className="progress"><div style={{ width: `${bar.value * progress * 100}%` }} /></div>
          </div>
        ))}
      </div>
      <p className="faint" style={{ fontSize: 11.5, marginTop: 10 }}>{i18n.simulation.disclaimer}</p>
    </section>
  );
};
