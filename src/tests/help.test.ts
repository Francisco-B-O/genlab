import { describe, it, expect } from 'vitest';
import { es, en } from '../i18n';
import { TOURS } from '../game/tours';
import type { LevelMode } from '../types/level.types';

const MODES = Object.keys(TOURS) as LevelMode[];

describe('help for every way of playing', () => {
  it.each(MODES)('%s: has an introduction, a glossary and a tutorial, in both languages', (mode) => {
    for (const lang of [es, en]) {
      expect(lang.modes[mode].trim(), 'name').not.toBe('');
      expect(lang.modeIntro[mode].trim().length, 'introduction').toBeGreaterThan(20);
      expect(lang.glossary[mode].length, 'glossary').toBeGreaterThanOrEqual(3);
      lang.glossary[mode].forEach(item => {
        expect(item.term.trim()).not.toBe('');
        expect(item.def.trim().length, item.term).toBeGreaterThan(8);
      });
      expect(lang.tour.steps[mode].length, 'tutorial').toBeGreaterThanOrEqual(3);
    }
  });

  it('the two languages have the same glossary terms in the same order (count)', () => {
    MODES.forEach(mode => expect(es.glossary[mode].length, mode).toBe(en.glossary[mode].length));
  });

  it('explains points and how the app works', () => {
    for (const lang of [es, en]) {
      expect(lang.help.scoring.length).toBeGreaterThanOrEqual(3);
      expect(lang.help.menuSections.length).toBeGreaterThanOrEqual(3);
      lang.help.menuSections.forEach(s => expect(s.text.length).toBeGreaterThan(30));
      expect(lang.story.tipText.length).toBeGreaterThan(40);
    }
  });
});
