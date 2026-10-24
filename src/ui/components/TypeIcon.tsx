import React from 'react';
import type { NodeType } from '../../types/biology.types';
import { NODE_INK } from '../theme';

/** Small hand-drawn style glyph for each piece type. */
export const TypeIcon: React.FC<{ type: NodeType; size?: number; color?: string }> = ({
  type, size = 18, color,
}) => {
  const c = color ?? NODE_INK[type];
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: c, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (type) {
    case 'gene': // double helix
      return (
        <svg {...common}>
          <path d="M7 3c0 5 10 6 10 9s-10 4-10 9" />
          <path d="M17 3c0 5-10 6-10 9s10 4 10 9" />
          <path d="M9 6.5h6M9 17.5h6" />
        </svg>
      );
    case 'enzyme': // pac-man shaped machine with active site
      return (
        <svg {...common}>
          <path d="M20 8.5A9 9 0 1 0 20 15.5L13 12Z" fill={c} fillOpacity={0.15} />
          <circle cx="9.5" cy="8" r="1" fill={c} />
        </svg>
      );
    case 'protein': // folded chain
      return (
        <svg {...common}>
          <path d="M4 17c2-6 5 2 7-4s5 3 7-3 2-4 2-4" />
          <circle cx="4" cy="17" r="1.5" fill={c} />
          <circle cx="20" cy="6" r="1.5" fill={c} />
        </svg>
      );
    case 'reaction': // conversion arrows
      return (
        <svg {...common}>
          <path d="M4 9h14l-3-3" />
          <path d="M20 15H6l3 3" />
        </svg>
      );
    case 'metabolite': // hexagon ring
      return (
        <svg {...common}>
          <path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9Z" fill={c} fillOpacity={0.12} />
          <path d="M12 7.5l3.9 2.25v4.5L12 16.5l-3.9-2.25v-4.5Z" />
        </svg>
      );
    case 'phenotype': // spark / visible outcome
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
          <circle cx="12" cy="12" r="2.2" fill={c} />
        </svg>
      );
    case 'organelle': // oval with inner membrane
      return (
        <svg {...common}>
          <ellipse cx="12" cy="12" rx="9" ry="6" fill={c} fillOpacity={0.12} />
          <path d="M6 12c2-3 3 3 5 0s3 3 5 0 2 2 2 2" />
        </svg>
      );
    case 'tissue': // cells
      return (
        <svg {...common}>
          <rect x="3" y="5" width="8" height="7" rx="2" />
          <rect x="13" y="5" width="8" height="7" rx="2" />
          <rect x="8" y="13" width="8" height="7" rx="2" />
        </svg>
      );
    default:
      return <svg {...common}><circle cx="12" cy="12" r="7" /></svg>;
  }
};

/**
 * Larger solid shape for each piece type: the same silhouettes the 3D board used
 * (helix, open sphere, faceted ball, cube, hex disk, gem, capsule, block), drawn flat
 * with a few tones of the type's ink so each kind is recognisable at a glance.
 */
export const PieceShape: React.FC<{ type: NodeType; size?: number; color?: string }> = ({
  type, size = 34, color,
}) => {
  const c = color ?? NODE_INK[type];
  const common = {
    width: size, height: size, viewBox: '0 0 40 40', fill: 'none',
    stroke: c, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  const face = (points: string, opacity: number) => (
    <polygon points={points} fill={c} fillOpacity={opacity} />
  );

  switch (type) {
    case 'gene': // double helix with rungs
      return (
        <svg {...common}>
          <path d="M12 3c0 9 16 11 16 17s-16 8-16 17" strokeWidth={3.6} />
          <path d="M28 3c0 9-16 11-16 17s16 8 16 17" strokeWidth={3.6} strokeOpacity={0.55} />
          <path d="M14 9.5h12M15 30.5h10" strokeWidth={2.2} />
          <path d="M16 20h8" strokeWidth={2.2} />
        </svg>
      );
    case 'enzyme': // sphere with a bite taken out: the active site
      return (
        <svg {...common}>
          <path d="M34 11A16 16 0 1 0 34 29L21 20Z" fill={c} fillOpacity={0.8} />
          <path d="M11 13a11 11 0 0 1 8-6" stroke="#fff" strokeOpacity={0.55} strokeWidth={2.4} />
          <circle cx="28" cy="20" r="1.8" fill={c} stroke="none" />
        </svg>
      );
    case 'protein': // faceted ball
      return (
        <svg {...common}>
          {face('20,3 36,15 30,34 10,34 4,15', 0.35)}
          {face('20,13 27,18 24.5,27 15.5,27 13,18', 0.85)}
          <path d="M20 13V3M27 18l9-3M24.5 27l5.5 7M15.5 27L10 34M13 18L4 15" />
        </svg>
      );
    case 'reaction': // cube
      return (
        <svg {...common}>
          {face('20,4 35,12 20,20 5,12', 0.4)}
          {face('5,12 20,20 20,36 5,28', 0.85)}
          {face('35,12 20,20 20,36 35,28', 0.62)}
        </svg>
      );
    case 'metabolite': // hexagonal disk
      return (
        <svg {...common}>
          {face('20,8 32,15 32,29 20,36 8,29 8,15', 0.9)}
          {face('20,4 32,11 32,25 20,32 8,25 8,11', 0.4)}
          <path d="M20 10l6 3.5v7L20 24l-6-3.5v-7Z" fill="#fff" fillOpacity={0.35} />
        </svg>
      );
    case 'phenotype': // gem
      return (
        <svg {...common}>
          {face('20,3 5,20 20,26', 0.45)}
          {face('20,3 35,20 20,26', 0.75)}
          {face('5,20 20,26 20,37', 0.88)}
          {face('35,20 20,26 20,37', 0.62)}
        </svg>
      );
    case 'organelle': // capsule with an inner membrane
      return (
        <svg {...common}>
          <rect x="3" y="10" width="34" height="20" rx="10" fill={c} fillOpacity={0.3} />
          <path d="M9 20c2.5-5 4 5 6.5 0s4 5 6.5 0 4 4 6 0" strokeWidth={2} />
          <path d="M9 14.5h8" stroke="#fff" strokeOpacity={0.6} strokeWidth={2} />
        </svg>
      );
    case 'tissue': // block of cells
      return (
        <svg {...common}>
          {face('4,15 11,7 37,7 30,15', 0.38)}
          {face('4,15 30,15 30,34 4,34', 0.6)}
          {face('30,15 37,7 37,26 30,34', 0.88)}
          <path d="M12.7 15v19M21.3 15v19M4 24.5h26" strokeOpacity={0.7} />
        </svg>
      );
    default:
      return <svg {...common}><circle cx="20" cy="20" r="14" fill={c} fillOpacity={0.5} /></svg>;
  }
};
