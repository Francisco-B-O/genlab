import type { LevelMode } from '../types/level.types';

/**
 * The tools of the laboratory. Each one is a way of playing (a level mode): the story
 * hands it over in a scene, and from then on it shows as unlocked in the toolbox.
 */
export type ToolId =
  | 'microscope' | 'kit' | 'fermenter' | 'timeline' | 'punnett' | 'pairer'
  | 'sequencer' | 'scissors' | 'builder' | 'assembler' | 'crispr';

/** Every tool, in the order the story unlocks them. */
export const TOOLS: ToolId[] = [
  'microscope', 'kit', 'fermenter', 'timeline', 'punnett', 'pairer', 'sequencer', 'scissors', 'builder', 'assembler', 'crispr',
];

export const TOOL_MODE: Record<ToolId, LevelMode> = {
  microscope: 'pathway',
  kit: 'diagnose',
  fermenter: 'tune',
  timeline: 'sequence',
  punnett: 'inherit',
  pairer: 'pairing',
  sequencer: 'mutation',
  scissors: 'cut',
  builder: 'construct',
  assembler: 'assemble',
  crispr: 'crispr',
};

/** The two characters of the story. Their names live in the i18n files (`story.characters`). */
export type Speaker = 'doc' | 'robot';
export type Mood = 'neutral' | 'happy' | 'worried' | 'surprised' | 'thinking';
