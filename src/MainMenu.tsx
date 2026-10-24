import React, { useState } from 'react';
import { levelLoader } from './levels/LevelLoader';
import { persistence } from './utils/persistence';
import { t, fmt } from './i18n';
import { useGameStore } from './game/GameStore';
import { LanguageSelector } from './ui/components/LanguageSelector';
import { Illustration } from './ui/components/Illustrations';
import { Avatar } from './ui/story/Avatar';
import { ALL_SCENES } from './story/chapters';
import { sceneStates } from './story/progress';
import type { LevelMode, LevelSummary } from './types/level.types';

/** The ways of playing, in the order of the filter. */
const MODE_ORDER: LevelMode[] = [
  'pathway', 'diagnose', 'construct', 'sequence', 'inherit', 'mutation', 'tune', 'pairing', 'cut', 'assemble', 'crispr',
];

const DIFFICULTY_INK: Record<string, string> = {
  tutorial: '#1e2633',
  beginner: '#2f7d4f',
  intermediate: '#a87a0c',
  advanced: '#b4382b',
};

const ART_ACCENT: Record<string, string> = {
  plant: '#3aa36b',
  milk: '#2f5fa8',
  bacterium: '#2f7d6d',
  jellyfish: '#3aa36b',
  corn: '#d9a21b',
  grain: '#e0a526',
  yeast: '#c0532b',
  cheese: '#e0a526',
  bottle: '#2f5fa8',
  tomato: '#8b3a7e',
  blood: '#b4382b',
  shirt: '#2f5fa8',
  jeans: '#2f4f9e',
  flower: '#3aa36b',
  vanilla: '#a87a0c',
  bread: '#c0833a',
  banana: '#d9b21b',
  silk: '#4f5fb0',
  strip: '#2f5fa8',
  burger: '#b4382b',
  wheat: '#d9a21b',
};

const LevelCard: React.FC<{ level: LevelSummary; onStart: (id: string) => void }> = ({ level, onStart }) => {
  const language = useGameStore(s => s.language);
  const i18n = t(language);
  const completed = persistence.isLevelCompleted(level.id);
  const best = persistence.getBestScore(level.id);
  const difficultyKey = level.isTutorial ? 'tutorial' : level.difficulty;

  return (
    <button
      className={`card level-card${level.isTutorial ? ' level-card--tutorial' : ''}`}
      onClick={() => onStart(level.id)}
    >
      <span className="level-card__num">{level.order}</span>
      {level.isTutorial && !completed && <span className="level-card__flag">{i18n.menu.startHere}</span>}
      <div className="level-card__art graph-paper">
        <Illustration kind={level.kind} accent={ART_ACCENT[level.kind]} size={150} />
      </div>
      <div className="level-card__body">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="chip" style={{ color: DIFFICULTY_INK[difficultyKey] }}>
            {i18n.menu.difficulty[difficultyKey]}
          </span>
          {level.mode !== 'pathway' && <span className="chip" style={{ color: 'var(--ink-2)' }}>{i18n.modes[level.mode]}</span>}
          {completed && <span className="chip" style={{ color: 'var(--success)' }}>✓ {i18n.menu.completed}</span>}
        </div>
        <div className="level-card__title">{level.title}</div>
        <div className="muted small">{level.subtitle}</div>
        <div className="italic faint small">{level.organism}</div>
        <div className="level-card__meta">
          <span>{level.estimatedDuration} {i18n.menu.minutes}</span>
          {level.connections > 0 && <span>{level.connections} {{
            pathway: i18n.menu.connections,
            construct: i18n.menu.parts,
            sequence: i18n.menu.steps,
            inherit: i18n.menu.cases,
            diagnose: '',
            mutation: '',
            tune: '',
            pairing: i18n.menu.parts,
            cut: '',
            assemble: '',
            crispr: '',
          }[level.mode]}</span>}
          {completed && <span>{i18n.menu.best}: {best.toLocaleString()} pts</span>}
        </div>
      </div>
    </button>
  );
};

