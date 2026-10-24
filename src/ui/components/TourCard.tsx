import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../game/GameStore';
import { TOURS } from '../../game/tours';
import { t, fmt } from '../../i18n';

/**
 * Step-by-step tutorial of a level mode, in the style of the guide of the first level:
 * it highlights what to tap, moves on by itself when the player does it, and can be skipped.
 */
export const TourCard: React.FC = () => {
  const mode = useGameStore(s => s.tourMode);
  const stepIndex = useGameStore(s => s.tourStep);
  const gamePhase = useGameStore(s => s.gamePhase);
  const modeSolved = useGameStore(s => s.modeSolved);
  const advance = useGameStore(s => s.advanceTour);
  const end = useGameStore(s => s.endTour);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  const steps = mode ? TOURS[mode] : undefined;
  const step = steps?.[stepIndex];
  const done = useGameStore(s => !!step?.done?.(s));
  const active = !!step && gamePhase === 'puzzle' && !modeSolved;

  // The player already did what this step asks: move on
  useEffect(() => {
    if (active && done) advance();
  }, [active, done, stepIndex, advance]);

  // A solved level (or a pathway that went on to the simulation) needs no more explaining
  const finished = modeSolved || gamePhase === 'simulation' || gamePhase === 'complete';
  useEffect(() => {
    if (mode && finished) end();
  }, [mode, finished, end]);

  // Tell the board which part to highlight (see `data-tour-el` in the boards and index.css)
  const target = active ? step?.target : undefined;
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!target) return;
    document.body.dataset.tourOn = target;
    // On a phone the highlighted part can be off screen: scroll it just under the card
    const frame = requestAnimationFrame(() => {
      const card = cardRef.current;
      const el = document.querySelector(`[data-tour-el="${target}"]`);
      const scroller = el?.closest<HTMLElement>('.construct');
      if (!card || !el || !scroller) return;
      const c = card.getBoundingClientRect();
      const e = el.getBoundingClientRect();
      const s = scroller.getBoundingClientRect();
      if (e.top < c.bottom || e.bottom > s.bottom - 8) {
        scroller.scrollTo({ top: scroller.scrollTop + e.top - (c.bottom + 12), behavior: 'smooth' });
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      delete document.body.dataset.tourOn;
    };
  }, [target, stepIndex]);

  if (!active || !mode || !steps || !step) return null;
  const text = i18n.tour.steps[mode]?.[stepIndex];
  if (!text) return null;
  const isLast = stepIndex === steps.length - 1;

  return (
    <div ref={cardRef} className="card guide tour" role="status">
      <div className="tour__head">
        <span className="eyebrow">{i18n.modes[mode]}</span>
        <span className="mono small faint">{fmt(i18n.guide.step, { n: stepIndex + 1, total: steps.length })}</span>
      </div>
      <p className="guide__text">{text}</p>
      <div className="tour__actions">
        {step.done ? (
          <span className="hand tour__wait">{i18n.tour.waiting}</span>
        ) : (
          <button className="btn btn--primary" onClick={advance}>
            {isLast ? i18n.tour.finish : i18n.tour.next}
          </button>
        )}
        <button className="btn btn--quiet" onClick={end}>{i18n.tour.skip}</button>
      </div>
    </div>
  );
};
