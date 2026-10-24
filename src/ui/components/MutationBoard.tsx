import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { codonGroups, mutationKind, mutationSites, translate, type MutationEffect } from '../../game/modes/logic';
import { t } from '../../i18n';
import { FeedbackToast } from './FeedbackToast';
import { TourCard } from './TourCard';

const EFFECTS: MutationEffect[] = ['silent', 'missense', 'nonsense'];
/** A change that adds or removes a letter can also shift the whole reading, so that option joins the list. */
const EFFECTS_WITH_SHIFT: MutationEffect[] = ['frameshift', 'missense', 'nonsense', 'silent'];

/**
 * "Find the mutation": compare two DNA sequences, tap the change, say what it does. The change is
 * a different letter, an extra letter in the patient's strand or a letter missing from it.
 */
export const MutationBoard: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const mutFound = useGameStore(s => s.mutFound);
  const wrongBases = useGameStore(s => s.mutWrongBases);
  const modeSolved = useGameStore(s => s.modeSolved);
  const pickBase = useGameStore(s => s.pickBase);
  const answerEffect = useGameStore(s => s.answerEffect);
  const completeLevel = useGameStore(s => s.completeLevel);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  const def = currentLevel?.mutation;
  if (!def) return null;

  const kind = mutationKind(def.reference, def.mutant);
  const first = mutationSites(def.reference, def.mutant)[0];
  // A missing letter is pointed at in the healthy strand; any other change in the patient's
  const tapRow: 'healthy' | 'patient' = kind === 'deletion' ? 'healthy' : 'patient';
  const healthyAmino = translate(def.reference);
  const patientAmino = translate(def.mutant);
  const stopLabel = (aa: string) => (aa === 'Stop' ? i18n.mutation.stop : aa);

  const aminoChanged = (ci: number, aminos: string[], row: 'healthy' | 'patient') => {
    if (row === 'healthy' || !mutFound) return false;
    if (kind === 'substitution') return ci === Math.floor(first / 3);
    return ci >= Math.floor(first / 3) && aminos[ci] !== healthyAmino[ci];
  };

  const strand = (seq: string, aminos: string[], row: 'healthy' | 'patient', showAmino: boolean) => {
    const clickable = row === tapRow;
    return (
      <div data-tour-el={row} className="mut__strand">
        {codonGroups(seq).map((group, ci) => (
          <div key={ci} className="codon">
            <div className="codon__bases">
              {[...group].map((base, bi) => {
                const index = ci * 3 + bi;
                const classes = ['base', 'mono'];
                if (index === first && mutFound && clickable) classes.push('is-changed');
                if (clickable && wrongBases.includes(index)) classes.push('is-wrong');
                if (!clickable) classes.push('is-static');
                return clickable ? (
                  <button key={bi} className={classes.join(' ')} onClick={() => pickBase(index)} disabled={mutFound}>{base}</button>
                ) : (
                  <span key={bi} className={classes.join(' ')}>{base}</span>
                );
              })}
            </div>
            <div className={`codon__amino mono${aminoChanged(ci, aminos, row) ? ' is-changed' : ''}`}>
              {group.length < 3 ? '·' : !showAmino ? '?' : aminos.slice(0, ci).includes('Stop') ? '–' : stopLabel(aminos[ci])}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const instruction = kind === 'insertion' ? i18n.mutation.tapExtra : kind === 'deletion' ? i18n.mutation.tapMissing : i18n.mutation.tapBase;
  const effects = kind === 'substitution' ? EFFECTS : EFFECTS_WITH_SHIFT;

  return (
    <main className="board graph-paper construct">
      <div className={`board__instruction${!mutFound ? ' is-pending' : ''}`}>
        {modeSolved ? i18n.mutation.found : mutFound ? i18n.mutation.effectQuestion : instruction}
      </div>

      <div className="construct__inner">
        <TourCard />
        <p className="muted" style={{ marginBottom: 14, fontSize: 14.5 }}>{def.story}</p>

        <div className="construct__head">
          <span className="eyebrow">{i18n.mutation.healthy} · {def.geneLabel}</span>
          {tapRow === 'healthy' && !mutFound && <span className="hand faint">{i18n.mutation.tapHere}</span>}
        </div>
        {strand(def.reference, healthyAmino, 'healthy', true)}

        <div className="construct__head" style={{ marginTop: 16 }}>
          <span className="eyebrow">{i18n.mutation.patient}</span>
          <span className="hand faint">{i18n.mutation.codonHint}</span>
        </div>
        {strand(def.mutant, patientAmino, 'patient', mutFound)}

        {mutFound && !modeSolved && (
          <div className="card construct__success" style={{ marginTop: 16 }}>
            <span className="eyebrow">{i18n.mutation.effectQuestion}</span>
            <div data-tour-el="effects" className="mut__effects">
              {effects.map(effect => (
                <button key={effect} className="fix" onClick={() => answerEffect(effect)}>
                  {i18n.mutation.effects[effect]}
                </button>
              ))}
            </div>
          </div>
        )}

        {modeSolved && (
          <div className="construct__actions" style={{ marginTop: 16 }}>
            <button className="btn btn--primary" onClick={completeLevel}>
              {i18n.simulation.results} <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>

      <FeedbackToast />
    </main>
  );
};
