import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { t, localize } from '../../i18n';
import { chapterOf, findScene, type Line } from '../../story/chapters';
import { beatCount, useStoryStore } from '../../story/StoryStore';
import type { Mood, Speaker } from '../../story/tools';
import { Avatar } from './Avatar';
import { ToolIcon, TOOL_INK } from './ToolIcon';

/** Mood of each character: the one of their latest line up to the current beat. */
function moodsAt(lines: Line[], upTo: number): Record<Speaker, Mood> {
  const moods: Record<Speaker, Mood> = { doc: 'neutral', robot: 'neutral' };
  lines.slice(0, upTo + 1).forEach(l => { moods[l.who] = l.mood; });
  return moods;
}

/** One scene of the story: the Doctor and Pipo talking, one line at a time. */
export const StoryScene: React.FC = () => {
  const sceneId = useStoryStore(s => s.sceneId);
  const stage = useStoryStore(s => s.stage);
  const beat = useStoryStore(s => s.beat);
  const advance = useStoryStore(s => s.advance);
  const skip = useStoryStore(s => s.skip);
  const leaveToMap = useStoryStore(s => s.leaveToMap);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  // Space, Enter or the right arrow tell the next line
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); advance(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance]);

  const rawScene = sceneId ? findScene(sceneId) : undefined;
  if (!rawScene || !sceneId) return null;
  const scene = localize(rawScene, language);
  const where = chapterOf(sceneId);
  const chapter = where ? localize(where.chapter, language) : undefined;

  const lines = stage === 'before' ? scene.before : scene.after;
  const total = beatCount(scene, stage);
  const isToolBeat = stage === 'before' && !!scene.tool && beat === lines.length;
  const line = isToolBeat ? undefined : lines[beat];
  const moods = moodsAt(lines, Math.min(beat, lines.length - 1));
  const isLast = beat === total - 1;
  const nextLabel = !isLast
    ? i18n.story.next
    : stage === 'before' && scene.level ? i18n.story.toWork : i18n.story.backToMap;

  return (
    <div className="story-scene graph-paper" onClick={advance}>
      <header className="story-scene__top" onClick={e => e.stopPropagation()}>
        <button className="btn btn--quiet" onClick={leaveToMap} aria-label={i18n.story.backToMap}>
          <ArrowLeft size={16} /> <span className="hide-mobile">{i18n.story.backToMap}</span>
        </button>
        <div className="story-scene__where">
          {chapter && <span className="chip">{chapter.era}</span>}
          <span className="display">{chapter?.title}</span>
        </div>
        <button className="btn btn--quiet" onClick={skip}>{i18n.story.skip}</button>
      </header>

      <div className="story-scene__stage">
        <Avatar who="doc" mood={moods.doc} size={150} label={i18n.story.characters.doc}
          dim={!isToolBeat && line?.who !== 'doc'} />
        <Avatar who="robot" mood={moods.robot} size={150} label={i18n.story.characters.robot}
          dim={!isToolBeat && line?.who !== 'robot'} />
      </div>

      <div className="story-scene__box card" key={`${stage}-${beat}`} onClick={e => { e.stopPropagation(); advance(); }}>
        {isToolBeat && scene.tool ? (
          <div className="story-tool">
            <span style={{ color: TOOL_INK[scene.tool] }}><ToolIcon tool={scene.tool} size={64} /></span>
            <div>
              <span className="eyebrow">{i18n.story.newTool}</span>
              <div className="story-tool__name display">{i18n.story.tools[scene.tool].name}</div>
              <p className="muted">{i18n.story.tools[scene.tool].desc}</p>
            </div>
          </div>
        ) : line ? (
          <>
            <span className="eyebrow">{i18n.story.characters[line.who]}</span>
            <p className="story-scene__text">{line.text}</p>
          </>
        ) : null}
        <div className="story-scene__actions">
          <span className="mono small faint">{beat + 1}/{total}</span>
          <button className="btn btn--primary" onClick={e => { e.stopPropagation(); advance(); }}>{nextLabel}</button>
        </div>
      </div>
    </div>
  );
};
