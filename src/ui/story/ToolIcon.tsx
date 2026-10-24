import React from 'react';
import { INK } from '../theme';
import type { ToolId } from '../../story/tools';

// Notebook-style line icons of the laboratory tools, 60×60.
const stroke = {
  stroke: INK, strokeWidth: 2, fill: 'none',
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
};

const drawings: Record<ToolId, (accent: string) => React.ReactNode> = {
  microscope: (a) => (
    <g {...stroke}>
      <rect x="22" y="8" width="11" height="26" rx="3" transform="rotate(-18 27 21)" fill={a} fillOpacity={0.3} />
      <path d="M20 12l-4-2" />
      <path d="M26 35l-3 6h8l-2-6" />
      <path d="M40 22c8 3 12 14 5 24" />
      <path d="M14 50h30M18 50v-4h14v4" />
      <path d="M16 42h20" />
    </g>
  ),
  kit: (a) => (
    <g {...stroke}>
      <rect x="8" y="22" width="44" height="28" rx="5" fill={a} fillOpacity={0.3} />
      <path d="M22 22v-6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6" />
      <path d="M30 29v14M23 36h14" />
    </g>
  ),
  fermenter: (a) => (
    <g {...stroke}>
      <path d="M25 8h10M27 8v15L13 46c-2 5 1 8 6 8h22c5 0 8-3 6-8L33 23V8" />
      <path d="M17 40h26" strokeWidth={1.4} />
      <path d="M17 40l-4 8c-1 3 1 4 5 4h24c4 0 6-1 5-4l-4-8Z" fill={a} fillOpacity={0.35} stroke="none" />
      <circle cx="26" cy="46" r="2.2" /><circle cx="35" cy="44" r="1.6" /><circle cx="31" cy="49" r="1.4" />
    </g>
  ),
  pairer: (a) => (
    <g {...stroke}>
      <path d="M20 6c0 14 22 14 22 24s-22 10-22 24" />
      <path d="M42 6c0 14-22 14-22 24s22 10 22 24" />
      <path d="M25 13h12M22 30h18M25 47h12" fill="none" stroke={a} strokeWidth={2.4} />
    </g>
  ),
  sequencer: (a) => (
    <g {...stroke}>
      <rect x="6" y="14" width="44" height="20" rx="4" fill={a} fillOpacity={0.18} />
      <text x="12" y="29" fontSize="12" fill={INK} stroke="none" fontFamily="IBM Plex Mono" letterSpacing="3">ATGC</text>
      <circle cx="40" cy="40" r="11" fill="#fff" fillOpacity={0.7} />
      <path d="M48 48l9 9" strokeWidth={3} />
    </g>
  ),
  scissors: (a) => (
    <g {...stroke}>
      <circle cx="17" cy="46" r="7" fill={a} fillOpacity={0.25} />
      <circle cx="43" cy="46" r="7" fill={a} fillOpacity={0.25} />
      <path d="M21 40L46 8M39 40L14 8" />
      <path d="M30 28v-1" strokeWidth={3} />
    </g>
  ),
  builder: (a) => (
    <g {...stroke}>
      <rect x="5" y="20" width="14" height="18" rx="3" fill={a} fillOpacity={0.25} />
      <rect x="23" y="20" width="14" height="18" rx="3" fill={a} fillOpacity={0.4} />
      <rect x="41" y="20" width="14" height="18" rx="3" fill={a} fillOpacity={0.25} />
      <path d="M12 46h36M44 41l4 5-4 5" />
      <path d="M12 14v-4h36v4" />
    </g>
  ),
  timeline: (a) => (
    <g {...stroke}>
      <path d="M8 44h44" />
      <circle cx="14" cy="44" r="3" fill={a} fillOpacity={0.5} />
      <circle cx="30" cy="44" r="3" fill={a} fillOpacity={0.5} />
      <circle cx="46" cy="44" r="3" fill={a} fillOpacity={0.5} />
      <rect x="8" y="14" width="14" height="18" rx="3" fill={a} fillOpacity={0.25} />
      <rect x="23" y="20" width="14" height="12" rx="3" fill={a} fillOpacity={0.25} />
      <rect x="38" y="26" width="14" height="6" rx="3" fill={a} fillOpacity={0.25} />
      <path d="M14 36v4M30 36v4M46 36v4" strokeWidth={1.5} />
    </g>
  ),
  assembler: (a) => (
    <g {...stroke}>
      <rect x="5" y="14" width="26" height="12" rx="4" fill={a} fillOpacity={0.3} />
      <rect x="22" y="28" width="26" height="12" rx="4" fill={a} fillOpacity={0.2} />
      <rect x="12" y="42" width="26" height="12" rx="4" fill={a} fillOpacity={0.3} />
      <path d="M22 14v12M31 28v12M12 42v12" strokeWidth={1.4} strokeDasharray="2 3" />
    </g>
  ),
  crispr: (a) => (
    <g {...stroke}>
      <path d="M10 14h40M10 22h40" />
      <path d="M18 14v8M26 14v8M34 14v8M42 14v8" strokeWidth={1.4} />
      <path d="M30 8v10" stroke={a} strokeWidth={3} />
      <circle cx="19" cy="42" r="6" fill={a} fillOpacity={0.25} />
      <circle cx="41" cy="42" r="6" fill={a} fillOpacity={0.25} />
      <path d="M23 38L34 26M37 38L26 26" />
    </g>
  ),
  punnett: (a) => (
    <g {...stroke}>
      <rect x="12" y="12" width="38" height="38" rx="3" fill={a} fillOpacity={0.18} />
      <path d="M31 12v38M12 31h38" />
      {[['R', 22, 26], ['r', 40, 26], ['R', 22, 45], ['r', 40, 45]].map(([ch, x, y], i) => (
        <text key={i} x={x as number} y={y as number} fontSize="13" textAnchor="middle" fill={INK} stroke="none"
          fontFamily="IBM Plex Mono">{ch}</text>
      ))}
    </g>
  ),
};

export const TOOL_INK: Record<ToolId, string> = {
  microscope: '#2f5fa8',
  kit: '#b4382b',
  fermenter: '#c0832a',
  punnett: '#2f7d4f',
  pairer: '#8b3a7e',
  sequencer: '#2f7d6d',
  scissors: '#b4382b',
  builder: '#2f5fa8',
  timeline: '#a87a0c',
  assembler: '#2f7d4f',
  crispr: '#b4382b',
};

export const ToolIcon: React.FC<{ tool: ToolId; size?: number }> = ({ tool, size = 48 }) => (
  <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden>
    {drawings[tool](TOOL_INK[tool])}
  </svg>
);
