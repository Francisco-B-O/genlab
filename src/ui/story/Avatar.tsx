import React from 'react';
import { INK, HIGHLIGHT } from '../theme';
import type { Mood, Speaker } from '../../story/tools';

// Line drawings in the style of the notebook illustrations. Both characters share a
// 120×150 viewBox; the mood only changes eyes, brows, mouth and the antenna light.

const line = {
  stroke: INK, strokeWidth: 1.8, fill: 'none',
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
};

const SKIN = '#f1d9bf';
const PAPER = '#fffcf5';
const BLUE = '#2f5fa8';
const TEAL = '#2f7d6d';
const SCREEN = '#1e2633';
const GLOW = '#bfe9d6';

/** Doctor Genaro: wild white hair, round glasses, lab coat and a pocket watch that glows. */
const Doctor: React.FC<{ mood: Mood }> = ({ mood }) => {
  const brows: Record<Mood, [string, string]> = {
    neutral: ['M43 49q7-3 14 0', 'M63 49q7-3 14 0'],
    happy: ['M43 47q7-4 14 0', 'M63 47q7-4 14 0'],
    worried: ['M43 52L57 46', 'M63 46L77 52'],
    surprised: ['M44 43q6-4 12 0', 'M64 43q6-4 12 0'],
    thinking: ['M43 45q7-4 14 0', 'M63 50q7-1 14 0'],
  };
  const mouth: Record<Mood, React.ReactNode> = {
    neutral: <path d="M53 75q7 3 14 0" {...line} />,
    happy: <path d="M51 72q9 11 18 0z" {...line} fill="#fff" />,
    worried: <path d="M53 77q3.5-3 7 0t7 0" {...line} />,
    surprised: <ellipse cx="60" cy="76" rx="3.5" ry="4.6" {...line} fill="#fff" />,
    thinking: <path d="M55 76q6-2 12-3" {...line} />,
  };
  // Pupils look up and to the side when thinking; happy eyes are closed arcs
  const eyes: React.ReactNode =
    mood === 'happy' ? (
      <>
        <path d="M46 60q4-5 8 0" {...line} />
        <path d="M66 60q4-5 8 0" {...line} />
      </>
    ) : (
      <>
        <circle cx={mood === 'thinking' ? 53 : 50} cy={mood === 'thinking' ? 56 : 59} r={mood === 'surprised' ? 1.6 : 2.2} fill={INK} />
        <circle cx={mood === 'thinking' ? 73 : 70} cy={mood === 'thinking' ? 56 : 59} r={mood === 'surprised' ? 1.6 : 2.2} fill={INK} />
      </>
    );

  return (
    <g>
      {/* coat */}
      <path d="M20 150C20 110 36 93 60 93s40 17 40 57Z" {...line} fill={PAPER} />
      <path d="M46 95l14 22 14-22" {...line} />
      <path d="M60 117v33" {...line} strokeWidth={1.2} />
      <path d="M60 110l-4 8 4 14 4-14z" {...line} fill={BLUE} fillOpacity={0.35} />
      {/* pocket watch */}
      <path d="M82 113c-2-8-8-13-14-15" {...line} strokeWidth={1.2} />
      <g className="avatar__glow">
        <circle cx="84" cy="120" r="9" fill={HIGHLIGHT} fillOpacity={0.35} stroke="none" />
        <circle cx="84" cy="120" r="6" {...line} fill={HIGHLIGHT} fillOpacity={0.8} />
        <path d="M84 116v4l3 2" {...line} strokeWidth={1.3} />
      </g>
      {/* neck and head */}
      <path d="M52 80v14M68 80v14" {...line} />
      <ellipse cx="60" cy="58" rx="22" ry="25" {...line} fill={SKIN} />
      {/* wild hair */}
      <path
        d="M38 56C28 46 34 32 44 32c2-10 16-14 26-8 10-4 22 6 16 16 8 6 4 16-2 18 0-12-6-22-24-24-14 2-22 12-22 22Z"
        {...line} fill="#fff"
      />
      <path d="M34 44l-8-4 6-5M86 40l9-5-4 8M48 26l-4-9 8 3M72 22l3-9 6 7" {...line} />
      {/* glasses */}
      <circle cx="50" cy="58" r="8.5" {...line} fill="#fff" fillOpacity={0.7} />
      <circle cx="70" cy="58" r="8.5" {...line} fill="#fff" fillOpacity={0.7} />
      <path d="M58.5 57q1.5-2 3 0M41.5 57l-5-2M78.5 57l5-2" {...line} />
      {eyes}
      <path d={brows[mood][0]} {...line} />
      <path d={brows[mood][1]} {...line} />
      <path d="M60 62q-3 7 1 8" {...line} strokeWidth={1.4} />
      {mouth[mood]}
    </g>
  );
};

const ANTENNA: Record<Mood, string> = {
  neutral: HIGHLIGHT,
  happy: '#3aa36b',
  worried: '#d98a2b',
  surprised: BLUE,
  thinking: '#8b3a7e',
};

