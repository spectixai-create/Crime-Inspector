'use client';

import { useEffect, useState } from 'react';

export interface TypingIndicatorProps {
  /** Suspect display name (kept for parity with SuspectResponse layout). */
  suspectName: string;
  /** Determines verb form: 'female' → "חושבת", anything else → "חושב". */
  suspectGender?: 'male' | 'female';
  /**
   * Perception buffer in ms before the indicator visually appears.
   * Spec: 600–1000ms (default 700ms). Keeps short replies from
   * flashing the indicator on screen.
   */
  appearAfterMs?: number;
}

/**
 * In-chat "suspect is thinking" indicator.
 *
 * - Lives inside the chat flow (not floating).
 * - Gendered verb: "החשוד חושב…" / "החשודה חושבת…".
 * - Pulsing dots disabled by `prefers-reduced-motion`.
 * - Hidden during the perception buffer so brief replies don't flash it.
 */
export function TypingIndicator({
  suspectName,
  suspectGender,
  appearAfterMs = 700,
}: TypingIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), appearAfterMs);
    return () => window.clearTimeout(id);
  }, [appearAfterMs]);

  if (!visible) return null;

  const subject = suspectGender === 'female' ? 'החשודה' : 'החשוד';
  const verb = suspectGender === 'female' ? 'חושבת' : 'חושב';

  return (
    <div className="chat-row chat-row--suspect" aria-live="polite">
      <span className="chat-label">{suspectName}</span>
      <div
        className="chat-bubble chat-bubble--suspect"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          maxWidth: 'min(720px, 80%)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontStyle: 'italic',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-body-size)',
          }}
        >
          {subject} {verb}…
        </span>
        <span style={{ display: 'inline-flex', gap: 4 }} aria-hidden>
          {[0, 0.2, 0.4].map((delay, i) => (
            <span
              key={i}
              className="animate-blink"
              style={{
                width: 7,
                height: 7,
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-gold-primary)',
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
