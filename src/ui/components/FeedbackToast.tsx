import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useGameStore } from '../../game/GameStore';

/** The latest game message (right, wrong, bonus…), shown at the bottom of the board. */
export const FeedbackToast: React.FC = () => {
  const feedback = useGameStore(s => s.feedback);
  const feedbackKey = useGameStore(s => s.feedbackKey);
  const [hiddenKey, setHiddenKey] = React.useState(-1);

  // Messages fade out on their own so they never block the board for long
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setHiddenKey(feedbackKey), feedback.tone === 'error' ? 9000 : 6000);
    return () => window.clearTimeout(timer);
  }, [feedback, feedbackKey]);

  if (!feedback || hiddenKey === feedbackKey) return null;
  return (
    <div className={`toast toast--${feedback.tone}`} key={feedbackKey} role="status">
      <button className="toast__close" onClick={() => setHiddenKey(feedbackKey)} aria-label="close">
        <X size={14} />
      </button>
      <div className="toast__title">{feedback.title}</div>
      {feedback.detail && <div className="toast__detail">{feedback.detail}</div>}
    </div>
  );
};
