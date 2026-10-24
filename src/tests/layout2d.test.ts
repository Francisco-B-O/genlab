import { describe, it, expect } from 'vitest';
import { LevelLoader, LEVEL_ORDER } from '../levels/LevelLoader';
import { LAYOUTS, cardsOverlap, edgeSegment, nodePoint, boundsOf } from '../ui/layout2d';

const loader = new LevelLoader();

describe('2D board layout', () => {
  it('keeps the reading order on both orientations', () => {
    const first = { x: -6, y: 2 };
    const last = { x: 6, y: 2 };
    expect(nodePoint(first, false).x).toBeLessThan(nodePoint(last, false).x);   // left → right
    expect(nodePoint(first, true).y).toBeLessThan(nodePoint(last, true).y);     // top → bottom
  });

  it('clips edges to the card borders and points the right way', () => {
    const layout = LAYOUTS.landscape;
    const { from, to } = edgeSegment({ x: 0, y: 0 }, { x: 300, y: 0 }, layout, 0);
    expect(from.x).toBeCloseTo(layout.card.w / 2);
    expect(to.x).toBeCloseTo(300 - layout.card.w / 2);
    expect(from.y).toBe(0);
  });

  it('computes bounds that include the cards themselves', () => {
    const layout = LAYOUTS.landscape;
    const b = boundsOf([{ x: 0, y: 0 }], layout);
    expect(b.maxX - b.minX).toBe(layout.card.w);
    expect(b.maxY - b.minY).toBe(layout.card.h);
  });

  // Every level with a board must be playable: no card may cover another, on any screen
  const levelsWithBoard = LEVEL_ORDER.filter(Boolean);
  it.each(levelsWithBoard)('%s: no two cards overlap (landscape and portrait)', async (id) => {
    const level = await loader.loadLevel(id);
    const nodes = level.biologicalContext.nodes.filter(n => level.puzzle.availableNodes.includes(n.id));
    for (const portrait of [false, true]) {
      const layout = portrait ? LAYOUTS.portrait : LAYOUTS.landscape;
      const pts = nodes.map(n => ({ id: n.id, p: nodePoint(n.position, portrait) }));
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          expect(
            cardsOverlap(pts[i].p, pts[j].p, layout),
            `${id} ${portrait ? 'portrait' : 'landscape'}: ${pts[i].id} / ${pts[j].id}`,
          ).toBe(false);
        }
      }
    }
  });
});
