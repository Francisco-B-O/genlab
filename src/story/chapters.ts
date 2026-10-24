import { lab } from './chapters/lab';
import { ferment } from './chapters/ferment';
import { pasteur } from './chapters/pasteur';
import { peas } from './chapters/peas';
import { helix } from './chapters/helix';
import { typos } from './chapters/typos';
import { splice } from './chapters/splice';
import { copies } from './chapters/copies';
import { genomes } from './chapters/genomes';
import { editing } from './chapters/editing';
import { medicine } from './chapters/medicine';
import { food } from './chapters/food';
import { materials } from './chapters/materials';
import { energy } from './chapters/energy';
import { epilogue } from './chapters/epilogue';
import type { Chapter, Scene } from './dsl';

export type { Chapter, Line, Scene } from './dsl';

/** The story, in order. Each chapter lives in its own file under `chapters/`. */
export const CHAPTERS: Chapter[] = [
  lab,
  ferment,
  pasteur,
  peas,
  helix,
  typos,
  splice,
  copies,
  genomes,
  editing,
  medicine,
  food,
  materials,
  energy,
  epilogue,
];

export const ALL_SCENES: Scene[] = CHAPTERS.flatMap(c => c.scenes);

export function findScene(id: string): Scene | undefined {
  return ALL_SCENES.find(s => s.id === id);
}

export function chapterOf(sceneId: string): { chapter: Chapter; number: number } | undefined {
  const index = CHAPTERS.findIndex(c => c.scenes.some(s => s.id === sceneId));
  return index >= 0 ? { chapter: CHAPTERS[index], number: index } : undefined;
}
