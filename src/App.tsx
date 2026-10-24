import React, { useEffect, useState } from 'react';
import { useGameStore } from './game/GameStore';
import { HUD } from './ui/HUD';
import { LeftPanel } from './ui/components/LeftPanel';
import { CenterPanel } from './ui/components/CenterPanel';
import { RightPanel } from './ui/components/RightPanel';
import { BottomPanel } from './ui/components/BottomPanel';
import { LevelComplete } from './ui/components/LevelComplete';
import { ExplorationView } from './ui/components/ExplorationView';
import { HowToPlay } from './ui/components/HowToPlay';
import { ConstructBoard } from './ui/components/ConstructBoard';
import { SequenceBoard } from './ui/components/SequenceBoard';
import { InheritBoard } from './ui/components/InheritBoard';
import { MutationBoard } from './ui/components/MutationBoard';
import { TuneBoard } from './ui/components/TuneBoard';
import { PairBoard } from './ui/components/PairBoard';
import { CutBoard } from './ui/components/CutBoard';
import { AssembleBoard } from './ui/components/AssembleBoard';
import { CrisprBoard } from './ui/components/CrisprBoard';
import { levelMode } from './game/GameStore';
import { gameEngine } from './core/GameEngine';
import { MainMenu } from './MainMenu';
import { StoryScreen } from './ui/story/StoryScreen';
import { t } from './i18n';

type MobileTab = 'board' | 'goal' | 'piece';

const App: React.FC = () => {
  const gamePhase = useGameStore(s => s.gamePhase);
  const loadLevel = useGameStore(s => s.loadLevel);
  const showHowToPlay = useGameStore(s => s.showHowToPlay);
  const language = useGameStore(s => s.language);
  const mode = useGameStore(s => levelMode(s.currentLevel));
  const [tab, setTab] = useState<MobileTab>('board');
  const i18n = t(language);

  useEffect(() => {
    void gameEngine.initialize();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  if (gamePhase === 'menu') {
    return <MainMenu onStartLevel={loadLevel} />;
  }

  if (gamePhase === 'story') {
    return <StoryScreen />;
  }

  const tabs: Array<{ id: MobileTab; label: string }> = [
    { id: 'board', label: i18n.panel.tabs.board },
    { id: 'goal', label: i18n.panel.tabs.goal },
    { id: 'piece', label: i18n.panel.tabs.piece },
  ];

  return (
    <div className="game">
      <HUD />

      <div className="layout">
        <LeftPanel isOpen={tab === 'goal'} />
        {mode === 'construct' ? <ConstructBoard />
          : mode === 'sequence' ? <SequenceBoard />
          : mode === 'inherit' ? <InheritBoard />
          : mode === 'mutation' ? <MutationBoard />
          : mode === 'tune' ? <TuneBoard />
          : mode === 'pairing' ? <PairBoard />
          : mode === 'cut' ? <CutBoard />
          : mode === 'assemble' ? <AssembleBoard />
          : mode === 'crispr' ? <CrisprBoard />
          : <CenterPanel />}
        <RightPanel isOpen={tab === 'piece'} />
      </div>

      <BottomPanel />

      <nav className="tabbar">
        {tabs.map(tb => (
          <button
            key={tb.id}
            className={tab === tb.id ? 'is-active' : ''}
            onClick={() => setTab(tb.id)}
          >
            {tb.label}
          </button>
        ))}
      </nav>

      {gamePhase === 'exploration' && <ExplorationView />}
      {showHowToPlay && <HowToPlay />}
      <LevelComplete />
    </div>
  );
};

export default App;
