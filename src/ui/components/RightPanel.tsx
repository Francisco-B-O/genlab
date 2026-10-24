import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Play, RotateCcw, Box } from 'lucide-react';
import { useGameStore, levelMode, selectProgress } from '../../game/GameStore';
import { PART_INK, PartGlyph } from './ConstructBoard';
const MolecularViewerModal = React.lazy(() =>
  import('../../molecular/MolecularViewerModal').then(m => ({ default: m.MolecularViewerModal })),
);
import { TypeIcon, PieceShape } from './TypeIcon';
import { t, fmt } from '../../i18n';
import { NODE_INK } from '../theme';
import type { BiologicalNode } from '../../types/biology.types';

const NodeInspector: React.FC<{ node: BiologicalNode; onView3D: () => void }> = ({ node, onView3D }) => {
  const playerGraph = useGameStore(s => s.playerGraph);
  const nodes = useGameStore(s => s.nodes);
  const language = useGameStore(s => s.language);
  const i18n = t(language);
  const ink = NODE_INK[node.type];

  const links = playerGraph.getAllEdges().filter(e => e.source === node.id || e.target === node.id);

  return (
    <div>
      <div className="inspector__head">
        <PieceShape type={node.type} size={52} />
        <div>
          <span className="chip" style={{ color: ink }}>
            <TypeIcon type={node.type} size={13} />
            {i18n.nodeTypes[node.type]}
          </span>
          <div className="inspector__title">{node.label}</div>
        </div>
      </div>
      {node.scientificName && <div className="inspector__sci">{node.scientificName}</div>}
      <p className="inspector__desc">{node.description}</p>
      <p className="inspector__help">{i18n.nodeTypeHelp[node.type]}</p>

      <div style={{ marginTop: 14 }}>
        <span className="eyebrow">{i18n.panel.connections}</span>
        {links.length === 0 ? (
          <p className="faint small" style={{ marginTop: 4 }}>{i18n.panel.noConnections}</p>
        ) : (
          <div className="link-list">
            {links.map(e => (
              <div key={e.id}>
                {nodes[e.source]?.label} <span className="verb">{i18n.edgeTypes[e.type]}</span> {nodes[e.target]?.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {(node.type === 'enzyme' || node.type === 'protein') && (
        <button className="btn btn--ghost btn--block" style={{ marginTop: 14 }} onClick={onView3D}>
          <Box size={15} /> {i18n.panel.viewMolecule}
        </button>
      )}
    </div>
  );
};

export const RightPanel: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const nodes = useGameStore(s => s.nodes);
  const gamePhase = useGameStore(s => s.gamePhase);
  const selectedNodeId = useGameStore(s => s.selectedNodeId);
  const satisfied = useGameStore(s => selectProgress(s).done);
  const total = useGameStore(s => selectProgress(s).total);
  const selectedPartId = useGameStore(s => s.selectedPartId);
  const wrongConnections = useGameStore(s => s.wrongConnections);
  const score = useGameStore(s => s.score);
  const runSimulation = useGameStore(s => s.runSimulation);
  const resetLevel = useGameStore(s => s.resetLevel);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  const [scienceOpen, setScienceOpen] = useState(false);
  const [moleculeNode, setMoleculeNode] = useState<BiologicalNode | null>(null);

  if (!currentLevel) return null;

  const mode = levelMode(currentLevel);
  const hasInspector = mode === 'pathway' || mode === 'diagnose' || mode === 'construct';
  const allDone = satisfied >= total;
  const selected = selectedNodeId ? nodes[selectedNodeId] : null;
  const part = selectedPartId ? currentLevel.construct?.parts.find(p => p.id === selectedPartId) : undefined;

  return (
    <aside className={`side side--right${isOpen ? ' is-open' : ''}`}>
      {hasInspector && <div className="section" style={{ flex: '1 0 auto' }}>
        <span className="eyebrow">{i18n.panel.selected}</span>
        {part ? (
          <div>
            <span className="chip" style={{ color: PART_INK[part.kind] }}>
              <PartGlyph kind={part.kind} size={14} /> {i18n.construct.kinds[part.kind]}
            </span>
            <div className="inspector__title">{part.label}</div>
            <p className="inspector__desc">{part.description}</p>
            <p className="inspector__help">{i18n.construct.kindHelp[part.kind]}</p>
          </div>
        ) : selected ? (
          <NodeInspector node={selected} onView3D={() => setMoleculeNode(selected)} />
        ) : (
          <p className="faint" style={{ fontSize: 14 }}>{i18n.panel.noSelection}</p>
        )}
      </div>}

      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="eyebrow">{i18n.panel.progress}</span>
          <span className="mono small">{satisfied}/{total}</span>
        </div>
        <div className="progress"><div style={{ width: `${total ? (satisfied / total) * 100 : 0}%` }} /></div>
        <div className="small faint" style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
          <span>{score.total.toLocaleString()} {i18n.hud.points}</span>
          {wrongConnections > 0 && <span style={{ color: 'var(--error)' }}>{wrongConnections} {wrongConnections === 1 ? i18n.panel.mistake : i18n.panel.mistakes}</span>}
        </div>

        {gamePhase === 'puzzle' && mode !== 'pathway' && (
          <button className="btn btn--quiet btn--block" style={{ marginTop: 14 }} onClick={resetLevel}>
            <RotateCcw size={14} /> {i18n.panel.reset}
          </button>
        )}

        {gamePhase === 'puzzle' && mode === 'pathway' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
            <button
              data-tour-el="simulate"
              className={`btn btn--block ${allDone ? 'btn--primary' : 'btn--ghost'}`}
              onClick={runSimulation}
              disabled={satisfied === 0}
            >
              <Play size={15} />
              {allDone ? i18n.panel.simulate : fmt(i18n.panel.simulatePartial, { done: satisfied, total })}
            </button>
            <button className="btn btn--quiet btn--block" onClick={resetLevel}>
              <RotateCcw size={14} /> {i18n.panel.reset}
            </button>
          </div>
        )}
      </div>

      <div className="section">
        <button
          onClick={() => setScienceOpen(o => !o)}
          style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span className="eyebrow">{i18n.panel.scienceNotes}</span>
          {scienceOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {scienceOpen && (
          <div className="small muted" style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p><strong>{i18n.panel.realCase}.</strong> {currentLevel.science.realWorldCase}</p>
            {currentLevel.science.gameplaySimplifications[0] && (
              <p><strong>{i18n.panel.note}.</strong> {currentLevel.science.gameplaySimplifications[0]}</p>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {moleculeNode && (
          <React.Suspense fallback={null}>
            <MolecularViewerModal node={moleculeNode} onClose={() => setMoleculeNode(null)} />
          </React.Suspense>
        )}
      </AnimatePresence>
    </aside>
  );
};
