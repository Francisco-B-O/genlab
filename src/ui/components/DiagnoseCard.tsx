import React from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { t } from '../../i18n';
import { NODE_INK } from '../theme';
import { PieceShape } from './TypeIcon';

/** Board card for diagnose levels: accuse the selected piece, then pick a treatment. */
export const DiagnoseCard: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const nodes = useGameStore(s => s.nodes);
  const selectedNodeId = useGameStore(s => s.selectedNodeId);
  const accusedIds = useGameStore(s => s.accusedIds);
  const faultFound = useGameStore(s => s.faultFound);
  const fixesTried = useGameStore(s => s.fixesTried);
  const modeSolved = useGameStore(s => s.modeSolved);
  const accuse = useGameStore(s => s.accuse);
  const chooseFix = useGameStore(s => s.chooseFix);
  const completeLevel = useGameStore(s => s.completeLevel);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  const def = currentLevel?.diagnose;
  if (!def) return null;

  if (modeSolved) {
    return (
      <div className="card guide">
        <span className="eyebrow">{i18n.diagnose.fixTitle}</span>
        <p className="guide__text">{def.fixes.find(f => f.correct)?.text}</p>
        <button className="btn btn--primary" onClick={completeLevel}>
          {i18n.simulation.results} <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  if (faultFound) {
    return (
      <div className="card guide">
        <span className="eyebrow">{i18n.diagnose.fixTitle}</span>
        <div data-tour-el="fixes" className="fixes">
          {def.fixes.map(fix => {
            const tried = fixesTried.includes(fix.id);
            return (
              <button key={fix.id} className={`fix${tried ? ' is-tried' : ''}`} onClick={() => chooseFix(fix.id)} disabled={tried}>
                {fix.text}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const selected = selectedNodeId ? nodes[selectedNodeId] : null;
  if (!selected) {
    return (
      <div className="card guide">
        <span className="eyebrow">{i18n.diagnose.symptom}</span>
        <p className="guide__text">{def.symptom}</p>
      </div>
    );
  }

  const ruledOut = accusedIds.includes(selected.id);
  return (
    <div className="card guide">
      <span className="eyebrow">{i18n.nodeTypes[selected.type]}</span>
      <div className="inspector__title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: NODE_INK[selected.type] }}>
        <PieceShape type={selected.type} size={30} /> <span style={{ color: 'var(--ink)' }}>{selected.label}</span>
      </div>
      <p className="guide__text small muted">{selected.description}</p>
      <button data-tour-el="accuse" className="btn btn--primary" onClick={() => accuse(selected.id)} disabled={ruledOut}>
        <Search size={15} /> {ruledOut ? i18n.diagnose.tried : i18n.diagnose.accuse}
      </button>
    </div>
  );
};
