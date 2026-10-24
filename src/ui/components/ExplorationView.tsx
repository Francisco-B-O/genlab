import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';
import { t } from '../../i18n';
import { Illustration } from './Illustrations';

const ACCENTS = ['#2f7d6d', '#a87a0c', '#2f5fa8', '#8b3a7e', '#c0532b'];

/** Zooms from the organism down to the pathway before the puzzle starts. */
export const ExplorationView: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const setGamePhase = useGameStore(s => s.setGamePhase);
  const language = useGameStore(s => s.language);
  const i18n = t(language);
  const [index, setIndex] = useState(0);

  const scales = currentLevel?.exploration ?? [];
  const scale = scales[index];
  if (!scale) return null;

  const isLast = index === scales.length - 1;
  const next = () => (isLast ? setGamePhase('puzzle') : setIndex(i => i + 1));

  return (
    <div className="overlay overlay--paper graph-paper" style={{ zIndex: 50 }}>
      <div className="explore">
        <div className="explore__scales">
          {scales.map((s, i) => (
            <span
              key={i}
              className={`explore__scale${i === index ? ' is-current' : i < index ? ' is-past' : ''}`}
            >
              {s.label}
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
          >
            <Illustration kind={scale.kind} accent={ACCENTS[index % ACCENTS.length]} size={240} />
            <span className="eyebrow">{i18n.exploration.scale}: {scale.label}</span>
            <h2 className="display">{scale.title}</h2>
            <p>{scale.description}</p>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {!isLast && (
            <button className="btn btn--quiet" onClick={() => setGamePhase('puzzle')}>
              {i18n.exploration.skip}
            </button>
          )}
          <button className="btn btn--primary btn--lg" onClick={next}>
            {isLast ? i18n.exploration.start : i18n.exploration.next} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
