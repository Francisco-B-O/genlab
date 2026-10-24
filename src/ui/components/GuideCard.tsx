import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { t, fmt } from '../../i18n';
import { NODE_INK } from '../theme';
import { PieceShape } from './TypeIcon';

/** Step-by-step instructions shown on the board during the tutorial level. */
export const GuideCard: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const nodes = useGameStore(s => s.nodes);
  const guideStep = useGameStore(s => s.guideStep);
  const advanceGuide = useGameStore(s => s.advanceGuide);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  const guide = currentLevel?.guide ?? [];
  const step = guide[guideStep];
  if (!currentLevel || !step) return null;

  const rc = step.connectionId
    ? currentLevel.puzzle.requiredConnections.find(r => r.id === step.connectionId)
    : undefined;
  const source = rc ? nodes[rc.sourceId] : undefined;
  const target = rc ? nodes[rc.targetId] : undefined;
  const isLast = guideStep === guide.length - 1;

  return (
    <div className="card guide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="eyebrow">{i18n.guide.title}</span>
        <span className="mono small faint">{fmt(i18n.guide.step, { n: guideStep + 1, total: guide.length })}</span>
      </div>
      <p className="guide__text">{step.text}</p>

      {source && target ? (
        <div className="guide__task">
          <span>{i18n.guide.doThis}:</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: NODE_INK[source.type] }}>
            <PieceShape type={source.type} size={22} /> {source.label}
          </span>
          <ArrowRight size={14} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: NODE_INK[target.type] }}>
            <PieceShape type={target.type} size={22} /> {target.label}
          </span>
        </div>
      ) : (
        <button className="btn btn--primary" onClick={advanceGuide}>
          {isLast ? i18n.guide.finish : i18n.guide.next}
        </button>
      )}
    </div>
  );
};
