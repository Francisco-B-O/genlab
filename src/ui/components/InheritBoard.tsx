import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { fractionLabel, SIXTEENTHS } from '../../game/modes/logic';
import { t, fmt } from '../../i18n';
import { FeedbackToast } from './FeedbackToast';
import { TourCard } from './TourCard';

const PERCENTAGES = [0, 25, 50, 75, 100];

/**
 * "Inheritance": fill in a Punnett square, then answer a probability question. A level with a
 * second gene has a square for each gene, and its answer is the product of the two chances.
 */
export const InheritBoard: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const index = useGameStore(s => s.inheritIndex);
  const cells = useGameStore(s => s.inheritCells);
  const stage = useGameStore(s => s.inheritStage);
  const wrongCells = useGameStore(s => s.inheritWrongCells);
  const answered = useGameStore(s => s.inheritAnswered);
  const modeSolved = useGameStore(s => s.modeSolved);
  const cycleCell = useGameStore(s => s.cycleCell);
  const checkSquare = useGameStore(s => s.checkSquare);
  const answerInherit = useGameStore(s => s.answerInherit);
  const nextInherit = useGameStore(s => s.nextInherit);
  const completeLevel = useGameStore(s => s.completeLevel);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  const def = currentLevel?.inherit;
  if (!def) return null;

  if (modeSolved) {
    return (
      <main className="board graph-paper construct">
        <div className="construct__inner">
          <div className="card construct__success">
            <span className="eyebrow">{def.trait}</span>
            <h2 className="display" style={{ fontSize: 24, margin: '8px 0 12px' }}>{i18n.inherit.allDone}</h2>
            <button className="btn btn--primary" onClick={completeLevel}>
              {i18n.simulation.results} <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <FeedbackToast />
      </main>
    );
  }

  const scenario = def.scenarios[index];
  if (!scenario) return null;
  const isLast = index + 1 >= def.scenarios.length;
  const second = def.second;
  const traits = second ? `${def.trait} + ${second.trait}` : def.trait;

  // One entry per gene: its trait, the genotypes of the two parents and where its cells start
  const genes = [
    { trait: def.trait, p1: scenario.parent1, p2: scenario.parent2, offset: 0, gene: def },
    ...(second && scenario.parent1b && scenario.parent2b
      ? [{ trait: second.trait, p1: scenario.parent1b, p2: scenario.parent2b, offset: 4, gene: second }]
      : []),
  ];

  const parents = [
    { n: 1, g: genes.map(x => x.p1).join(' · '), label: scenario.parent1Label },
    { n: 2, g: genes.map(x => x.p2).join(' · '), label: scenario.parent2Label },
  ];

  const square = (g: (typeof genes)[number]) => {
    const [a1, a2] = [...g.p1];
    const [b1, b2] = [...g.p2];
    const phenotypeOf = (genotype: string | null) => (genotype ? g.gene.phenotypeLabels[g.gene.phenotypes[genotype]] : '');
    return (
      <div key={g.offset} className="inherit__gene">
        {second && <span className="eyebrow">{g.trait}</span>}
        <div className={`punnett${second ? ' punnett--small' : ''}`}>
          <span className="punnett__corner" />
          <span className="punnett__head mono">{b1}</span>
          <span className="punnett__head mono">{b2}</span>
          {[0, 1].map(row => (
            <React.Fragment key={row}>
              <span className="punnett__head mono">{row === 0 ? a1 : a2}</span>
              {[0, 1].map(col => {
                const i = g.offset + row * 2 + col;
                const classes = ['punnett__cell'];
                if (!cells[i]) classes.push('is-empty');
                if (wrongCells.includes(i)) classes.push('is-wrong');
                if (stage === 'question') classes.push('is-locked');
                return (
                  <button key={col} className={classes.join(' ')} onClick={() => cycleCell(i)} disabled={stage !== 'square'}>
                    <span className="mono punnett__genotype">{cells[i] ?? '?'}</span>
                    {stage === 'question' && <span className="small muted">{phenotypeOf(cells[i])}</span>}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="board graph-paper construct">
      <div className="board__instruction">
        {fmt(i18n.inherit.case, { n: index + 1, total: def.scenarios.length })} · {traits}
      </div>

      <div className="construct__inner">
        <TourCard />
        <div data-tour-el="parents" className="inherit__parents">
          {parents.map(p => (
            <div key={p.n} className="card inherit__parent">
              <span className="eyebrow">{fmt(i18n.inherit.parent, { n: p.n })}</span>
              <strong className="mono" style={{ fontSize: 22 }}>{p.g}</strong>
              <span className="muted small">{p.label}</span>
            </div>
          ))}
        </div>

        <div className="construct__head" style={{ marginTop: 18 }}>
          <span className="eyebrow">{second ? i18n.inherit.squares : i18n.inherit.square}</span>
          <span className="hand faint">{stage === 'square' ? i18n.inherit.tapCell : ''}</span>
        </div>

        <div data-tour-el="square" className={second ? 'inherit__squares' : undefined}>
          {genes.map(square)}
        </div>

        {stage === 'square' && (
          <div className="construct__actions">
            <button data-tour-el="check" className="btn btn--primary" onClick={checkSquare}>
              <Check size={15} /> {second ? i18n.inherit.checkTwo : i18n.inherit.check}
            </button>
          </div>
        )}

        {stage === 'question' && (
          <div className="card construct__success" style={{ marginTop: 16 }}>
            <span className="eyebrow">{i18n.inherit.question}</span>
            <p style={{ fontSize: 15.5, margin: '6px 0 12px' }}>{scenario.question}</p>
            {second && <p className="note-box">{i18n.inherit.multiplyHint}</p>}
            {!answered ? (
              <>
                <span className="eyebrow">{i18n.inherit.chooseProbability}</span>
                <div data-tour-el="answers" className="inherit__answers">
                  {second
                    ? SIXTEENTHS.map(p => (
                      <button key={p} className="btn btn--ghost" onClick={() => answerInherit(p)}>{fractionLabel(p)}</button>
                    ))
                    : PERCENTAGES.map(p => (
                      <button key={p} className="btn btn--ghost" onClick={() => answerInherit(p)}>{p} %</button>
                    ))}
                </div>
              </>
            ) : (
              <button className="btn btn--primary" onClick={nextInherit}>
                {isLast ? i18n.inherit.finish : i18n.inherit.next} <ArrowRight size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      <FeedbackToast />
    </main>
  );
};
