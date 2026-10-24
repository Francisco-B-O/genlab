// Geometry of the 2D pathway board. Level files keep their original (x, y) positions;
// this module turns them into pixels for a landscape or a portrait screen.

export interface Point { x: number; y: number }
export interface LayoutSpec {
  /** Pixels per level unit along the reading direction (columns) and across it (rows). */
  scaleX: number;
  scaleY: number;
  card: { w: number; h: number };
  /** Size of the piece's shape drawn inside its card. */
  shape: number;
}

export const LAYOUTS: Record<'landscape' | 'portrait', LayoutSpec> = {
  // Wide screens have spare height, so rows are spaced out and columns packed closer
  landscape: { scaleX: 52, scaleY: 64, card: { w: 148, h: 58 }, shape: 36 },
  portrait: { scaleX: 56, scaleY: 38, card: { w: 126, h: 68 }, shape: 28 },
};

export const layoutFor = (portrait: boolean): LayoutSpec => (portrait ? LAYOUTS.portrait : LAYOUTS.landscape);

/**
 * Landscape: the pathway reads left to right.
 * Portrait: it reads top to bottom, so the first column of the level becomes the top row.
 */
export function nodePoint(pos: { x: number; y: number } | undefined, portrait: boolean): Point {
  const { x, y } = pos ?? { x: 0, y: 0 };
  const { scaleX, scaleY } = layoutFor(portrait);
  return portrait ? { x: -y * scaleX, y: x * scaleY } : { x: x * scaleX, y: -y * scaleY };
}

/** True if two cards centred on a and b come closer than `margin` pixels. */
export function cardsOverlap(a: Point, b: Point, layout: LayoutSpec, margin = 6): boolean {
  return Math.abs(a.x - b.x) < layout.card.w + margin && Math.abs(a.y - b.y) < layout.card.h + margin;
}

/** Where a line between two card centres leaves one card and enters the other. */
export function edgeSegment(a: Point, b: Point, layout: LayoutSpec, gap = 4): { from: Point; to: Point } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const hw = layout.card.w / 2;
  const hh = layout.card.h / 2;
  // Fraction of the centre-to-centre vector that lies inside one card
  const inside = 1 / Math.max(Math.abs(dx) / hw || 0, Math.abs(dy) / hh || 0, 1e-6);
  const cut = Math.min(0.5, (inside * len + gap) / len);
  return {
    from: { x: a.x + dx * cut, y: a.y + dy * cut },
    to: { x: b.x - dx * cut, y: b.y - dy * cut },
  };
}

export interface Bounds { minX: number; minY: number; maxX: number; maxY: number }

export function boundsOf(points: Point[], layout: LayoutSpec): Bounds {
  const hw = layout.card.w / 2;
  const hh = layout.card.h / 2;
  return points.reduce<Bounds>(
    (b, p) => ({
      minX: Math.min(b.minX, p.x - hw), maxX: Math.max(b.maxX, p.x + hw),
      minY: Math.min(b.minY, p.y - hh), maxY: Math.max(b.maxY, p.y + hh),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );
}
