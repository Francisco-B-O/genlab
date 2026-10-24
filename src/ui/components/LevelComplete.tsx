import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, RotateCcw } from 'lucide-react';
import { useGameStore, levelMode } from '../../game/GameStore';
import { levelLoader } from '../../levels/LevelLoader';
import { t } from '../../i18n';
import { useStoryStore } from '../../story/StoryStore';

export const LevelComplete: React.FC = () => {
  const gamePhase = useGameStore(s => s.gamePhase);
  const currentLevel = useGameStore(s => s.currentLevel);
  const score = useGameStore(s => s.score);
  const hintsUsed = useGameStore(s => s.hintsUsed);
  const wrongConnections = useGameStore(s => s.wrongConnections);
  const resetLevel = useGameStore(s => s.resetLevel);
  const setGamePhase = useGameStore(s => s.setGamePhase);
  const loadLevel = useGameStore(s => s.loadLevel);
  const inStory = useStoryStore(s => s.activeSceneId !== null);
  const resumeStory = useStoryStore(s => s.resume);
  const leaveToMap = useStoryStore(s => s.leaveToMap);
  const language = useGameStore(s => s.language);
  const i18n = t(language);

  if (gamePhase !== 'complete' || !currentLevel) return null;

  const { science, completion } = currentLevel;
  // In the story the way on is the next scene, not the next level of the list
  const nextId = inStory ? null : levelLoader.getNextLevelId(currentLevel.id);
  const nextTitle = nextId ? levelLoader.getAvailableLevels(language).find(l => l.id === nextId)?.title : null;

  const breakdown = [
    { label: levelMode(currentLevel) === 'pathway' ? i18n.complete.breakdown.base : i18n.complete.breakdown.baseOther, value: score.base },
    { label: i18n.complete.breakdown.noHints, value: score.bonusNoHints },
    { label: i18n.complete.breakdown.clean, value: score.bonusNoPenalties },
    { label: i18n.complete.breakdown.speed, value: score.bonusSpeed },
    { label: i18n.complete.breakdown.optional, value: score.bonusOptional },
    { label: i18n.complete.breakdown.penalties, value: score.penalties },
  ].filter(b => b.value !== 0);

  return (
    <div className="overlay">
      <motion.div
        className="card modal modal--wide"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 220 }}
      >
        <span className="chip" style={{ color: 'var(--success)' }}>✓ {i18n.complete.badge}</span>
        <h2 className="display" style={{ fontSize: 32, margin: '10px 0 4px' }}>{completion.title}</h2>
        <p className="muted">
          {currentLevel.title} · <span className="italic">{currentLevel.organism.scientificName}</span>
        </p>

        <div className="result__stats">
          <div className="card result__stat">
            <strong>{score.total.toLocaleString()}</strong>
            <span className="eyebrow">{i18n.complete.score}</span>
          </div>
          <div className="card result__stat">
            <strong>{hintsUsed}</strong>
            <span className="eyebrow">{i18n.complete.hints}</span>
          </div>
          <div className="card result__stat">
            <strong>{wrongConnections}</strong>
            <span className="eyebrow">{i18n.complete.mistakes}</span>
          </div>
        </div>

        {breakdown.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
            {breakdown.map(b => (
              <span key={b.label} className="chip" style={{ color: b.value < 0 ? 'var(--error)' : 'var(--ink-2)' }}>
                {b.label} {b.value > 0 ? '+' : ''}{b.value}
              </span>
            ))}
          </div>
        )}

        <div className="result__block">
          <span className="eyebrow">{i18n.complete.whatYouBuilt}</span>
          <p>{completion.summary}</p>
        </div>

        {completion.realWorldImpact && (
          <div className="result__block">
            <span className="eyebrow">{i18n.complete.impact}</span>
            <p>{completion.realWorldImpact}</p>
          </div>
        )}

        <div className="result__block">
          <span className="eyebrow">{i18n.complete.science}</span>
          <p>{science.scientificContext}</p>
        </div>

        <div className="result__block">
          <span className="eyebrow">{i18n.complete.simplifications}</span>
          <ul>{science.gameplaySimplifications.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>

        <div className="result__block">
          <span className="eyebrow">{i18n.complete.references}</span>
          <div className="result__refs">
            {science.references.map((ref, i) => {
              const href = ref.doi ? `https://doi.org/${ref.doi}` : ref.url;
              return (
                <div key={i}>
                  {ref.authors.slice(0, 3).join(', ')}{ref.authors.length > 3 ? ' et al.' : ''} ({ref.year}).{' '}
                  <em>{ref.title}</em>{ref.journal ? `. ${ref.journal}` : ''}.{' '}
                  {href && (
                    <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      {ref.doi ? 'DOI' : 'Link'} <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="result__actions">
          <button className="btn btn--quiet" onClick={resetLevel}>
            <RotateCcw size={14} /> {i18n.complete.replay}
          </button>
          {inStory ? (
            <>
              <button className="btn btn--ghost" onClick={leaveToMap}>{i18n.story.backToMap}</button>
              <button className="btn btn--primary" onClick={resumeStory}>
                {i18n.story.continueStory} <ArrowRight size={15} />
              </button>
            </>
          ) : (
            <button className="btn btn--ghost" onClick={() => setGamePhase('menu')}>{i18n.complete.menu}</button>
          )}
          {nextId && (
            <button className="btn btn--primary" onClick={() => void loadLevel(nextId)}>
              {i18n.complete.next}{nextTitle ? `: ${nextTitle}` : ''} <ArrowRight size={15} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