/** Pipo: a small round robot with a screen for a face and a pipette in one hand. */
const Robot: React.FC<{ mood: Mood }> = ({ mood }) => {
  const eyes: Record<Mood, React.ReactNode> = {
    neutral: (
      <>
        <circle cx="47" cy="56" r="4.5" fill={GLOW} />
        <circle cx="73" cy="56" r="4.5" fill={GLOW} />
      </>
    ),
    happy: (
      <>
        <path d="M42 58q5-8 10 0" stroke={GLOW} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M68 58q5-8 10 0" stroke={GLOW} strokeWidth={3} fill="none" strokeLinecap="round" />
      </>
    ),
    worried: (
      <>
        <circle cx="47" cy="57" r="4.5" fill={GLOW} />
        <circle cx="73" cy="57" r="4.5" fill={GLOW} />
        <path d="M41 49l12-4M67 45l12 4" stroke={GLOW} strokeWidth={2.4} strokeLinecap="round" />
        <path d="M86 48q3 5 0 7q-3-2 0-7Z" fill="#7fc4e8" />
      </>
    ),
    surprised: (
      <>
        <circle cx="46" cy="56" r="7.5" fill={GLOW} />
        <circle cx="74" cy="56" r="7.5" fill={GLOW} />
        <circle cx="46" cy="56" r="2.4" fill={SCREEN} />
        <circle cx="74" cy="56" r="2.4" fill={SCREEN} />
      </>
    ),
    thinking: (
      <>
        <circle cx="47" cy="56" r="4.5" fill={GLOW} />
        <path d="M68 56h10" stroke={GLOW} strokeWidth={3} strokeLinecap="round" />
        <circle cx="84" cy="46" r="1.6" fill={GLOW} />
        <circle cx="89" cy="43" r="1.6" fill={GLOW} />
      </>
    ),
  };
  const mouth: Record<Mood, React.ReactNode> = {
    neutral: <path d="M54 68h12" stroke={GLOW} strokeWidth={2.4} strokeLinecap="round" />,
    happy: <path d="M51 65q9 9 18 0" stroke={GLOW} strokeWidth={2.4} fill="none" strokeLinecap="round" />,
    worried: <path d="M52 69q4-3 8 0t8 0" stroke={GLOW} strokeWidth={2.4} fill="none" strokeLinecap="round" />,
    surprised: <ellipse cx="60" cy="68" rx="3" ry="4" stroke={GLOW} strokeWidth={2.2} fill="none" />,
    thinking: <path d="M56 68h9" stroke={GLOW} strokeWidth={2.4} strokeLinecap="round" />,
  };

  return (
    <g>
      {/* wheels and body */}
      <circle cx="42" cy="141" r="8" {...line} fill="#d8ceb9" />
      <circle cx="78" cy="141" r="8" {...line} fill="#d8ceb9" />
      <rect x="28" y="86" width="64" height="48" rx="12" {...line} fill={TEAL} fillOpacity={0.28} />
      <rect x="44" y="98" width="32" height="14" rx="4" {...line} fill={PAPER} />
      <circle cx="52" cy="105" r="2" fill={ANTENNA[mood]} />
      <circle cx="60" cy="105" r="2" fill={INK} fillOpacity={0.4} />
      <circle cx="68" cy="105" r="2" fill={INK} fillOpacity={0.4} />
      {/* arms; the right one holds a pipette */}
      <path d="M28 102q-12 6-10 22" {...line} />
      <circle cx="18" cy="126" r="3.5" {...line} fill={PAPER} />
      <path d="M92 102q12-2 16-14" {...line} />
      <circle cx="108" cy="86" r="3.5" {...line} fill={PAPER} />
      <rect x="104" y="52" width="7" height="34" rx="3.5" {...line} fill={BLUE} fillOpacity={0.3} transform="rotate(8 107 69)" />
      <path d="M114 52a5 5 0 1 0-8 0" {...line} fill={BLUE} fillOpacity={0.5} transform="rotate(8 107 69)" />
      <path d="M107 86v8" {...line} transform="rotate(8 107 90)" />
      {/* neck and head */}
      <path d="M54 86v-6M66 86v-6" {...line} />
      <rect x="20" y="48" width="6" height="16" rx="3" {...line} fill={PAPER} />
      <rect x="94" y="48" width="6" height="16" rx="3" {...line} fill={PAPER} />
      <rect x="26" y="34" width="68" height="46" rx="14" {...line} fill={PAPER} />
      <path d="M60 34V22" {...line} />
      <circle cx="60" cy="18" r="5" {...line} fill={ANTENNA[mood]} />
      <rect x="32" y="40" width="56" height="34" rx="9" fill={SCREEN} />
      {eyes[mood]}
      {mouth[mood]}
    </g>
  );
};

export interface AvatarProps {
  who: Speaker;
  mood?: Mood;
  size?: number;
  /** The character that is not speaking is shown dimmer. */
  dim?: boolean;
  label?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ who, mood = 'neutral', size = 140, dim = false, label }) => (
  <svg
    className={`avatar avatar--${who}${dim ? ' is-dim' : ''}`}
    viewBox="0 0 120 150"
    width={size}
    height={(size * 150) / 120}
    role="img"
    aria-label={label ?? who}
  >
    {who === 'doc' ? <Doctor mood={mood} /> : <Robot mood={mood} />}
  </svg>
);
