'use client';

import { useEffect } from 'react';
import { useGame } from '@/lib/gameState';

export function AssistantPanel() {
  const assistantOpen = useGame((s) => s.assistantOpen);
  const assistantLoading = useGame((s) => s.assistantLoading);
  const assistantError = useGame((s) => s.assistantError);
  const assistantSuggestions = useGame((s) => s.assistantSuggestions);
  const closeAssistant = useGame((s) => s.closeAssistant);
  const fillFromSuggestion = useGame((s) => s.fillFromSuggestion);

  // ESC to close
  useEffect(() => {
    if (!assistantOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAssistant();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [assistantOpen, closeAssistant]);

  if (!assistantOpen) return null;

  return (
    <div className="assistant-panel-overlay" onClick={closeAssistant} role="dialog" aria-modal="true">
      <div className="assistant-panel" onClick={(e) => e.stopPropagation()}>
        <div className="assistant-panel-header">
          <div className="assistant-panel-title">
            <span className="assistant-panel-icon">👁</span>
            <div>
              <h3>העוזר מציע ארבעה כיווני חקירה</h3>
              <p>מאחורי הזכוכית החד-כיוונית. השתמש בזהירות.</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={closeAssistant}>
            סגור ✕
          </button>
        </div>

        {assistantLoading ? (
          <div className="assistant-loading">
            <span className="assistant-pulse">●●●</span>
            <span>העוזר מנתח את הראיות והשיחה...</span>
          </div>
        ) : assistantError ? (
          <div className="assistant-loading">
            <span style={{ color: 'var(--danger)', fontSize: 'var(--fs-md)' }}>⚠</span>
            <span>העוזר אינו זמין כעת.</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
              {assistantError}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={closeAssistant} style={{ marginTop: '0.5rem' }}>
              סגור
            </button>
          </div>
        ) : (
          <div className="assistant-suggestions">
            {assistantSuggestions.map((s, i) => (
              <button
                key={i}
                className={`suggestion-card suggestion-${s.type}`}
                onClick={() => fillFromSuggestion(s.text)}
                type="button"
              >
                <div className="suggestion-label">
                  {s.type === 'question' ? 'שאלה מוכנה' : 'כיוון אסטרטגי'}
                </div>
                <div className="suggestion-text">{s.text}</div>
              </button>
            ))}
          </div>
        )}

        <div className="assistant-panel-footer">
          <p>כל שימוש בעוזר קובע תקרת ניקוד של 4 כוכבים בלבד.</p>
        </div>
      </div>
    </div>
  );
}
