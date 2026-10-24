import React, { useEffect, useRef, useState } from 'react';
import { useGameStore, levelMode } from '../../game/GameStore';
import { t, fmt } from '../../i18n';
import { Board2D } from './Board2D';
import { DiagnoseCard } from './DiagnoseCard';
import { GuideCard } from './GuideCard';
import { TourCard } from './TourCard';
import { FeedbackToast } from './FeedbackToast';

/** Height of the top bar of the board, plus the instruction chip, that the pathway must not cover. */
const BASE_INSET = 56;

export const CenterPanel: React.FC = () => {
  const gamePhase = useGameStore(s => s.gamePhase);
  const pendingSourceId = useGameStore(s => s.pendingSourceId);
  const nodes = useGameStore(s => s.nodes);
  const isTutorial = useGameStore(s => !!s.currentLevel?.isTutorial);
  const levelId = useGameStore(s => s.currentLevel?.id);
  const mode = useGameStore(s => levelMode(s.currentLevel));
  const faultFound = useGameStore(s => s.faultFound);
  // The other modes show their tutorial inside their own board
  const touring = useGameStore(s => s.tourMode === 'diagnose' || s.tourMode === 'pathway');
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  const isDiagnose = mode === 'diagnose';
  const showGuide = (isTutorial || isDiagnose || touring) && gamePhase === 'puzzle';
  const guideRef = useRef<HTMLDivElement>(null);
  const [guideHeight, setGuideHeight] = useState(0);

  // Reserve the tallest the card has been, so the pathway does not jump as the card changes
  useEffect(() => {
    const el = guideRef.current;
    setGuideHeight(0);
    if (!showGuide || !el) return;
    const observer = new ResizeObserver(() => setGuideHeight(h => Math.max(h, el.offsetHeight)));
    observer.observe(el);
    return () => observer.disconnect();
  }, [showGuide, levelId, touring]);

  const instruction =
    gamePhase !== 'puzzle'
      ? i18n.board.viewOnly
      : isDiagnose
        ? faultFound ? i18n.diagnose.instructionFix : i18n.diagnose.instructionFind
        : pendingSourceId
          ? fmt(i18n.board.tapSecond, { label: nodes[pendingSourceId]?.label ?? '' })
          : i18n.board.tapFirst;

  return (
    <main className="board graph-paper">
      <Board2D insetTop={BASE_INSET + (guideHeight ? guideHeight + 12 : 0)} />

      <div className={`board__instruction${pendingSourceId ? ' is-pending' : ''}`}>{instruction}</div>
      {showGuide && (
        <div ref={guideRef} className="guide-slot">
          {isDiagnose ? <>{touring && <TourCard />}<DiagnoseCard /></> : isTutorial ? <GuideCard /> : <TourCard />}
        </div>
      )}
      <FeedbackToast />
      <div className="board__controls hide-mobile">{i18n.board.controls}</div>
    </main>
  );
};
