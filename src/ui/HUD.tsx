import React, { useState } from 'react';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useGameStore, selectProgress } from '../game/GameStore';
import { t } from '../i18n';
import { LanguageSelector } from './components/LanguageSelector';
import { useStoryStore } from '../story/StoryStore';
import { HelpModal } from './components/HelpModal';

export const HUD: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const score = useGameStore(s => s.score);
  const satisfied = useGameStore(s => selectProgress(s).done);
  const total = useGameStore(s => selectProgress(s).total);
  const setGamePhase = useGameStore(s => s.setGamePhase);
  const inStory = useStoryStore(s => s.activeSceneId !== null);
  const leaveToMap = useStoryStore(s => s.leaveToMap);
  const language = useGameStore(s => s.language);
  const [helpOpen, setHelpOpen] = useState(false);

  if (!currentLevel) return null;

  const i18n = t(language);

  return (
    <>
    <header className="topbar">
      <button className="btn btn--quiet" onClick={() => (inStory ? leaveToMap() : setGamePhase('menu'))} aria-label={i18n.hud.menu}>
        <ArrowLeft size={16} />
        <span className="hide-mobile">{i18n.hud.menu}</span>
      </button>

      <div className="topbar__title">
        <div className="display">{currentLevel.title}</div>
        <div className="italic">{currentLevel.organism.scientificName}</div>
      </div>

      <div className="topbar__spacer" />

      <div className="topbar__progress" title={i18n.panel.progress}>
        <div className="progress"><div style={{ width: `${total ? (satisfied / total) * 100 : 0}%` }} /></div>
        <span className="mono small">{satisfied}/{total}</span>
      </div>

      <div className="topbar__score hide-mobile">
        {score.total.toLocaleString()} {i18n.hud.points}
      </div>

      <button className="btn btn--quiet" onClick={() => setHelpOpen(true)} aria-label={i18n.help.button}>
        <HelpCircle size={16} />
        <span className="hide-mobile">{i18n.help.button}</span>
      </button>

      <LanguageSelector />
    </header>
    {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </>
  );
};
