import React, { useEffect, useState } from 'react';
import { ArrowRight, FlaskConical, RotateCcw } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { t, fmt } from '../../i18n';
import type { ConstructPart, PartKind } from '../../types/level.types';
import { FeedbackToast } from './FeedbackToast';
import { TourCard } from './TourCard';

// One ink colour per kind of DNA part
export const PART_INK: Record<PartKind, string> = {
  promoter: '#2f7d4f',
  rbs: '#a87a0c',
  signal: '#8b3a7e',
  gene: '#2f5fa8',
  terminator: '#b4382b',
};

/** Small glyph for each part kind, in the style of genetic-circuit diagrams. */
export const PartGlyph: React.FC<{ kind: PartKind; size?: number }> = ({ kind, size = 22 }) => {
  const c = PART_INK[kind];
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: c, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (kind) {
    case 'promoter': // bent arrow
      return <svg {...common}><path d="M5 20V9h11" /><path d="M13 5l4 4-4 4" /></svg>;
    case 'rbs': // half circle
      return <svg {...common}><path d="M5 18a7 7 0 0 1 14 0Z" fill={c} fillOpacity={0.2} /></svg>;
    case 'signal': // tag
      return <svg {...common}><path d="M4 7h10l5 5-5 5H4Z" fill={c} fillOpacity={0.15} /><circle cx="8" cy="12" r="1.3" fill={c} /></svg>;
    case 'gene': // block arrow
      return <svg {...common}><path d="M3 8h12V5l6 7-6 7v-3H3Z" fill={c} fillOpacity={0.2} /></svg>;
    case 'terminator': // T
      return <svg {...common}><path d="M12 20V7M6 7h12" /></svg>;
  }
};

const PartCard: React.FC<{
  part: ConstructPart;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
}> = ({ part, selected, compact, onClick }) => {
  const language = useGameStore(s => s.language);
  const i18n = t(language);
  return (
    <button
      className={`part${selected ? ' is-selected' : ''}${compact ? ' part--compact' : ''}`}
      style={{ borderTopColor: PART_INK[part.kind] }}
      onClick={onClick}
    >
      <PartGlyph kind={part.kind} />
      <span className="part__kind" style={{ color: PART_INK[part.kind] }}>{i18n.construct.kinds[part.kind]}</span>
      <span className="part__label">{part.label}</span>
    </button>
  );
};

/** Steps of the "what happens next" list, revealed one by one after success. */
const SuccessSteps: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const completeLevel = useGameStore(s => s.completeLevel);
  const language = useGameStore(s => s.language);
  const i18n = t(language);
  const steps = [...(currentLevel?.simulation.steps ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown >= steps.length) return;
    const timer = window.setTimeout(() => setShown(n => n + 1), shown === 0 ? 400 : 800);
    return () => window.clearTimeout(timer);
  }, [shown, steps.length]);

  return (
    <div className="card construct__success">
      <span className="eyebrow">{i18n.construct.whatNow}</span>
      <ol>
        {steps.map((step, i) => (
          <li key={step.id ?? i} className={i < shown ? 'is-shown' : ''}>
            <strong>{step.label}.</strong> <span className="muted">{step.description}</span>
          </li>
        ))}
      </ol>
      <button className="btn btn--primary" onClick={completeLevel} disabled={shown < steps.length}>
        {i18n.simulation.results} <ArrowRight size={15} />
      </button>
    </div>
  );
};

export const ConstructBoard: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const slots = useGameStore(s => s.slots);
  const selectedPartId = useGameStore(s => s.selectedPartId);
  const wrongSlot = useGameStore(s => s.wrongSlot);
  const modeSolved = useGameStore(s => s.modeSolved);
  const pickPart = useGameStore(s => s.pickPart);
  const placeInSlot = useGameStore(s => s.placeInSlot);
  const testConstruct = useGameStore(s => s.testConstruct);
  const resetLevel = useGameStore(s => s.resetLevel);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  const def = currentLevel?.construct;
  if (!def) return null;

  const parts = new Map(def.parts.map(p => [p.id, p]));
  const placed = new Set(slots.filter(Boolean) as string[]);
  const tray = def.parts.filter(p => !placed.has(p.id));
  const allFilled = slots.every(Boolean);

  return (
    <main className="board graph-paper construct">
      <div className={`board__instruction${selectedPartId ? ' is-pending' : ''}`}>
        {modeSolved ? i18n.construct.works : selectedPartId ? i18n.construct.tapSlot : i18n.construct.tapPart}
      </div>

      <div className="construct__inner">
        <TourCard />
        <div className="construct__head">
          <span className="eyebrow">{i18n.construct.strip}</span>
          <span className="hand faint">{i18n.construct.readingOrder} →</span>
        </div>

        <div data-tour-el="strip" className={`construct__strip${modeSolved ? ' is-reading' : ''}`}>
          {slots.map((partId, i) => {
            const part = partId ? parts.get(partId) : undefined;
            const classes = ['slot'];
            if (!part) classes.push('is-empty');
            if (selectedPartId && !modeSolved) classes.push('is-target');
            if (wrongSlot === i) classes.push('is-wrong');
            return (
              <div key={i} className={classes.join(' ')} onClick={() => !modeSolved && placeInSlot(i)}>
                <span className="slot__num mono">{fmt(i18n.construct.slot, { n: i + 1 })}</span>
                {part ? <PartCard part={part} compact /> : <span className="slot__empty">{i18n.construct.empty}</span>}
              </div>
            );
          })}
        </div>

        {modeSolved ? (
          <SuccessSteps />
        ) : (
          <>
            <div className="construct__actions">
              <button data-tour-el="test" className="btn btn--primary" onClick={testConstruct} disabled={!allFilled}>
                <FlaskConical size={15} /> {i18n.construct.test}
              </button>
              <button className="btn btn--quiet" onClick={resetLevel}>
                <RotateCcw size={14} /> {i18n.construct.clear}
              </button>
            </div>

            <div className="construct__head" style={{ marginTop: 18 }}>
              <span className="eyebrow">{i18n.construct.tray}</span>
            </div>
            <div data-tour-el="tray" className="construct__tray">
              {tray.map(part => (
                <PartCard
                  key={part.id}
                  part={part}
                  selected={selectedPartId === part.id}
                  onClick={() => pickPart(part.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <FeedbackToast />
    </main>
  );
};
