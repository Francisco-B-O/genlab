import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { t } from '../../i18n';
import { NODE_INK, EDGE_INK, HIGHLIGHT } from '../theme';
import { PieceShape } from './TypeIcon';
import { boundsOf, edgeSegment, layoutFor, nodePoint } from '../layout2d';
import type { EdgeType } from '../../types/biology.types';

interface View { x: number; y: number; k: number }

const MIN_K = 0.35;
const MAX_K = 2.2;
/** Zoom a long pathway starts at on a phone held upright: small enough to see a good part of it, big enough to read and to tap */
const READABLE_K = 0.78;
const DRAG_THRESHOLD = 6;
const FAULT_INK = '#b4382b';
const EDGE_TYPES = Object.keys(EDGE_INK) as EdgeType[];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** A pannable, zoomable 2D board: cards for the pieces, labelled arrows for the connections. */
export const Board2D: React.FC<{ insetTop: number }> = ({ insetTop }) => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const nodes = useGameStore(s => s.nodes);
  const playerGraph = useGameStore(s => s.playerGraph);
  const gamePhase = useGameStore(s => s.gamePhase);
  const pendingSourceId = useGameStore(s => s.pendingSourceId);
  const selectedNodeId = useGameStore(s => s.selectedNodeId);
  const guideStep = useGameStore(s => s.guideStep);
  const accusedIds = useGameStore(s => s.accusedIds);
  const faultFound = useGameStore(s => s.faultFound);
  const tapNode = useGameStore(s => s.tapNode);
  const selectNode = useGameStore(s => s.selectNode);
  const language = useGameStore(s => s.language);
  // The graph object is mutated in place, so re-render whenever the game reports a change
  useGameStore(s => s.feedbackKey);
  useGameStore(s => s.satisfiedRequiredIds);
  const i18n = t(language);

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 1 });
  const [dragging, setDragging] = useState(false);
  const viewRef = useRef(view);
  viewRef.current = view;
  const dragged = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<
    | { kind: 'pan'; startX: number; startY: number; view: View }
    | { kind: 'pinch'; dist: number; mid: { x: number; y: number }; view: View }
    | null
  >(null);

  const portrait = size.h > 0 && size.w / size.h < 0.85;
  const layout = layoutFor(portrait);

  // ── Positions of the pieces ──
  const pieces = useMemo(
    () => (currentLevel?.puzzle.availableNodes ?? []).map(id => nodes[id]).filter(Boolean),
    [currentLevel, nodes],
  );
  const points = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    pieces.forEach(n => map.set(n.id, nodePoint(n.position, portrait)));
    return map;
  }, [pieces, portrait]);

  // ── Size of the board area ──
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Fit the pathway into the free area ──
  // With `readable`, a long pathway on a phone starts at a size that can be read and tapped, centred
  // and at the top; dragging moves around it and the fit button shows everything at once.
  const fitView = useCallback((readable: boolean) => {
    if (!size.w || !size.h || points.size === 0) return;
    const b = boundsOf([...points.values()], layout);
    const bw = b.maxX - b.minX;
    const bh = b.maxY - b.minY;
    const freeH = size.h - insetTop - 24;
    const fitK = Math.min((size.w - 32) / bw, freeH / bh);
    const k = clamp(readable && portrait ? Math.max(fitK, READABLE_K) : fitK, MIN_K, 1.25);
    setView({
      k,
      x: (size.w - bw * k) / 2 - b.minX * k,
      y: bh * k <= freeH ? insetTop + (freeH - bh * k) / 2 - b.minY * k : insetTop + 12 - b.minY * k,
    });
  }, [size.w, size.h, points, layout, insetTop, portrait]);

  const fit = useCallback(() => fitView(false), [fitView]);

  useLayoutEffect(() => { fitView(true); }, [fitView, currentLevel?.id]);

  // ── Zoom helpers (about a point of the screen) ──
  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    const v = viewRef.current;
    const k = clamp(v.k * factor, MIN_K, MAX_K);
    const wx = (cx - v.x) / v.k;
    const wy = (cy - v.y) / v.k;
    setView({ k, x: cx - wx * k, y: cy - wy * k });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  // ── Drag to pan, pinch to zoom ──
  const local = (e: { clientX: number; clientY: number }) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointers.current.set(e.pointerId, local(e));
    dragged.current = false;
    const all = [...pointers.current.values()];
    if (all.length === 1) {
      gesture.current = { kind: 'pan', startX: all[0].x, startY: all[0].y, view: { ...viewRef.current } };
    } else if (all.length === 2) {
      gesture.current = {
        kind: 'pinch',
        dist: Math.hypot(all[0].x - all[1].x, all[0].y - all[1].y) || 1,
        mid: { x: (all[0].x + all[1].x) / 2, y: (all[0].y + all[1].y) / 2 },
        view: { ...viewRef.current },
      };
      dragged.current = true;
    }
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!pointers.current.has(e.pointerId) || !gesture.current) return;
      const p = local(e);
      pointers.current.set(e.pointerId, p);
      const g = gesture.current;
      if (g.kind === 'pan') {
        const dx = p.x - g.startX;
        const dy = p.y - g.startY;
        if (!dragged.current && Math.hypot(dx, dy) > DRAG_THRESHOLD) { dragged.current = true; setDragging(true); }
        if (dragged.current) setView({ k: g.view.k, x: g.view.x + dx, y: g.view.y + dy });
      } else {
        const all = [...pointers.current.values()];
        if (all.length < 2) return;
        const dist = Math.hypot(all[0].x - all[1].x, all[0].y - all[1].y) || 1;
        const mid = { x: (all[0].x + all[1].x) / 2, y: (all[0].y + all[1].y) / 2 };
        const k = clamp(g.view.k * (dist / g.dist), MIN_K, MAX_K);
        const wx = (g.mid.x - g.view.x) / g.view.k;
        const wy = (g.mid.y - g.view.y) / g.view.k;
        setView({ k, x: mid.x - wx * k, y: mid.y - wy * k });
      }
    };
    const onUp = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId);
      const all = [...pointers.current.values()];
      if (all.length === 1) {
        // Back from a pinch to a single finger: carry on panning from here
        gesture.current = { kind: 'pan', startX: all[0].x, startY: all[0].y, view: { ...viewRef.current } };
      } else if (all.length === 0) {
        gesture.current = null;
        setDragging(false);
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  if (!currentLevel) return null;

  // ── Tutorial guide: highlight the pieces of the current step and dim the rest ──
  const step = currentLevel.guide?.[guideStep];
  const guided = new Set<string>(step?.highlight ?? []);
  if (step?.connectionId) {
    const rc = currentLevel.puzzle.requiredConnections.find(r => r.id === step.connectionId);
    if (rc) { guided.add(rc.sourceId); guided.add(rc.targetId); }
  }
  const dimOthers = !!currentLevel.isTutorial && guided.size > 0 && gamePhase === 'puzzle';
  const faulty = new Set(faultFound ? currentLevel.diagnose?.faultyIds ?? [] : []);
  const flowing = gamePhase === 'simulation' || gamePhase === 'complete';

  const edges = playerGraph.getAllEdges();

  const onBackgroundClick = (e: React.MouseEvent) => {
    if (dragged.current) return;
    if (!(e.target as Element).closest('[data-node]')) selectNode(null);
  };

  const zoomFromCenter = (factor: number) => zoomAt(factor, size.w / 2, size.h / 2);

  return (
    <div
      ref={containerRef}
      className={`b2d${dragging ? ' is-dragging' : ''}${pieces.length > 12 ? ' is-dense' : ''}`}
      onPointerDown={onPointerDown}
      onClick={onBackgroundClick}
    >
      <div className="b2d__world" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}>
        <svg className="b2d__edges" width={1} height={1} aria-hidden>
          <defs>
            {EDGE_TYPES.map(type => (
              <marker key={type} id={`arrow-${type}`} viewBox="0 0 10 10" refX={type === 'represses' ? 7 : 9} refY={5}
                markerWidth={type === 'represses' ? 4.5 : 5.5} markerHeight={type === 'represses' ? 4.5 : 5.5} orient="auto">
                {type === 'represses'
                  ? <path d="M7 0V10" stroke={EDGE_INK[type]} strokeWidth={3} />
                  : <path d="M0 0L10 5L0 10z" fill={EDGE_INK[type]} />}
              </marker>
            ))}
          </defs>
          {edges.map(edge => {
            const a = points.get(edge.source);
            const b = points.get(edge.target);
            if (!a || !b) return null;
            const { from, to } = edgeSegment(a, b, layout);
            const color = EDGE_INK[edge.type];
            const d = `M${from.x} ${from.y}L${to.x} ${to.y}`;
            return (
              <g key={edge.id}>
                <path d={d} stroke={color} strokeWidth={2.2} fill="none" strokeDasharray={edge.isRequired ? undefined : '6 5'}
                  markerEnd={`url(#arrow-${edge.type})`} />
                {flowing && <path d={d} className="b2d__flow" stroke={HIGHLIGHT} strokeWidth={3} fill="none" />}
              </g>
            );
          })}
        </svg>

        {pieces.map(node => {
          const p = points.get(node.id)!;
          const classes = ['card2d'];
          if (pendingSourceId === node.id) classes.push('is-pending');
          else if (selectedNodeId === node.id) classes.push('is-selected');
          if (guided.has(node.id)) classes.push('is-guided');
          if ((dimOthers && !guided.has(node.id) && pendingSourceId !== node.id) || accusedIds.includes(node.id)) classes.push('is-dim');
          if (faulty.has(node.id)) classes.push('is-faulty');
          return (
            <button
              key={node.id}
              data-node={node.id}
              data-tour-el="pieces"
              className={classes.join(' ')}
              style={{ left: p.x, top: p.y, width: layout.card.w, minHeight: layout.card.h - 8, borderLeftColor: faulty.has(node.id) ? FAULT_INK : NODE_INK[node.type] }}
              onClick={() => { if (!dragged.current) tapNode(node.id); }}
              aria-pressed={selectedNodeId === node.id || pendingSourceId === node.id}
            >
              <PieceShape type={node.type} size={layout.shape} />
              <span className="card2d__text">
                <span className="card2d__label">{node.label}</span>
                <span className="card2d__type" style={{ color: NODE_INK[node.type] }}>{i18n.nodeTypes[node.type]}</span>
              </span>
            </button>
          );
        })}

        {edges.map(edge => {
          const a = points.get(edge.source);
          const b = points.get(edge.target);
          if (!a || !b) return null;
          const { from, to } = edgeSegment(a, b, layout);
          return (
            <span
              key={`verb-${edge.id}`}
              className="b2d__verb"
              style={{ left: (from.x + to.x) / 2, top: (from.y + to.y) / 2, color: EDGE_INK[edge.type] }}
            >
              {i18n.edgeTypes[edge.type]}
            </span>
          );
        })}
      </div>

      <div className="b2d__zoom" data-tour-el="zoom">
        <button className="btn btn--ghost" onClick={() => zoomFromCenter(1.3)} aria-label="+"><ZoomIn size={16} /></button>
        <button className="btn btn--ghost" onClick={() => zoomFromCenter(1 / 1.3)} aria-label="−"><ZoomOut size={16} /></button>
        <button className="btn btn--ghost" onClick={fit} aria-label="fit"><Maximize2 size={15} /></button>
      </div>
    </div>
  );
};
