import React from 'react';
import { ArrowRight, FlaskConical, RotateCcw } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { cutPositions, fragmentsOf, gelPosition } from '../../game/modes/logic';
import { t, fmt } from '../../i18n';
import { FeedbackToast } from './FeedbackToast';
import { TourCard } from './TourCard';

// One ink colour per enzyme, so its cutting sites are easy to follow on the map
const ENZYME_INK = ['#b4382b', '#2f5fa8', '#2f7d4f', '#8b3a7e', '#a87a0c'];
const LADDER = [0.5, 1, 2, 3, 4, 5, 6, 8, 10, 14];

interface Band { size: number; count: number }

/** Pieces of the same size run together and show as one band, as in a real gel. */
function bandsOf(sizes: number[]): Band[] {
  const counts = new Map<number, number>();
  sizes.forEach(s => counts.set(s, (counts.get(s) ?? 0) + 1));
  return [...counts.entries()].map(([size, count]) => ({ size, count })).sort((a, b) => b.size - a.size);
}

/** "Scissors and gel": cut a gene out of a stretch of DNA with restriction enzymes and read the gel. */
export const CutBoard: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const chosen = useGameStore(s => s.cutChosen);
  const modeSolved = useGameStore(s => s.modeSolved);
  const cutToggle = useGameStore(s => s.cutToggle);
  const testCut = useGameStore(s => s.testCut);
  const resetLevel = useGameStore(s => s.resetLevel);
  const completeLevel = useGameStore(s => s.completeLevel);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  const def = currentLevel?.cut;
  if (!def) return null;

  const pct = (kb: number) => `${(kb / def.length) * 100}%`;
  const pieces = fragmentsOf(def, chosen);
  const cuts = cutPositions(def, chosen);
  const sampleBands = bandsOf(pieces.map(p => p.size));
  const ladder = LADDER.filter(size => size <= def.length);
  const isGene = (p: { start: number; end: number }) =>
    Math.abs(p.start - def.gene.start) < 1e-6 && Math.abs(p.end - def.gene.end) < 1e-6;

  const band = (size: number, count: number, key: string, label: boolean) => (
    <div
      key={key}
      className="gel__band"
      style={{
        top: `${gelPosition(size, def.length) * 100}%`,
        // Thicker pieces carry more DNA and show brighter; only the band fades, not its label
        background: `rgba(191, 233, 214, ${Math.min(1, 0.35 + (0.65 * size * count) / def.length).toFixed(2)})`,
      }}
    >
      {label && <span className="gel__size mono">{size}{count > 1 ? ` ×${count}` : ''}</span>}
    </div>
  );

  return (
    <main className="board graph-paper construct">
      <div className={`board__instruction${!modeSolved ? ' is-pending' : ''}`}>
        {modeSolved ? i18n.cut.works : chosen.length ? i18n.cut.readyToCheck : i18n.cut.tapEnzyme}
      </div>

      <div className="construct__inner">
        <TourCard />
        <p className="hand pair__story">{def.story}</p>

        <div className="cut__grid">
          <div className="cut__a">
            <div className="construct__head">
              <span className="eyebrow">{i18n.cut.map}</span>
              <span className="mono small faint">{def.length} {i18n.cut.kb}</span>
            </div>

            <div data-tour-el="map" className="cut__map">
              <div className="cut__strip">
                {pieces.map((p, i) => (
                  <div
                    key={i}
                    className={`cut__piece${modeSolved && isGene(p) ? ' is-gene' : ''}`}
                    style={{ left: `calc(${pct(p.start)} + 1px)`, width: `calc(${pct(p.end - p.start)} - 2px)` }}
                  >
                    <span className="mono">{p.size}</span>
                  </div>
                ))}
              </div>

              {def.enzymes.map((enzyme, i) =>
                enzyme.sites.map(site => (
                  <div
                    key={`${enzyme.id}-${site}`}
                    className={`cut__tick${chosen.includes(enzyme.id) ? ' is-on' : ''}`}
                    style={{ left: pct(site), color: ENZYME_INK[i % ENZYME_INK.length] }}
                  >
                    <span className="cut__tick-label" style={{ top: -(15 + (i % 4) * 14) }}>{enzyme.label}</span>
                  </div>
                )),
              )}

              <div className="cut__gene" style={{ left: pct(def.gene.start), width: pct(def.gene.end - def.gene.start) }}>
                <span>{def.gene.label}</span>
              </div>
            </div>

          </div>

          <div className="cut__c">
            <div className="construct__head">
              <span className="eyebrow">{i18n.cut.enzymes}</span>
            </div>
            <p className="muted small" style={{ marginBottom: 8 }}>{i18n.cut.enzymesHelp}</p>
            <div data-tour-el="enzymes" className="cut__enzymes">
              {def.enzymes.map((enzyme, i) => {
                const on = chosen.includes(enzyme.id);
                return (
                  <button
                    key={enzyme.id}
                    className={`enzyme${on ? ' is-on' : ''}`}
                    style={{ borderLeftColor: ENZYME_INK[i % ENZYME_INK.length] }}
                    onClick={() => cutToggle(enzyme.id)}
                    disabled={modeSolved}
                    aria-pressed={on}
                  >
                    <span className="enzyme__name" style={{ color: ENZYME_INK[i % ENZYME_INK.length] }}>{enzyme.label}</span>
                    <span className="enzyme__desc small muted">{enzyme.description}</span>
                    <span className="enzyme__sites mono small">
                      {enzyme.sites.length === 1 ? i18n.cut.sitesOne : fmt(i18n.cut.sites, { n: enzyme.sites.length })}
                    </span>
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
                <button data-tour-el="test" className="btn btn--primary" onClick={testCut} disabled={chosen.length === 0}>
                  <FlaskConical size={15} /> {i18n.cut.test}
                </button>
                <button className="btn btn--quiet" onClick={resetLevel}>
                  <RotateCcw size={14} /> {i18n.cut.clear}
                </button>
              </div>
            )}
          </div>

          <div className="cut__b">
            <div className="construct__head">
              <span className="eyebrow">{i18n.cut.gel}</span>
            </div>
            <div data-tour-el="gel" className="gel">
              <div className="gel__lane">
                <div className="gel__well" />
                <div className="gel__run">
                  {ladder.map(size => band(size, 1, `l${size}`, true))}
                </div>
                <span className="gel__name small muted">{i18n.cut.ladder}</span>
              </div>
              <div className="gel__lane">
                <div className="gel__well" />
                <div className="gel__run">
                  {sampleBands.map(b => band(b.size, b.count, `s${b.size}`, true))}
                </div>
                <span className="gel__name small muted">{i18n.cut.sample}</span>
              </div>
            </div>
            <p className="muted small" style={{ marginTop: 6 }}>{cuts.length === 0 ? i18n.cut.uncut : fmt(i18n.cut.pieces, { n: pieces.length })}</p>
          </div>
        </div>
      </div>

      <FeedbackToast />
    </main>
  );
};
