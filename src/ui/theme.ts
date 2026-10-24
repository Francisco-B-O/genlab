import type { EdgeType, NodeType } from '../types/biology.types';

// Ink colours per piece type — like coloured pens in a lab notebook.
export const NODE_INK: Record<NodeType, string> = {
  gene:       '#2f7d6d',
  protein:    '#4f5fb0',
  enzyme:     '#2f5fa8',
  reaction:   '#c0532b',
  metabolite: '#a87a0c',
  phenotype:  '#8b3a7e',
  organelle:  '#6b7a2a',
  tissue:     '#8a5a3c',
};

export const EDGE_INK: Record<EdgeType, string> = {
  encodes:      '#2f7d6d',
  catalyzes:    '#2f5fa8',
  consumes:     '#a87a0c',
  produces:     '#c0532b',
  influences:   '#8b3a7e',
  regulates:    '#4f5fb0',
  represses:    '#b4382b',
  localizes_to: '#6b7a2a',
};

export const INK = '#1e2633';
export const PAPER = '#f4efe4';
export const HIGHLIGHT = '#f2cf4a';
export const TRAP_INK = '#8d8a80';

/** Display order of piece types in lists and legends. */
export const TYPE_ORDER: NodeType[] = [
  'gene', 'protein', 'enzyme', 'reaction', 'metabolite', 'phenotype', 'organelle', 'tissue',
];

/** Translucent tint of a hex colour, for backgrounds. */
export function tint(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