export const MainMenu: React.FC<{ onStartLevel: (levelId: string) => Promise<void> }> = ({ onStartLevel }) => {
  const language = useGameStore(s => s.language);
  const isLoading = useGameStore(s => s.isLoadingLevel);
  const levelError = useGameStore(s => s.levelError);
  const i18n = t(language);
  const levels = levelLoader.getAvailableLevels(language);
  const [showAbout, setShowAbout] = useState(false);
  const [filter, setFilter] = useState<LevelMode | 'all'>('all');
  const [showHelp, setShowHelp] = useState(false);
  const setGamePhase = useGameStore(s => s.setGamePhase);

  const seen = new Set(persistence.getStorySeen());
  const states = sceneStates(seen, id => persistence.isLevelCompleted(id));
  const storyDone = ALL_SCENES.filter(s => states.get(s.id) === 'done').length;
  const storyStarted = storyDone > 0 || seen.size > 0;

  return (
    <div className="menu graph-paper">
      <div className="menu__inner">
        <header className="menu__top">
          <div className="menu__brand">
            <span className="menu__logo">{i18n.menu.title}</span>
            <span className="eyebrow hide-mobile">{i18n.menu.tagline}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn--quiet" onClick={() => setShowHelp(true)}>{i18n.help.button}</button>
            <button className="btn btn--quiet" onClick={() => setShowAbout(true)}>{i18n.menu.about}</button>
            <LanguageSelector />
          </div>
        </header>

        <section className="menu__hero">
          <h1 className="display">
            {i18n.menu.heroLead} <span className="hand">{i18n.menu.heroHand}</span>
          </h1>
          <p>{i18n.menu.intro}</p>
        </section>

        <section className="story-entry card">
          <div className="story-entry__cast">
            <Avatar who="doc" mood="happy" size={84} label={i18n.story.characters.doc} />
            <Avatar who="robot" mood="happy" size={84} label={i18n.story.characters.robot} />
          </div>
          <div className="story-entry__text">
            <span className="eyebrow">{i18n.story.title}</span>
            <h2 className="display">{i18n.story.mapTitle}</h2>
            <p className="muted">{i18n.story.pitch}</p>
            <div className="story-entry__row">
              <button className="btn btn--primary" onClick={() => setGamePhase('story')}>
                {storyStarted ? i18n.story.continue : i18n.story.start}
              </button>
              {storyStarted && <span className="chip">{fmt(i18n.story.progress, { done: storyDone, total: ALL_SCENES.length })}</span>}
            </div>
          </div>
        </section>

        <div className="eyebrow" style={{ marginBottom: 4 }}>{i18n.story.freePlay}</div>
        <p className="muted small" style={{ marginBottom: 12 }}>{i18n.story.freePlayHint}</p>
        <div className="mode-filter" role="group" aria-label={i18n.menu.filterBy}>
          <button className={`mode-chip${filter === 'all' ? ' is-active' : ''}`} onClick={() => setFilter('all')}>
            {i18n.menu.allModes} <span className="mono">{levels.length}</span>
          </button>
          {MODE_ORDER.filter(mode => levels.some(l => l.mode === mode)).map(mode => (
            <button key={mode} className={`mode-chip${filter === mode ? ' is-active' : ''}`} onClick={() => setFilter(mode)}>
              {i18n.modes[mode]} <span className="mono">{levels.filter(l => l.mode === mode).length}</span>
            </button>
          ))}
        </div>
        {filter !== 'all' && <p className="mode-info">{i18n.modeIntro[filter]}</p>}
        <div className="level-grid">
          {levels.filter(l => filter === 'all' || l.mode === filter).map(level => (
            <LevelCard key={level.id} level={level} onStart={id => void onStartLevel(id)} />
          ))}
        </div>

        {isLoading && <p className="faint" style={{ marginTop: 16 }}>{i18n.loading}</p>}
        {levelError && (
          <p className="note-box note-box--trap" style={{ marginTop: 16 }}>
            {i18n.loadError} <span className="mono small">{levelError}</span>
          </p>
        )}
      </div>

      {showHelp && (
        <div className="overlay" onClick={() => setShowHelp(false)}>
          <div className="card modal modal--wide help" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <h2 className="display" style={{ fontSize: 28, marginBottom: 8 }}>{i18n.help.menuTitle}</h2>
            {i18n.help.menuSections.map(section => (
              <section key={section.title} className="help__section">
                <span className="eyebrow">{section.title}</span>
                <p>{section.text}</p>
              </section>
            ))}
            <section className="help__section">
              <span className="eyebrow">{i18n.help.menuModes}</span>
              <dl className="help__terms">
                {MODE_ORDER.map(mode => (
                  <React.Fragment key={mode}>
                    <dt>{i18n.modes[mode]}</dt>
                    <dd>{i18n.modeIntro[mode]}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </section>
            <div className="result__actions">
              <button className="btn btn--primary" onClick={() => setShowHelp(false)}>{i18n.help.close}</button>
            </div>
          </div>
        </div>
      )}

      {showAbout && (
        <div className="overlay" onClick={() => setShowAbout(false)}>
          <div className="card modal" onClick={e => e.stopPropagation()}>
            <h2 className="display" style={{ fontSize: 26, marginBottom: 12 }}>{i18n.menu.title}</h2>
            <p className="muted">{i18n.menu.aboutText}</p>
            <div className="result__actions">
              <button className="btn btn--primary" onClick={() => setShowAbout(false)}>{i18n.menu.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
