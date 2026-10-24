import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Lock, Play } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { t, fmt, localize } from '../../i18n';
import { ALL_SCENES, CHAPTERS } from '../../story/chapters';
import { sceneStates, unlockedTools } from '../../story/progress';
import { TOOLS } from '../../story/tools';
import { useStoryStore } from '../../story/StoryStore';
import { persistence } from '../../utils/persistence';
import { LanguageSelector } from '../components/LanguageSelector';
import { Illustration } from '../components/Illustrations';
import { Avatar } from './Avatar';
import { ToolIcon, TOOL_INK } from './ToolIcon';

const ART_ACCENT: Record<string, string> = {
  flask: '#2f5fa8',
  bread: '#c0833a',
  plant: '#3aa36b',
  dna: '#8b3a7e',
  bacterium: '#2f7d6d',
  jellyfish: '#3aa36b',
  cell: '#2f5fa8',
  burger: '#b4382b',
  jeans: '#2f4f9e',
  wheat: '#d9a21b',
  blood: '#b4382b',
};

const TIPS_KEY = 'biogen_seen_tips';

function tipSeen(): boolean {
  try { return (JSON.parse(localStorage.getItem(TIPS_KEY) ?? '[]') as string[]).includes('story-map'); } catch { return false; }
}

function markTipSeen(): void {
  try { localStorage.setItem(TIPS_KEY, JSON.stringify([...(JSON.parse(localStorage.getItem(TIPS_KEY) ?? '[]') as string[]), 'story-map'])); } catch { /* storage unavailable */ }
}

/** The timeline of the story: chapters and scenes, plus the toolbox with what is unlocked so far. */
export const StoryMap: React.FC = () => {
  const language = useGameStore(s => s.language);
  const setGamePhase = useGameStore(s => s.setGamePhase);
  const openScene = useStoryStore(s => s.openScene);
  const i18n = t(language);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [showTip, setShowTip] = useState(() => !tipSeen());

  const seen = new Set(persistence.getStorySeen());
  const completed = (id: string) => persistence.isLevelCompleted(id);
  const states = sceneStates(seen, completed);
  const tools = unlockedTools(seen, completed);
  const doneCount = ALL_SCENES.filter(s => states.get(s.id) === 'done').length;
  const nextId = ALL_SCENES.find(s => states.get(s.id) === 'available')?.id;

  // Bring the scene to play next into view; on the first visit stay at the top, where the guide is
  useEffect(() => {
    if (doneCount > 0) nextRef.current?.scrollIntoView({ block: 'center' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="story-map graph-paper">
      <div className="story-map__inner">
        <header className="menu__top">
          <button className="btn btn--quiet" onClick={() => setGamePhase('menu')}>
            <ArrowLeft size={16} /> {i18n.story.menu}
          </button>
          <LanguageSelector />
        </header>

        <section className="story-map__hero">
          <div className="story-map__cast">
            <Avatar who="doc" mood="happy" size={92} label={i18n.story.characters.doc} />
            <Avatar who="robot" mood="neutral" size={92} label={i18n.story.characters.robot} />
          </div>
          <div>
            <h1 className="display">{i18n.story.mapTitle}</h1>
            <p className="muted">{i18n.story.mapHint}</p>
            <span className="chip">{fmt(i18n.story.progress, { done: doneCount, total: ALL_SCENES.length })}</span>
          </div>
        </section>

        {showTip && (
          <div className="card story-tip">
            <strong>{i18n.story.tipTitle}</strong>
            <p className="muted">{i18n.story.tipText}</p>
            <button className="btn btn--ghost" onClick={() => { markTipSeen(); setShowTip(false); }}>{i18n.story.tipClose}</button>
          </div>
        )}

        <div className="eyebrow" style={{ margin: '4px 0 10px' }}>{i18n.story.toolbox}</div>
        <div className="toolbox">
          {TOOLS.map(tool => {
            const open = tools.has(tool);
            return (
              <div key={tool} className={`toolbox__tool${open ? '' : ' is-locked'}`} title={open ? i18n.story.tools[tool].desc : i18n.story.toolLocked}>
                <span style={{ color: TOOL_INK[tool] }}><ToolIcon tool={tool} size={40} /></span>
                <span className="toolbox__name">{i18n.story.tools[tool].name}</span>
                {!open && <Lock size={12} className="toolbox__lock" />}
              </div>
            );
          })}
        </div>

        <div className="timeline">
          {CHAPTERS.map((rawChapter, index) => {
            const chapter = localize(rawChapter, language);
            return (
              <section key={chapter.id} className="chapter card">
                <header className="chapter__head">
                  <div className="chapter__art graph-paper">
                    <Illustration kind={chapter.kind} accent={ART_ACCENT[chapter.kind]} size={92} />
                  </div>
                  <div>
                    <span className="eyebrow">{fmt(i18n.story.chapter, { n: index })} · {chapter.era}</span>
                    <h2 className="display chapter__title">{chapter.title}</h2>
                  </div>
                </header>
                <div className="chapter__scenes">
                  {chapter.scenes.map(scene => {
                    const state = states.get(scene.id) ?? 'locked';
                    return (
                      <button
                        key={scene.id}
                        ref={scene.id === nextId ? nextRef : undefined}
                        className={`scene-row is-${state}`}
                        disabled={state === 'locked'}
                        data-scene={scene.id}
                        data-scene-state={state}
                        onClick={() => openScene(scene.id)}
                      >
                        <span className="scene-row__state">
                          {state === 'done' ? <Check size={15} /> : state === 'available' ? <Play size={14} /> : <Lock size={13} />}
                        </span>
                        <span className="scene-row__title">{scene.title}</span>
                        {scene.tool && (
                          <span className="scene-row__tool" style={{ color: TOOL_INK[scene.tool] }} title={i18n.story.tools[scene.tool].name}>
                            <ToolIcon tool={scene.tool} size={24} />
                          </span>
                        )}
                        <span className="scene-row__hint">{i18n.story.scene[state]}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};
