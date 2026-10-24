import React from 'react';
import type { IllustrationKind } from '../../types/level.types';
import { INK } from '../theme';

// Simple line drawings in the style of notebook sketches.
// All share a 200×160 viewBox, ink strokes and one accent wash.

const stroke = {
  stroke: INK, strokeWidth: 1.6, fill: 'none',
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
};

const drawings: Record<IllustrationKind, (accent: string) => React.ReactNode> = {
  plant: (a) => (
    <g {...stroke}>
      <path d="M100 150V40" />
      <path d="M100 120c-20-10-40-30-48-60M100 100c18-12 34-30 40-58M100 80c-12-10-22-26-24-46M100 70c10-10 16-24 16-40" />
      {[[100, 38], [116, 30], [76, 34], [140, 42], [52, 60]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="5" ry="9" fill={a} fillOpacity={0.35} transform={`rotate(-20 ${x} ${y})`} />
      ))}
      <path d="M60 150h80" />
    </g>
  ),
  grain: (a) => (
    <g {...stroke}>
      <path d="M100 20c38 10 52 50 44 90-6 28-24 40-44 40s-38-12-44-40c-8-40 6-80 44-90Z" fill={a} fillOpacity={0.3} />
      <path d="M100 32c26 10 36 42 30 74" strokeDasharray="3 5" />
      <path d="M86 140c6-30 4-70 14-108" />
      <text x="150" y="150" fontSize="11" fill={INK} stroke="none" fontFamily="IBM Plex Mono">endosperm</text>
    </g>
  ),
  bacterium: (a) => (
    <g {...stroke}>
      <rect x="40" y="55" width="120" height="50" rx="25" fill={a} fillOpacity={0.25} />
      <path d="M160 80c14 0 14-16 28-16M160 86c12 4 16 18 30 16M40 80c-14 0-14 14-28 14" />
      <circle cx="78" cy="80" r="9" strokeDasharray="3 3" />
      <path d="M100 70c10 4 20-4 30 4s-6 14 6 16" />
      <text x="56" y="128" fontSize="10" fill={INK} stroke="none" fontFamily="IBM Plex Mono">plasmid</text>
      <path d="M68 118l6-26" strokeWidth="1" />
    </g>
  ),
  yeast: (a) => (
    <g {...stroke}>
      <ellipse cx="90" cy="88" rx="44" ry="38" fill={a} fillOpacity={0.25} />
      <ellipse cx="146" cy="56" rx="20" ry="17" fill={a} fillOpacity={0.2} />
      <circle cx="84" cy="82" r="12" />
      <ellipse cx="104" cy="104" rx="8" ry="5" />
      <path d="M128 66c4-2 6-2 8-4" />
      <circle cx="60" cy="72" r="3" />
    </g>
  ),
  jellyfish: (a) => (
    <g {...stroke}>
      <path d="M48 76c0-30 24-50 52-50s52 20 52 50c-12 6-24-4-34 2s-24 4-36 0-22 6-34-2Z" fill={a} fillOpacity={0.35} />
      {[60, 78, 96, 114, 132].map((x, i) => (
        <path key={i} d={`M${x} 80c-6 14 8 22 0 36s6 22 0 30`} />
      ))}
      <circle cx="80" cy="56" r="3" fill={a} />
      <circle cx="118" cy="52" r="3" fill={a} />
    </g>
  ),
  cell: (a) => (
    <g {...stroke}>
      <path d="M30 80c0-36 30-58 70-58s70 22 70 58-30 58-70 58-70-22-70-58Z" />
      <circle cx="96" cy="78" r="20" fill={a} fillOpacity={0.3} />
      <circle cx="96" cy="78" r="6" />
      <ellipse cx="140" cy="62" rx="14" ry="8" />
      <ellipse cx="60" cy="104" rx="16" ry="9" />
      <ellipse cx="136" cy="106" rx="10" ry="6" />
      <path d="M52 56c6-4 12 2 18-2" />
    </g>
  ),
  plastid: (a) => (
    <g {...stroke}>
      <ellipse cx="100" cy="80" rx="74" ry="44" />
      <ellipse cx="100" cy="80" rx="66" ry="37" fill={a} fillOpacity={0.2} />
      {[[74, 70], [112, 66], [94, 96], [134, 90]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="14" ry="10" fill={INK} fillOpacity={0.06} />
      ))}
    </g>
  ),
  dna: (a) => (
    <g {...stroke}>
      <path d="M30 40c30 0 40 80 70 80s40-80 70-80" />
      <path d="M30 120c30 0 40-80 70-80s40 80 70 80" />
      {[[44, 46, 114], [58, 58, 102], [142, 58, 102], [156, 46, 114]].map(([x, y1, y2], i) => (
        <path key={i} d={`M${x} ${y1}V${y2}`} stroke={a} />
      ))}
    </g>
  ),
  pathway: (a) => (
    <g {...stroke}>
      {[[20, 'G'], [70, 'E'], [120, 'R'], [170, 'M']].map(([x, l], i) => (
        <g key={i}>
          <rect x={Number(x) - 18} y="62" width="36" height="36" rx="6" fill={a} fillOpacity={0.15 + i * 0.08} />
          <text x={Number(x)} y="85" textAnchor="middle" fontSize="13" fill={INK} stroke="none" fontFamily="IBM Plex Mono">{l}</text>
        </g>
      ))}
      <path d="M40 80h10M90 80h10M140 80h10" />
      <path d="M46 76l4 4-4 4M96 76l4 4-4 4M146 76l4 4-4 4" />
    </g>
  ),
  milk: (a) => (
    <g {...stroke}>
      <path d="M76 30h48v14l12 20v70a8 8 0 0 1-8 8H72a8 8 0 0 1-8-8V64l12-20Z" />
      <path d="M66 80h68v54a6 6 0 0 1-6 6H72a6 6 0 0 1-6-6Z" fill={a} fillOpacity={0.3} />
      <path d="M76 44h48" />
      <text x="100" y="116" textAnchor="middle" fontSize="11" fill={INK} stroke="none" fontFamily="IBM Plex Mono">0% lact.</text>
    </g>
  ),
  flask: (a) => (
    <g {...stroke}>
      <path d="M84 24h32M90 24v40l-36 62a10 10 0 0 0 9 15h74a10 10 0 0 0 9-15l-36-62V24" />
      <path d="M68 104h64l14 24a6 6 0 0 1-5 9H59a6 6 0 0 1-5-9Z" fill={a} fillOpacity={0.35} />
      <circle cx="92" cy="118" r="3" /><circle cx="110" cy="112" r="2" /><circle cx="104" cy="126" r="2.5" />
    </g>
  ),
  cheese: (a) => (
    <g {...stroke}>
      <path d="M30 110l120-62 20 30v44H30Z" fill={a} fillOpacity={0.35} />
      <path d="M30 110h140M150 48l20 30" />
      <circle cx="70" cy="130" r="7" /><circle cx="118" cy="138" r="5" /><circle cx="148" cy="122" r="6" />
      <circle cx="96" cy="120" r="3" /><circle cx="134" cy="96" r="4" />
    </g>
  ),
  tomato: (a) => (
    <g {...stroke}>
      <path d="M100 46c40 0 66 24 66 56s-28 46-66 46-66-14-66-46 26-56 66-56Z" fill={a} fillOpacity={0.45} />
      <path d="M100 46l-4-16M100 46c-10-8-24-8-30-2 10 2 18 6 22 10M100 46c10-8 24-8 30-2-10 2-18 6-22 10" />
      <path d="M62 90c8-14 20-20 34-20" strokeDasharray="2 5" />
    </g>
  ),
  bottle: (a) => (
    <g {...stroke}>
      <path d="M88 20h24v14c0 6 14 12 14 26v86a6 6 0 0 1-6 6H80a6 6 0 0 1-6-6V60c0-14 14-20 14-26Z" />
      <path d="M74 90h52v56a6 6 0 0 1-6 6H80a6 6 0 0 1-6-6Z" fill={a} fillOpacity={0.25} />
      <path d="M74 76h52M74 82h52" />
      <path d="M140 120l8-8m4 8l8-8m-12 20l8-8" />
    </g>
  ),
  blood: (a) => (
    <g {...stroke}>
      {[[62, 66], [128, 58], [96, 110], [150, 116]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx="26" ry="20" fill={a} fillOpacity={0.35} />
          <ellipse cx={x} cy={y} rx="11" ry="7" />
        </g>
      ))}
      <path d="M30 120c10-6 22-8 30-2-8 8-22 10-30 2Z" fill={a} fillOpacity={0.2} />
    </g>
  ),
  shirt: (a) => (
    <g {...stroke}>
      <path d="M70 28l-34 18 12 26 14-6v70h76V66l14 6 12-26-34-18c-4 12-16 18-30 18s-26-6-30-18Z" />
      <ellipse cx="88" cy="96" rx="12" ry="8" fill={a} fillOpacity={0.45} />
      <ellipse cx="116" cy="118" rx="8" ry="6" fill={a} fillOpacity={0.3} />
      <path d="M150 104l8-6m-2 16l8-6" />
    </g>
  ),
  jeans: (a) => (
    <g {...stroke}>
      <path d="M66 22h68l10 126h-30l-14-82-14 82H56Z" fill={a} fillOpacity={0.45} />
      <path d="M66 34h68M100 34v26M74 44c6 8 14 10 20 8M126 44c-6 8-14 10-20 8" />
    </g>
  ),
  flower: (a) => (
    <g {...stroke}>
      <path d="M100 150V86" />
      <path d="M100 120c-14-4-24-14-26-26 14 2 22 12 26 26Z" />
      {[0, 72, 144, 216, 288].map(r => (
        <ellipse key={r} cx="100" cy="54" rx="13" ry="22" fill={a} fillOpacity={0.4} transform={`rotate(${r} 100 76)`} />
      ))}
      <circle cx="100" cy="76" r="7" fill={a} />
      <path d="M44 40l6 4M156 40l-6 4M40 92h8M152 92h8" strokeDasharray="1 4" />
    </g>
  ),
  vanilla: (a) => (
    <g {...stroke}>
      <path d="M40 130c30-20 70-60 120-100" />
      <path d="M50 132c30-20 70-60 120-100" />
      <path d="M40 130c2 4 6 4 10 2M160 30c4-2 8 0 10 2" />
      <ellipse cx="70" cy="58" rx="22" ry="14" fill={a} fillOpacity={0.4} transform="rotate(-30 70 58)" />
      <ellipse cx="62" cy="48" rx="10" ry="16" fill={a} fillOpacity={0.3} transform="rotate(20 62 48)" />
    </g>
  ),
  strip: (a) => (
    <g {...stroke}>
      <rect x="40" y="66" width="120" height="28" rx="4" />
      <rect x="120" y="70" width="32" height="20" rx="2" fill={a} fillOpacity={0.55} />
      <path d="M48 80h56" strokeDasharray="3 4" />
      <path d="M136 28c0 0-10 14-10 20a10 10 0 0 0 20 0c0-6-10-20-10-20Z" fill="#b4382b" fillOpacity={0.5} />
      <path d="M136 60v6" />
    </g>
  ),
  burger: (a) => (
    <g {...stroke}>
      <path d="M44 72c0-26 25-40 56-40s56 14 56 40Z" fill="#e0a526" fillOpacity={0.35} />
      <path d="M40 84h120" strokeWidth={5} stroke={a} />
      <rect x="42" y="88" width="116" height="16" rx="8" fill={a} fillOpacity={0.6} />
      <path d="M40 110h120" stroke="#3aa36b" strokeWidth={4} />
      <path d="M44 116h112c0 14-24 22-56 22s-56-8-56-22Z" fill="#e0a526" fillOpacity={0.35} />
      <path d="M78 46l2 2M100 42l2 2M120 48l2 2" />
    </g>
  ),
  wheat: (a) => (
    <g {...stroke}>
      {[-30, 0, 30].map((dx, i) => (
        <g key={i} transform={`translate(${dx} ${i === 1 ? -8 : 0})`}>
          <path d="M100 150V60" />
          {[0, 1, 2, 3].map(k => (
            <g key={k}>
              <ellipse cx="94" cy={64 + k * 12} rx="5" ry="8" fill={a} fillOpacity={0.4} transform={`rotate(-25 94 ${64 + k * 12})`} />
              <ellipse cx="106" cy={64 + k * 12} rx="5" ry="8" fill={a} fillOpacity={0.4} transform={`rotate(25 106 ${64 + k * 12})`} />
            </g>
          ))}
        </g>
      ))}
    </g>
  ),
  bread: (a) => (
    <g {...stroke}>
      <path d="M36 112c-8-30 8-58 40-62 10-14 38-14 48 0 32 4 48 32 40 62Z" fill={a} fillOpacity={0.4} />
      <path d="M36 112h128v14c0 4-3 6-6 6H42c-3 0-6-2-6-6Z" />
      <path d="M78 66l8 14M102 62l8 14M126 66l8 14" />
    </g>
  ),
  banana: (a) => (
    <g {...stroke}>
      <path d="M52 40c8 52 46 86 96 84-4 6-12 10-20 10-50 0-88-40-92-90 2-4 8-6 16-4Z" fill={a} fillOpacity={0.45} />
      <path d="M52 40l-4-12M148 124l8 2" />
      <path d="M150 42c4 4 4 8 2 12M162 54c4 4 4 8 2 12M140 34c3 3 3 6 1 9" strokeDasharray="1 4" />
    </g>
  ),
  silk: (a) => (
    <g {...stroke}>
      <path d="M100 8v62" />
      <ellipse cx="100" cy="86" rx="12" ry="16" fill={a} fillOpacity={0.4} />
      <circle cx="100" cy="68" r="6" />
      <path d="M90 82l-26-10M90 90l-30 4M92 98l-26 20M110 82l26-10M110 90l30 4M108 98l26 20" />
      <path d="M40 140c20-10 40 6 60-4s40 6 60-4" strokeDasharray="2 5" />
    </g>
  ),
};

export const Illustration: React.FC<{ kind: IllustrationKind; accent?: string; size?: number }> = ({
  kind, accent = '#c0532b', size = 220,
}) => (
  <svg width={size} height={(size * 160) / 200} viewBox="0 0 200 160" role="img" aria-hidden>
    {drawings[kind]?.(accent)}
  </svg>
);
