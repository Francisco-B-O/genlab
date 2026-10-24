import type { IllustrationKind } from '../types/level.types';
import type { Mood, Speaker, ToolId } from './tools';

/**
 * The shapes of the story, and two helpers to write it. Text follows the bilingual
 * convention of the level files: English in the base field and Spanish in `<field>_es`
 * (resolved with `localize()`).
 *
 * The Doctor and Pipo are invented characters. Real scientists are only mentioned in
 * the third person, never given lines.
 */
export interface Line {
  who: Speaker;
  mood: Mood;
  text: string;
  text_es: string;
}

export interface Scene {
  id: string;
  /** Name shown on the map. */
  title: string;
  title_es: string;
  /** Level played in this scene; a scene without one is only dialogue. */
  level?: string;
  /** Tool handed over at the start of the scene. */
  tool?: ToolId;
  before: Line[];
  after: Line[];
}

export interface Chapter {
  id: string;
  kind: IllustrationKind;
  era: string;
  era_es: string;
  title: string;
  title_es: string;
  scenes: Scene[];
}

/** A line spoken by Doctor Genaro. */
export const doc = (mood: Mood, text: string, text_es: string): Line => ({ who: 'doc', mood, text, text_es });

/** A line spoken by Pipo, the robot. */
export const robot = (mood: Mood, text: string, text_es: string): Line => ({ who: 'robot', mood, text, text_es });
