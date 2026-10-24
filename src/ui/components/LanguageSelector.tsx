import React from 'react';
import { useGameStore } from '../../game/GameStore';
import type { Language } from '../../i18n';

const OPTIONS: Array<{ id: Language; label: string; name: string }> = [
  { id: 'es', label: 'ES', name: 'Español' },
  { id: 'en', label: 'EN', name: 'English' },
];

export const LanguageSelector: React.FC = () => {
  const language = useGameStore(s => s.language);
  const setLanguage = useGameStore(s => s.setLanguage);

  return (
    <div className="lang" role="group" aria-label="Language">
      {OPTIONS.map(o => (
        <button
          key={o.id}
          className={language === o.id ? 'is-active' : ''}
          onClick={() => setLanguage(o.id)}
          aria-pressed={language === o.id}
          aria-label={o.name}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};
