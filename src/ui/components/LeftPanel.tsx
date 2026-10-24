import React from 'react';
import { useGameStore, levelMode } from '../../game/GameStore';
import { PART_INK, PartGlyph } from './ConstructBoard';
import type { PartKind } from '../../types/level.types';
import { HintSystem } from './HintSystem';
import { TypeIcon, PieceShape } from './TypeIcon';
import { HelpCircle } from 'lucide-react';
import { geneticCodeTable } from '../../game/modes/logic';
import { t } from '../../i18n';
import { NODE_INK, EDGE_INK, TYPE_ORDER } from '../theme';
import type { BiologicalNode, EdgeType, NodeType } from '../../types/biology.types';

/** Gene → makes → Enzyme → runs → Reaction → produces → Molecule → causes → Outcome */
const ChainLegend: React.FC = () => {
  const language = useGameStore(s => s.language);
  const i18n = t(language);
  const chain: Array<[NodeType, string | null]> = [
    ['gene', i18n.edgeTypes.encodes],
    ['enzyme', i18n.edgeTypes.catalyzes],
    ['reaction', i18n.edgeTypes.produces],
    ['metabolite', i18n.edgeTypes.influences],
    ['phenotype', null],
  ];
  return (
    <div className="chain">
      {chain.map(([type, verb]) => (
        <React.Fragment key={type}>
          <span className="chain__node" style={{ color: NODE_INK[type] }}>
            <PieceShape type={type} size={22} />
            {i18n.nodeTypes[type]}
          </span>
          {verb && <span className="chain__verb">↓ {verb}</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export const LeftPanel: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const nodes = useGameStore(s => s.nodes);
  const gamePhase = useGameStore(s => s.gamePhase);
  const selectedNodeId = useGameStore(s => s.selectedNodeId);
  const pendingSourceId = useGameStore(s => s.pendingSourceId);
  const playerGraph = useGameStore(s => s.playerGraph);
  const tapNode = useGameStore(s => s.tapNode);
  const accusedIds = useGameStore(s => s.accusedIds);
  const touring = useGameStore(s => s.tourMode !== null);
  const startTour = useGameStore(s => s.startTour);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  if (!currentLevel) return null;
  const mode = levelMode(currentLevel);
  // Only these modes show a board of pieces to inspect
  const showPieces = mode === 'pathway' || mode === 'diagnose';

  const connected = new Set<string>();
  playerGraph.getAllEdges().forEach(e => { connected.add(e.source); connected.add(e.target); });

  // Connection types this level uses beyond the basic chain
  const basic = new Set<EdgeType>(['encodes', 'catalyzes', 'produces', 'influences']);
  const extraEdges = [...new Set(currentLevel.puzzle.requiredConnections.map(r => r.edgeType as EdgeType))]
    .filter(type => !basic.has(type));

  const groups = new Map<NodeType, BiologicalNode[]>();
  currentLevel.puzzle.availableNodes.forEach(id => {
    const node = nodes[id];
    if (!node) return;
    groups.set(node.type, [...(groups.get(node.type) ?? []), node]);
  });

  return (
    <aside className={`side side--left${isOpen ? ' is-open' : ''}`}>
      <div className="section">
        <span className="eyebrow">{i18n.panel.objective}</span>
        <p style={{ fontSize: 14.5 }}>{currentLevel.objective}</p>
      </div>

      {mode === 'diagnose' && currentLevel.diagnose && (
        <div className="section">
          <span className="eyebrow">{i18n.diagnose.symptom}</span>
          <p style={{ fontSize: 14 }}>{currentLevel.diagnose.symptom}</p>
          <span className="eyebrow" style={{ marginTop: 12, display: 'block' }}>{i18n.diagnose.clues}</span>
          <ul className="clues">
            {currentLevel.diagnose.clues.map((clue, i) => <li key={i}>{clue.text}</li>)}
          </ul>
        </div>
      )}

      {mode === 'construct' && currentLevel.construct && (
        <div className="section">
          <span className="eyebrow">{i18n.construct.tray}</span>
          <div className="edge-help">
            {[...new Set(currentLevel.construct.parts.map(p => p.kind))].map((kind: PartKind) => (
              <div key={kind}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: PART_INK[kind] }}>
                  <PartGlyph kind={kind} size={18} /> {i18n.construct.kinds[kind]}
                </span>
                <span className="muted small">{i18n.construct.kindHelp[kind]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === 'cut' && currentLevel.cut && (
        <div className="section">
          <span className="eyebrow">{i18n.cut.gelHelpTitle}</span>
          <p className="muted small" style={{ marginTop: 4 }}>{i18n.cut.gelHelp}</p>
        </div>
      )}

      {mode === 'pairing' && currentLevel.pairing && (
        <div className="section">
          {currentLevel.pairing.kind === 'protein' ? (
            <>
              <span className="eyebrow">{i18n.pairing.codeTable}</span>
              <p className="muted small" style={{ margin: '4px 0 8px' }}>{i18n.pairing.codeTableHelp}</p>
              <div className="code-table">
                {geneticCodeTable().map(row => (
                  <div key={row.amino} className="code-table__row">
                    <span className="code-table__amino">{row.amino === 'Stop' ? i18n.mutation.stop : row.amino}</span>
                    <span className="mono">{row.codons.join(' ')}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <span className="eyebrow">{i18n.pairing.rulesTitle}</span>
              <ul className="pair-rules">
                {i18n.pairing.rules[currentLevel.pairing.kind].map(rule => <li key={rule} className="mono">{rule}</li>)}
              </ul>
              <p className="muted small">{i18n.pairing.rulesNote[currentLevel.pairing.kind]}</p>
            </>
          )}
        </div>
      )}

      {showPieces && <div className="section">
        <span className="eyebrow">{i18n.panel.chainTitle}</span>
        <ChainLegend />
        {extraEdges.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <span className="eyebrow">{i18n.panel.alsoHere}</span>
            <div className="edge-help">
              {extraEdges.map(type => (
                <div key={type}>
                  <span className="edge-help__verb" style={{ color: EDGE_INK[type] }}>
                    {type === 'represses' ? '⊣' : '→'} {i18n.edgeTypes[type]}
                  </span>
                  <span className="muted small">{i18n.edgeHelp[type]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>}

      {gamePhase === 'puzzle' && !currentLevel.isTutorial && !touring && (
        <div className="section">
          <button className="btn btn--quiet btn--block" onClick={() => startTour(mode)}>
            <HelpCircle size={15} /> {i18n.tour.replay}
          </button>
        </div>
      )}

      {gamePhase === 'puzzle' && !currentLevel.isTutorial && (
        <div className="section">
          <span className="eyebrow">{i18n.hints.title}</span>
          <HintSystem />
        </div>
      )}

      {showPieces && <div className="section">
        <span className="eyebrow">{i18n.panel.pieces}</span>
        {TYPE_ORDER.filter(type => groups.has(type)).map(type => (
          <div key={type} className="piece-group">
            <div className="piece-group__label" style={{ color: NODE_INK[type] }}>
              <TypeIcon type={type} size={14} />
              {i18n.nodeTypes[type]}
            </div>
            {groups.get(type)!.map(node => {
              const classes = ['piece'];
              if (pendingSourceId === node.id) classes.push('is-pending');
              else if (selectedNodeId === node.id) classes.push('is-selected');
              if (connected.has(node.id) && mode === 'pathway') classes.push('is-done');
              if (accusedIds.includes(node.id)) classes.push('is-done');
              return (
                <button key={node.id} className={classes.join(' ')} onClick={() => tapNode(node.id)}>
                  <span className="piece__dot" style={{ background: NODE_INK[type] }} />
                  <span className="piece__label">{node.label}</span>
                  {connected.has(node.id) && mode === 'pathway' && <span className="piece__check">✓</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>}
    </aside>
  );
};
