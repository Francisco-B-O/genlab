import React from 'react';
import { ArrowRight, Scissors, RotateCcw } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { evaluateGuide } from '../../game/modes/logic';
import { t, fmt } from '../../i18n';
import { FeedbackToast } from './FeedbackToast';
import { TourCard } from './TourCard';

/** "CRISPR": choose the guide that makes Cas9 cut only inside the gene to edit. */
export const CrisprBoard: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const guideId = useGameStore(s => s.crisprGuide);
  const modeSolved = useGameStore(s => s.modeSolved);
  const crisprPick = useGameStore(s => s.crisprPick);
  const testCrispr = useGameStore(s => s.testCrispr);
  const resetLevel = useGameStore(s => s.resetLevel);
  const completeLevel = useGameStore(s => s.completeLevel);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  const def = currentLevel?.crispr;
  if (!def) return null;

  const guide = def.guides.find(g => g.id === guideId);
  const result = guide ? evaluateGuide(def, guide.id) : null;
  const length = guide?.sequence.length ?? 0;
  const sites = result?.sites ?? [];

  const letters = [...def.genome].map((base, i) => {
    const classes = ['crispr__base', 'mono'];
    if (i >= def.target.start && i < def.target.end) classes.push('is-gene');
    const site = sites.find(s => i >= s.index && i < s.index + length);
    if (site) {
      classes.push('is-site', site.pam ? 'is-cut' : 'is-nocut');
      if (guide && guide.sequence[i - site.index] !== base) classes.push('is-mismatch');
    }
    if (sites.some(s => s.pam && i >= s.index + length && i < s.index + length + 3)) classes.push('is-pam');
    return <span key={i} className={classes.join(' ')}>{base}</span>;
  });
  // Blocks of ten letters, so the strand reads as a ruler
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < letters.length; i += 10) {
    blocks.push(<span key={i} className="crispr__block">{letters.slice(i, i + 10)}</span>);
  }

  return (
    <main className="board graph-paper construct">
      <div className={`board__instruction${!modeSolved ? ' is-pending' : ''}`}>
        {modeSolved ? i18n.crispr.works : guide ? i18n.crispr.readyToCut : i18n.crispr.tapGuide}
      </div>

      <div className="construct__inner">
        <TourCard />
        <p className="hand pair__story">{def.story}</p>
        <p className="muted small" style={{ marginBottom: 8 }}>{fmt(i18n.crispr.goal, { label: def.target.label })}</p>

        <div className="construct__head">
          <span className="eyebrow">{i18n.crispr.genome}</span>
        </div>
        <div data-tour-el="genome" className="crispr__genome">{blocks}</div>
        <div className="crispr__legend small">
          <span><i className="crispr__key is-gene" /> {def.target.label}</span>
          <span><i className="crispr__key is-site" /> {i18n.crispr.legendSite}</span>
          <span><i className="crispr__key is-pam" /> PAM</span>
        </div>

        <div className="construct__head" style={{ marginTop: 18 }}>
          <span className="eyebrow">{i18n.crispr.guides}</span>
        </div>
        <p className="muted small" style={{ marginBottom: 8 }}>{i18n.crispr.guidesHelp}</p>
        <div data-tour-el="guides" className="crispr__guides">
          {def.guides.map(g => {
            const on = g.id === guideId;
            const r = on ? result : null;
            return (
              <button
                key={g.id}
                className={`crispr__guide${on ? ' is-on' : ''}`}
                onClick={() => crisprPick(g.id)}
                disabled={modeSolved}
                aria-pressed={on}
              >
                <span className="crispr__guide-id">{g.id.toUpperCase()}</span>
                <span className="mono crispr__guide-seq">{g.sequence}</span>
                {r && (
                  <span className="small muted">
                    {r.sites.length === 0
                      ? i18n.crispr.sitesNone
                      : fmt(i18n.crispr.sites, { n: r.sites.length, c: r.cuts.length })}
                  </span>
                )}
              </button>
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
          <div className="construct__actions">
            <button data-tour-el="test" className="btn btn--primary" onClick={testCrispr} disabled={!guide}>
              <Scissors size={15} /> {i18n.crispr.cut}
            </button>
            <button className="btn btn--quiet" onClick={resetLevel}>
              <RotateCcw size={14} /> {i18n.crispr.clear}
            </button>
          </div>
        )}
      </div>

      <FeedbackToast />
    </main>
  );
};
